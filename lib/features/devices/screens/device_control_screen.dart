import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/devices_provider.dart';
import '../models/lamp_device.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants.dart';
import '../../../shared/widgets/color_wheel_picker.dart';
import 'diagnostics_screen.dart';

class DeviceControlScreen extends ConsumerStatefulWidget {
  const DeviceControlScreen({super.key, required this.deviceId});
  final String deviceId;

  @override
  ConsumerState<DeviceControlScreen> createState() =>
      _DeviceControlScreenState();
}

class _DeviceControlScreenState extends ConsumerState<DeviceControlScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  double _brightness = 1.0;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(deviceControlProvider(widget.deviceId).notifier).connect();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final device = ref.watch(deviceControlProvider(widget.deviceId));
    final notifier = ref.read(deviceControlProvider(widget.deviceId).notifier);
    final lc = context.lc;

    return Scaffold(
      backgroundColor: lc.bg,
      appBar: AppBar(
        title: Text(device.displayName),
        actions: [
          IconButton(
            icon: const Icon(Icons.bug_report_outlined, size: 20),
            tooltip: 'Diagnostics',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) =>
                    DiagnosticsScreen(initialIp: device.ipAddress),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: _PowerButton(
              isOn: device.isOn,
              onToggle: () => notifier.setPower(!device.isOn),
              lc: lc,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          _ColorPreviewBar(device: device),
          _LampTabBar(controller: _tabs, lc: lc),
          Expanded(
            child: TabBarView(
              controller: _tabs,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _ColorTab(
                  device: device,
                  brightness: _brightness,
                  onColorChanged: (c) {
                    final r = (c.r * 255.0).round() & 0xff;
                    final g = (c.g * 255.0).round() & 0xff;
                    final b = (c.b * 255.0).round() & 0xff;
                    notifier.setColor(r, g, b);
                  },
                  onBrightnessChanged: (v) {
                    setState(() => _brightness = v);
                    final c = device.currentColor;
                    notifier.setColor(
                      ((c.r * 255.0).round() * v).round(),
                      ((c.g * 255.0).round() * v).round(),
                      ((c.b * 255.0).round() * v).round(),
                    );
                  },
                  lc: lc,
                ),
                _WhiteTab(device: device, notifier: notifier, lc: lc),
                _ScenesTab(notifier: notifier, lc: lc),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Color preview bar ───────────────────────────────────────────────────────

class _ColorPreviewBar extends StatelessWidget {
  const _ColorPreviewBar({required this.device});
  final LampDevice device;

  @override
  Widget build(BuildContext context) {
    final color = device.isOn ? device.currentColor : Colors.transparent;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 400),
      height: 4,
      decoration: BoxDecoration(
        gradient: device.isOn
            ? LinearGradient(colors: [
                color.withValues(alpha: 0),
                color,
                color.withValues(alpha: 0),
              ])
            : null,
      ),
    );
  }
}

// ─── Power button ────────────────────────────────────────────────────────────

class _PowerButton extends StatelessWidget {
  const _PowerButton(
      {required this.isOn, required this.onToggle, required this.lc});
  final bool isOn;
  final VoidCallback onToggle;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onToggle,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isOn ? lc.amber.withValues(alpha: 0.2) : lc.surface,
          border: Border.all(
            color: isOn ? lc.amber : lc.subtle.withValues(alpha: 0.4),
            width: 1.5,
          ),
        ),
        child: Icon(
          Icons.power_settings_new_rounded,
          color: isOn ? lc.amber : lc.subtle,
          size: 20,
        ),
      ),
    );
  }
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

class _LampTabBar extends StatelessWidget {
  const _LampTabBar({required this.controller, required this.lc});
  final TabController controller;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: lc.surface,
        borderRadius: BorderRadius.circular(14),
      ),
      child: TabBar(
        controller: controller,
        indicator: BoxDecoration(
          color: lc.amber,
          borderRadius: BorderRadius.circular(10),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: Colors.black,
        unselectedLabelColor: lc.subtle,
        labelStyle:
            const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
        unselectedLabelStyle:
            const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
        tabs: const [
          Tab(text: 'Color'),
          Tab(text: 'White'),
          Tab(text: 'Scenes'),
        ],
      ),
    );
  }
}

// ─── Color tab ───────────────────────────────────────────────────────────────

class _ColorTab extends StatelessWidget {
  const _ColorTab({
    required this.device,
    required this.brightness,
    required this.onColorChanged,
    required this.onBrightnessChanged,
    required this.lc,
  });

  final LampDevice device;
  final double brightness;
  final ColorCallback onColorChanged;
  final ValueChanged<double> onBrightnessChanged;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      child: Column(
        children: [
          Center(
            child: ColorWheelPicker(
              color: device.currentColor,
              onChanged: onColorChanged,
              radius: 140,
            ),
          ),
          const SizedBox(height: 32),
          _SliderRow(
            label: 'Brightness',
            icon: Icons.brightness_6_rounded,
            value: brightness,
            onChanged: onBrightnessChanged,
            lc: lc,
          ),
        ],
      ),
    );
  }
}

// ─── White tab ───────────────────────────────────────────────────────────────

class _WhiteTab extends StatelessWidget {
  const _WhiteTab(
      {required this.device, required this.notifier, required this.lc});
  final LampDevice device;
  final DeviceControlNotifier notifier;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        children: [
          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Color.lerp(
                            const Color(0xFFFFD080),
                            Colors.white,
                            device.coolWhite / 255)!
                        .withValues(alpha: device.warmWhite / 255),
                    Colors.transparent,
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFFD080).withValues(
                        alpha: (device.warmWhite / 255) * 0.6),
                    blurRadius: 24,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: const Icon(Icons.lightbulb_rounded,
                  color: Colors.white70, size: 36),
            ),
          ),
          const SizedBox(height: 36),
          _SliderRow(
            label: 'Warm White',
            icon: Icons.wb_sunny_rounded,
            value: device.warmWhite / 255,
            iconColor: const Color(0xFFFFAA44),
            onChanged: (v) => notifier.setWarmWhite((v * 255).round()),
            lc: lc,
          ),
          if (device.deviceType == DeviceType.cct) ...[
            const SizedBox(height: 8),
            _SliderRow(
              label: 'Cool White',
              icon: Icons.ac_unit_rounded,
              value: device.coolWhite / 255,
              iconColor: const Color(0xFF88CCFF),
              onChanged: (v) => notifier.setCoolWhite((v * 255).round()),
              lc: lc,
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Scenes tab ──────────────────────────────────────────────────────────────

class _ScenesTab extends StatelessWidget {
  const _ScenesTab({required this.notifier, required this.lc});
  final DeviceControlNotifier notifier;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.6,
      ),
      itemCount: BuiltinScenes.list.length,
      itemBuilder: (ctx, i) {
        final scene = BuiltinScenes.list[i];
        return _SceneCard(
          name: scene['name'] as String,
          icon: scene['icon'] as String,
          onTap: () => notifier.setScene(scene['code'] as int),
          lc: lc,
        );
      },
    );
  }
}

class _SceneCard extends StatelessWidget {
  const _SceneCard({
    required this.name,
    required this.icon,
    required this.onTap,
    required this.lc,
  });
  final String name;
  final String icon;
  final VoidCallback onTap;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: lc.card,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(icon, style: const TextStyle(fontSize: 24)),
              Text(
                name,
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 13),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Shared slider row ───────────────────────────────────────────────────────

class _SliderRow extends StatelessWidget {
  const _SliderRow({
    required this.label,
    required this.icon,
    required this.value,
    required this.onChanged,
    required this.lc,
    this.iconColor,
  });

  final String label;
  final IconData icon;
  final double value;
  final ValueChanged<double> onChanged;
  final LampColors lc;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: iconColor ?? lc.amber, size: 18),
            const SizedBox(width: 8),
            Text(label,
                style: TextStyle(
                    color: lc.subtle,
                    fontWeight: FontWeight.w500,
                    fontSize: 13)),
            const Spacer(),
            Text(
              '${(value * 100).round()}%',
              style: const TextStyle(
                  color: Color(0xFFEAEAEA),
                  fontWeight: FontWeight.w600,
                  fontSize: 13),
            ),
          ],
        ),
        Slider(
          value: value.clamp(0.0, 1.0),
          onChanged: onChanged,
        ),
      ],
    );
  }
}
