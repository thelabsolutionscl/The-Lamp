import 'dart:math' as math;
import 'package:flutter/material.dart';

typedef ColorCallback = void Function(Color color);

class ColorWheelPicker extends StatefulWidget {
  const ColorWheelPicker({
    super.key,
    required this.color,
    required this.onChanged,
    this.radius = 140.0,
  });

  final Color color;
  final ColorCallback onChanged;
  final double radius;

  @override
  State<ColorWheelPicker> createState() => _ColorWheelPickerState();
}

class _ColorWheelPickerState extends State<ColorWheelPicker> {
  late HSVColor _hsv;

  @override
  void initState() {
    super.initState();
    _hsv = HSVColor.fromColor(widget.color);
  }

  @override
  void didUpdateWidget(ColorWheelPicker old) {
    super.didUpdateWidget(old);
    if (old.color != widget.color) {
      _hsv = HSVColor.fromColor(widget.color);
    }
  }

  Offset _hsvToOffset(HSVColor hsv, double radius) {
    final angle = hsv.hue * math.pi / 180;
    final dist = hsv.saturation * radius;
    return Offset(
      radius + dist * math.cos(angle),
      radius + dist * math.sin(angle),
    );
  }

  HSVColor _offsetToHsv(Offset offset, double radius) {
    final dx = offset.dx - radius;
    final dy = offset.dy - radius;
    final dist = math.sqrt(dx * dx + dy * dy).clamp(0.0, radius);
    final angle = math.atan2(dy, dx);
    final hue = ((angle * 180 / math.pi) % 360 + 360) % 360;
    final saturation = dist / radius;
    return HSVColor.fromAHSV(1, hue, saturation, _hsv.value);
  }

  void _handleTouch(Offset local) {
    final r = widget.radius;
    final dx = local.dx - r;
    final dy = local.dy - r;
    if (math.sqrt(dx * dx + dy * dy) <= r + 10) {
      setState(() => _hsv = _offsetToHsv(local, r));
      widget.onChanged(_hsv.toColor());
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = widget.radius * 2;
    final indicator = _hsvToOffset(_hsv, widget.radius);

    return GestureDetector(
      onPanStart: (d) => _handleTouch(d.localPosition),
      onPanUpdate: (d) => _handleTouch(d.localPosition),
      onTapDown: (d) => _handleTouch(d.localPosition),
      child: SizedBox.square(
        dimension: size,
        child: CustomPaint(
          painter: _WheelPainter(value: _hsv.value),
          child: Stack(
            children: [
              Positioned(
                left: indicator.dx - 14,
                top: indicator.dy - 14,
                child: _Indicator(color: _hsv.toColor()),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WheelPainter extends CustomPainter {
  _WheelPainter({required this.value});
  final double value;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);

    // Hue sweep
    final huePaint = Paint()
      ..shader = SweepGradient(
        colors: List.generate(361, (i) {
          return HSVColor.fromAHSV(1, i.toDouble(), 1, value).toColor();
        }),
      ).createShader(rect);
    canvas.drawCircle(center, radius, huePaint);

    // Saturation overlay (white center fades to transparent edge)
    final satPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          Colors.white.withValues(alpha: value),
          Colors.transparent,
        ],
      ).createShader(rect);
    canvas.drawCircle(center, radius, satPaint);

    // Subtle border
    final borderPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(center, radius, borderPaint);
  }

  @override
  bool shouldRepaint(_WheelPainter old) => old.value != value;
}

class _Indicator extends StatelessWidget {
  const _Indicator({required this.color});
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2.5),
        boxShadow: [
          BoxShadow(
              color: color.withValues(alpha: 0.6),
              blurRadius: 10,
              spreadRadius: 2),
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.4), blurRadius: 4),
        ],
      ),
    );
  }
}
