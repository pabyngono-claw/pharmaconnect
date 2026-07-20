import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/splash/presentation/splash_screen.dart';

/// Navigation router configuration utilizing GoRouter.
/// Integrates all three user-role stacks (patient, pharmacy, admin).
class PCRouter {
  PCRouter._();

  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: <RouteBase>[
      // Transit Splash Gate
      GoRoute(
        path: '/',
        builder: (BuildContext context, GoRouterState state) {
          return const SplashScreen();
        },
      ),

      // Auth Path
      GoRoute(
        path: '/login',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'Login Screen (Patient/User)');
        },
      ),

      // ==========================================
      // PATIENT STACK
      // ==========================================
      GoRoute(
        path: '/requests/new',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'New Request Form');
        },
      ),
      GoRoute(
        path: '/requests/:id',
        builder: (BuildContext context, GoRouterState state) {
          final id = state.pathParameters['id'] ?? '';
          return _PlaceholderScreen(title: 'Request Details (ID: $id)');
        },
      ),
      GoRoute(
        path: '/requests/:id/pharmacies',
        builder: (BuildContext context, GoRouterState state) {
          final id = state.pathParameters['id'] ?? '';
          return _PlaceholderScreen(title: 'Select Pharmacies for Request $id');
        },
      ),
      GoRoute(
        path: '/reservations/:id',
        builder: (BuildContext context, GoRouterState state) {
          final id = state.pathParameters['id'] ?? '';
          return _PlaceholderScreen(title: 'Reservation Status (ID: $id)');
        },
      ),
      GoRoute(
        path: '/profile',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'Patient Profile Settings');
        },
      ),

      // ==========================================
      // PHARMACY STACK
      // ==========================================
      GoRoute(
        path: '/pharmacy/login',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'Pharmacy Staff Login');
        },
      ),
      GoRoute(
        path: '/pharmacy/dashboard',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'Pharmacy Operational Dashboard');
        },
      ),
      GoRoute(
        path: '/pharmacy/requests/:id',
        builder: (BuildContext context, GoRouterState state) {
          final id = state.pathParameters['id'] ?? '';
          return _PlaceholderScreen(title: 'Inbound Request Detail (ID: $id)');
        },
      ),
      GoRoute(
        path: '/pharmacy/waiting-list',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'Pharmacy Waiting List Queue');
        },
      ),
      GoRoute(
        path: '/pharmacy/profile',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'Pharmacy Business Profile');
        },
      ),

      // ==========================================
      // ADMIN STACK
      // ==========================================
      GoRoute(
        path: '/admin/login',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'Admin Gate Login');
        },
      ),
      GoRoute(
        path: '/admin/pharmacies',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'Pharmacy License Approval Queue');
        },
      ),
      GoRoute(
        path: '/admin/pharmacies/:id/review',
        builder: (BuildContext context, GoRouterState state) {
          final id = state.pathParameters['id'] ?? '';
          return _PlaceholderScreen(title: 'License Review Detail (ID: $id)');
        },
      ),
      GoRoute(
        path: '/admin/requests',
        builder: (BuildContext context, GoRouterState state) {
          return const _PlaceholderScreen(title: 'System Wide Broadcast Logs');
        },
      ),
    ],
    errorBuilder: (BuildContext context, GoRouterState state) {
      return const _PlaceholderScreen(title: 'Page Not Found (404)');
    },
  );
}

/// Generic, accessible layout template for under-construction routes.
/// Helps developers confirm routing logic without bloating codebase with early screens.
class _PlaceholderScreen extends StatelessWidget {
  const _PlaceholderScreen({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        leading: context.canPop()
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.pop(),
              )
            : null,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Icon(
                Icons.construction,
                size: 64.0,
                color: Color(0xFF718096),
              ),
              const SizedBox(height: 16.0),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18.0,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF4A5568),
                ),
              ),
              const SizedBox(height: 8.0),
              const Text(
                'This screen is placeholder-gated under Milestone 1 specs.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14.0,
                  color: Color(0xFF718096),
                ),
              ),
              const SizedBox(height: 24.0),
              ElevatedButton(
                onPressed: () => context.go('/'),
                child: const Text('Back to Splash'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
