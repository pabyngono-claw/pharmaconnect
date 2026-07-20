import 'package:flutter/material.dart';
import 'pc_tokens.dart';

/// Configured Material3 theme mapping tokens onto Flutter widgets.
/// Enforces outline-only container borders and flat aesthetics.
class PCTheme {
  PCTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: PCTokens.primary,
        onPrimary: PCTokens.surface,
        secondary: PCTokens.secondary,
        onSecondary: PCTokens.surface,
        error: PCTokens.error,
        onError: PCTokens.surface,
        background: PCTokens.background,
        onBackground: PCTokens.neutral,
        surface: PCTokens.surface,
        onSurface: PCTokens.neutral,
      ),
      fontFamily: PCTokens.fontFamilySecondary,
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontFamily: PCTokens.fontFamilyPrimary,
          fontSize: 32.0,
          fontWeight: FontWeight.bold,
          color: PCTokens.primary,
        ),
        displayMedium: TextStyle(
          fontFamily: PCTokens.fontFamilyPrimary,
          fontSize: 28.0,
          fontWeight: FontWeight.bold,
          color: PCTokens.primary,
        ),
        headlineLarge: TextStyle(
          fontFamily: PCTokens.fontFamilyPrimary,
          fontSize: 24.0,
          fontWeight: FontWeight.w600,
          color: PCTokens.primary,
        ),
        headlineMedium: TextStyle(
          fontFamily: PCTokens.fontFamilyPrimary,
          fontSize: 20.0,
          fontWeight: FontWeight.w600,
          color: PCTokens.primary,
        ),
        bodyLarge: TextStyle(
          fontFamily: PCTokens.fontFamilySecondary,
          fontSize: 16.0,
          fontWeight: FontWeight.normal,
          color: PCTokens.neutral,
        ),
        bodyMedium: TextStyle(
          fontFamily: PCTokens.fontFamilySecondary,
          fontSize: 14.0,
          fontWeight: FontWeight.normal,
          color: PCTokens.neutral,
        ),
        labelLarge: TextStyle(
          fontFamily: PCTokens.fontFamilySecondary,
          fontSize: 14.0,
          fontWeight: FontWeight.w500,
          color: PCTokens.neutral,
        ),
        labelSmall: TextStyle(
          fontFamily: PCTokens.fontFamilySecondary,
          fontSize: 12.0,
          fontWeight: FontWeight.w500,
          color: PCTokens.neutralSecondary,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: PCTokens.surface,
        foregroundColor: PCTokens.primary,
        elevation: 0,
        scrolledUnderElevation: 0,
        shape: Border(
          bottom: BorderSide(color: PCTokens.border, width: 1.0),
        ),
      ),
      buttonTheme: const ButtonThemeData(
        height: PCTokens.unit12,
        minWidth: 88.0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: PCTokens.primary,
          foregroundColor: PCTokens.surface,
          elevation: 0,
          minimumSize: const Size(88.0, PCTokens.unit12),
          padding: const EdgeInsets.symmetric(
            horizontal: PCTokens.unit6,
            vertical: PCTokens.unit3,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(PCTokens.radiusSmall),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: PCTokens.primary,
          side: const BorderSide(color: PCTokens.primary, width: 1.0),
          minimumSize: const Size(88.0, PCTokens.unit12),
          padding: const EdgeInsets.symmetric(
            horizontal: PCTokens.unit6,
            vertical: PCTokens.unit3,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(PCTokens.radiusSmall),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: PCTokens.surface,
        contentPadding: const EdgeInsets.all(PCTokens.unit4),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(PCTokens.radiusSmall),
          borderSide: const BorderSide(color: PCTokens.border, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(PCTokens.radiusSmall),
          borderSide: const BorderSide(color: PCTokens.border, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(PCTokens.radiusSmall),
          borderSide: const BorderSide(color: PCTokens.primary, width: 2.0),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(PCTokens.radiusSmall),
          borderSide: const BorderSide(color: PCTokens.error, width: 1.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(PCTokens.radiusSmall),
          borderSide: const BorderSide(color: PCTokens.error, width: 2.0),
        ),
        labelStyle: const TextStyle(
          color: PCTokens.neutralSecondary,
          fontSize: 14.0,
          fontFamily: PCTokens.fontFamilySecondary,
        ),
      ),
      cardTheme: CardTheme(
        color: PCTokens.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(PCTokens.radiusMedium),
          side: const BorderSide(color: PCTokens.border, width: 1.0),
        ),
        margin: EdgeInsets.zero,
      ),
    );
  }
}
