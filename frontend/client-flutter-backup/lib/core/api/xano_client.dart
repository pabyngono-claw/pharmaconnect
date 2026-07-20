import 'dart:convert';
import 'package:http/http.dart' as http;
import '../secure_storage/secure_storage.dart';
import '../logging/logger.dart';
import '../error/error_handler.dart';

/// Client to communicate with the Xano backend API.
/// Incorporates interceptors for auth token injection, automatic refresh token
/// rotation on 401, and idempotency headers for mutations.
class XanoClient {
  XanoClient({
    required this.baseUrl,
    required this.storage,
    required this.logger,
    http.Client? httpClient,
  }) : _client = httpClient ?? http.Client();

  final String baseUrl;
  final PCSecureStorage storage;
  final PCLogger logger;
  final http.Client _client;

  /// Global request interceptor setting base headers.
  Future<Map<String, String>> _getRequestHeaders({
    String? idempotencyKey,
    bool forceSkipAuth = false,
  }) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (idempotencyKey != null && idempotencyKey.isNotEmpty) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    if (!forceSkipAuth) {
      final accessToken = await storage.readAccessToken();
      if (accessToken != null && accessToken.isNotEmpty) {
        headers['Authorization'] = 'Bearer $accessToken';
      }
    }

    return headers;
  }

  /// Sends a GET request.
  Future<http.Response> get(String path, {Map<String, String>? queryParameters}) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: queryParameters);
    logger.debug('API GET Request: $uri');

    try {
      final headers = await _getRequestHeaders();
      final response = await _client.get(uri, headers: headers);
      return _handleResponse(response, () => get(path, queryParameters: queryParameters));
    } catch (e, stack) {
      logger.error('API GET Exception', e, stack);
      throw PCException.fromNetworkError(e);
    }
  }

  /// Sends a POST request, automatically wrapping mutations with idempotency.
  Future<http.Response> post(
    String path, {
    dynamic body,
    String? idempotencyKey,
    bool skipAuth = false,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    logger.debug('API POST Request: $uri');

    try {
      final headers = await _getRequestHeaders(
        idempotencyKey: idempotencyKey,
        forceSkipAuth: skipAuth,
      );
      final response = await _client.post(
        uri,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(
        response,
        () => post(path, body: body, idempotencyKey: idempotencyKey, skipAuth: skipAuth),
      );
    } catch (e, stack) {
      logger.error('API POST Exception', e, stack);
      throw PCException.fromNetworkError(e);
    }
  }

  /// Sends a PUT request.
  Future<http.Response> put(
    String path, {
    dynamic body,
    String? idempotencyKey,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    logger.debug('API PUT Request: $uri');

    try {
      final headers = await _getRequestHeaders(idempotencyKey: idempotencyKey);
      final response = await _client.put(
        uri,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(
        response,
        () => put(path, body: body, idempotencyKey: idempotencyKey),
      );
    } catch (e, stack) {
      logger.error('API PUT Exception', e, stack);
      throw PCException.fromNetworkError(e);
    }
  }

  /// Sends a DELETE request.
  Future<http.Response> delete(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    logger.debug('API DELETE Request: $uri');

    try {
      final headers = await _getRequestHeaders();
      final response = await _client.delete(uri, headers: headers);
      return _handleResponse(response, () => delete(path));
    } catch (e, stack) {
      logger.error('API DELETE Exception', e, stack);
      throw PCException.fromNetworkError(e);
    }
  }

  /// Processes raw HTTP responses, managing status codes and token rotation.
  Future<http.Response> _handleResponse(
    http.Response response,
    Future<http.Response> Function() retryCallback,
  ) async {
    logger.debug('API Response [${response.statusCode}] for: ${response.request?.url}');

    if (response.statusCode == 200 || response.statusCode == 201) {
      return response;
    }

    // Handles Token Expiration Interceptor
    if (response.statusCode == 401) {
      final hasRefreshed = await _attemptTokenRotation();
      if (hasRefreshed) {
        logger.info('Token rotated successfully. Retrying original API call.');
        return retryCallback();
      } else {
        logger.warning('Session expired. Evicting local secure keys.');
        await storage.clearAll();
        throw const PCException(
          code: 'SESSION_EXPIRED',
          message: 'Votre session a expiré. Veuillez vous reconnecter.',
        );
      }
    }

    // Parse Error Envelope
    throw PCException.fromResponse(response);
  }

  /// Rotates expired Access Tokens using the local Refresh Token.
  /// Strictly revokes the previous token state upon exchange.
  Future<bool> _attemptTokenRotation() async {
    logger.info('401 detected. Initiating access token refresh.');
    final refreshToken = await storage.readRefreshToken();

    if (refreshToken == null || refreshToken.isEmpty) {
      logger.warning('No refresh token present in secure storage.');
      return false;
    }

    final uri = Uri.parse('$baseUrl/auth/refresh');
    try {
      final response = await _client.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({'refresh_token': refreshToken}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final newAccessToken = data['access_token'] as String;
        final newRefreshToken = data['refresh_token'] as String;

        await storage.writeTokens(
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        );
        return true;
      } else {
        logger.error('Refresh token exchange failed: [${response.statusCode}]');
        return false;
      }
    } catch (e, stack) {
      logger.error('Token rotation network failure', e, stack);
      return false;
    }
  }
}
