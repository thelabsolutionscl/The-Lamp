import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  AppTheme._();

  static const Color _bg = Color(0xFF0A0A0A);
  static const Color _surface = Color(0xFF1C1C1E);
  static const Color _card = Color(0xFF242428);
  static const Color _amber = Color(0xFFFF9500);
  static const Color _amberGlow = Color(0xFFFFB340);
  static const Color _onSurface = Color(0xFFEAEAEA);
  static const Color _subtle = Color(0xFF636366);
  static const Color _divider = Color(0xFF2C2C2E);

  static ThemeData dark() {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: _bg,
      colorScheme: const ColorScheme.dark(
        primary: _amber,
        secondary: _amberGlow,
        surface: _surface,
        onPrimary: Colors.black,
        onSurface: _onSurface,
        onSurfaceVariant: _subtle,
      ),
      textTheme: GoogleFonts.spaceGroteskTextTheme(base.textTheme).apply(
        bodyColor: _onSurface,
        displayColor: _onSurface,
      ),
      cardTheme: CardThemeData(
        color: _card,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: _bg,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.spaceGrotesk(
          fontSize: 26,
          fontWeight: FontWeight.w700,
          color: _onSurface,
          letterSpacing: -0.5,
        ),
        iconTheme: const IconThemeData(color: _onSurface),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: _amber,
        foregroundColor: Colors.black,
        elevation: 0,
        shape: CircleBorder(),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: _amber,
        thumbColor: _amber,
        inactiveTrackColor: _subtle.withValues(alpha: 0.25),
        trackHeight: 5,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 11),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 20),
        overlayColor: const Color(0x22FF9500),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((s) =>
            s.contains(WidgetState.selected) ? Colors.black : _subtle),
        trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected)
            ? _amber.withValues(alpha: 1.0)
            : _subtle.withValues(alpha: 0.3)),
      ),
      dividerTheme: const DividerThemeData(color: _divider, thickness: 1),
      iconTheme: const IconThemeData(color: _onSurface),
      extensions: const [
        LampColors(
          bg: _bg,
          surface: _surface,
          card: _card,
          amber: _amber,
          amberGlow: _amberGlow,
          subtle: _subtle,
          divider: _divider,
        ),
      ],
    );
  }
}

@immutable
class LampColors extends ThemeExtension<LampColors> {
  const LampColors({
    required this.bg,
    required this.surface,
    required this.card,
    required this.amber,
    required this.amberGlow,
    required this.subtle,
    required this.divider,
  });

  final Color bg;
  final Color surface;
  final Color card;
  final Color amber;
  final Color amberGlow;
  final Color subtle;
  final Color divider;

  @override
  LampColors copyWith({
    Color? bg,
    Color? surface,
    Color? card,
    Color? amber,
    Color? amberGlow,
    Color? subtle,
    Color? divider,
  }) =>
      LampColors(
        bg: bg ?? this.bg,
        surface: surface ?? this.surface,
        card: card ?? this.card,
        amber: amber ?? this.amber,
        amberGlow: amberGlow ?? this.amberGlow,
        subtle: subtle ?? this.subtle,
        divider: divider ?? this.divider,
      );

  @override
  LampColors lerp(LampColors? other, double t) {
    if (other == null) return this;
    return LampColors(
      bg: Color.lerp(bg, other.bg, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      card: Color.lerp(card, other.card, t)!,
      amber: Color.lerp(amber, other.amber, t)!,
      amberGlow: Color.lerp(amberGlow, other.amberGlow, t)!,
      subtle: Color.lerp(subtle, other.subtle, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
    );
  }
}

extension ThemeContextExt on BuildContext {
  LampColors get lc => Theme.of(this).extension<LampColors>()!;
}
