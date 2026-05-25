import 'package:flutter/material.dart';
import 'permissions_service.dart';

/// Shown at startup when required permissions are missing.
/// Wraps [child] and only shows it once permissions are satisfied.
class PermissionsGate extends StatefulWidget {
  const PermissionsGate({super.key, required this.child});
  final Widget child;

  @override
  State<PermissionsGate> createState() => _PermissionsGateState();
}

class _PermissionsGateState extends State<PermissionsGate>
    with WidgetsBindingObserver {
  PermissionsResult? _result;
  bool _requesting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _check();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // Re-check after user comes back from Settings
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _result?.allGranted == false) {
      _check();
    }
  }

  Future<void> _check() async {
    final r = await PermissionsService.check();
    if (mounted) setState(() => _result = r);
  }

  Future<void> _request() async {
    setState(() => _requesting = true);
    final r = await PermissionsService.request();
    if (mounted) {
      setState(() {
        _result = r;
        _requesting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final result = _result;

    // Still checking
    if (result == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0A0A),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFFF9500)),
        ),
      );
    }

    // All good → show the app
    if (result.allGranted) return widget.child;

    // Missing permissions → show rationale
    return _PermissionsScreen(
      result: result,
      requesting: _requesting,
      onRequest: _request,
      onSkip: () => setState(() => _result =
          const PermissionsResult(bluetooth: true, location: true)),
    );
  }
}

class _PermissionsScreen extends StatelessWidget {
  const _PermissionsScreen({
    required this.result,
    required this.requesting,
    required this.onRequest,
    required this.onSkip,
  });

  final PermissionsResult result;
  final bool requesting;
  final VoidCallback onRequest;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    const bg = Color(0xFF0A0A0A);
    const amber = Color(0xFFFF9500);

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              // Icon
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: amber.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.lightbulb_rounded,
                    color: amber, size: 32),
              ),
              const SizedBox(height: 24),
              const Text(
                'Permissions needed',
                style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.5),
              ),
              const SizedBox(height: 12),
              const Text(
                'The Lamp needs these permissions to discover and control your smart lights.',
                style: TextStyle(fontSize: 16, height: 1.5),
              ),
              const SizedBox(height: 32),
              // Permission list
              _PermItem(
                icon: Icons.bluetooth_rounded,
                title: 'Bluetooth',
                detail: 'Discover and control BLE smart lights',
                granted: result.bluetooth,
              ),
              const SizedBox(height: 12),
              _PermItem(
                icon: Icons.location_on_outlined,
                title: 'Location',
                detail:
                    'Required by Android to scan for nearby BLE devices',
                granted: result.location,
              ),
              const SizedBox(height: 12),
              const _PermItem(
                icon: Icons.wifi_rounded,
                title: 'Local Network',
                detail:
                    'Discover Magic Home devices on your Wi-Fi (granted automatically)',
                granted: true,
              ),
              const Spacer(),
              // CTA
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: amber,
                    foregroundColor: Colors.black,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: requesting ? null : onRequest,
                  child: requesting
                      ? const SizedBox.square(
                          dimension: 20,
                          child: CircularProgressIndicator(
                              color: Colors.black, strokeWidth: 2))
                      : const Text('Grant Permissions',
                          style: TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 16)),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: TextButton(
                  onPressed: onSkip,
                  child: const Text('Skip — Wi-Fi only mode',
                      style: TextStyle(fontSize: 14)),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}

class _PermItem extends StatelessWidget {
  const _PermItem({
    required this.icon,
    required this.title,
    required this.detail,
    required this.granted,
  });

  final IconData icon;
  final String title;
  final String detail;
  final bool granted;

  @override
  Widget build(BuildContext context) {
    const surface = Color(0xFF1C1C1E);
    const amber = Color(0xFFFF9500);
    const green = Color(0xFF4ADE80);
    const subtle = Color(0xFF636366);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: (granted ? green : amber).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon,
                color: granted ? green : amber, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 15)),
                const SizedBox(height: 2),
                Text(detail,
                    style: const TextStyle(fontSize: 12, height: 1.4)),
              ],
            ),
          ),
          Icon(
            granted
                ? Icons.check_circle_rounded
                : Icons.radio_button_unchecked_rounded,
            color: granted ? green : subtle,
            size: 20,
          ),
        ],
      ),
    );
  }
}
