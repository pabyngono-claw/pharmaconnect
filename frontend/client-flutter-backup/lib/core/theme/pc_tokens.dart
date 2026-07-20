import 'package:flutter/material.dart';

/// Design tokens representing the corporate visual standards of PharmaConnect.
/// Emphasizes healthcare trust, visual clarity, and high legibility.
/// 
/// Strictly enforces the "No Emojis" design guideline.
class PCTokens {
  PCTokens._();

  // Color Palette
  static const Color primary = Color(0xFF0F5B6E);           // Deep Teal (Authority / Active states)
  static const Color secondary = Color(0xFFFF7A00);         // Warm Orange (Primary CTA - Reserve only)
  static const Color success = Color(0xFF1D8A4B);           // Forest Green (Ready / Served / Active)
  static const Color warning = Color(0xFFC57B00);           // Amber (Pending / Past-due / Trial)
  static const Color error = Color(0xFFC0392B);             // Crimson (Rejected / Failed / Validation)
  static const Color info = Color(0xFF2471A3);              // Slate Blue (Submitted / Info alerts)
  static const Color neutral = Color(0xFF4A5568);           // Dark Slate (Primary text / Expired / Cancelled)
  static const Color neutralSecondary = Color(0xFF718096);  // Cool Grey (Secondary text / Viewed status)
  static const Color background = Color(0xFFF7FAFC);        // Pristine White-grey (Sterile page body)
  static const Color surface = Color(0xFFFFFFFF);           // Pure White (Cards / Containers)
  static const Color border = Color(0xFFE2E8F0);            // Thin border outlines

  // Typography
  static const String fontFamilyPrimary = 'Hanken Grotesk'; // Headlines & Brand Identifiers
  static const String fontFamilySecondary = 'Inter';         // Body Copy & Form Fields

  // Spacing (The 8px spacing rule)
  static const double unit1 = 4.0;
  static const double unit2 = 8.0;
  static const double unit3 = 12.0;
  static const double unit4 = 16.0;
  static const double unit6 = 24.0;                         // Margin default for mobile side edges
  static const double unit8 = 32.0;
  static const double unit12 = 48.0;                        // Minimum touch target height

  // Radii
  static const double radiusSmall = 6.0;                    // Buttons / Inputs
  static const double radiusMedium = 10.0;                  // Cards / Lists
  static const double radiusLarge = 16.0;                   // Modals / Bottom Sheets
}
