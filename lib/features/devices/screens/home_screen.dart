import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/devices_provider.dart';
import '../models/lamp_device.dart';
import '../../../core/theme/app_theme.dart';
import 'device_control_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(devicesProvider.notifier).scan();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(devicesProvider);
    final lc = context.lc;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('The Lamp'),
            Text(
              '${state.devices.length} device${state.devices.length != 1 ? 's' : ''}',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: lc.subtle,
              ),
            ),
          ],
        ),
        actions: [
          if (state.isScanning)
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox.square(
                dimension: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: lc.amber,
                ),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: 'Scan',
              onPressed: () => ref.read(devicesProvider.notifier).scan(),
            ),
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'Add manually',
            onPressed: () => _showAddDialog(context),
          ),
        ],
      ),
      body: state.devices.isEmpty
          ? _EmptyState(isScanning: state.isScanning, lc: lc)
          : RefreshIndicator(
              color: lc.amber,
              backgroundColor: lc.surface,
              onRefresh: () => ref.read(devicesProvider.notifier).scan(),
              child: ListView.builder(
                padding: const EdgeInsets.only(top: 8, bottom: 100),
                itemCount: state.devices.length,
                itemBuilder: (ctx, i) =>
                    _DeviceCard(device: state.devices[i]),
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: state.isScanning
            ? null
            : () => ref.read(devicesProvider.notifier).scan(),
        child: state.isScanning
            ? const SizedBox.square(
                dimension: 24,
                child: CircularProgressIndicator(
                    color: Colors.black, strokeWidth: 2))
            : const Icon(Icons.search_rounded),
      ),
    );
  }

  Future<void> _showAddDialog(BuildContext context) async {
    final ipController = TextEditingController();
    final nameController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.lc.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Add Device Manually',
                  style: Theme.of(ctx)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 20),
              _LampTextField(
                controller: ipController,
                label: 'IP Address',
                hint: '192.168.1.100',
                keyboardType: TextInputType.number,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Required';
                  final parts = v.split('.');
                  if (parts.length != 4) return 'Invalid IP';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              _LampTextField(
                controller: nameController,
                label: 'Name (optional)',
                hint: 'Living Room',
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.lc.amber,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  if (formKey.currentState!.validate()) {
                    final ip = ipController.text.trim();
                    ref.read(devicesProvider.notifier).addManual(
                          LampDevice(
                            id: ip.replaceAll('.', ''),
                            ipAddress: ip,
                            macAddress: '',
                            modelName: 'Magic Home',
                            customName:
                                nameController.text.trim().isEmpty
                                    ? null
                                    : nameController.text.trim(),
                          ),
                        );
                    Navigator.pop(ctx);
                  }
                },
                child: const Text('Add Device',
                    style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DeviceCard extends ConsumerWidget {
  const _DeviceCard({required this.device});
  final LampDevice device;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lc = context.lc;
    final color = device.currentColor;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => DeviceControlScreen(deviceId: device.id),
          ),
        ),
        onLongPress: () => _showOptions(context, ref),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: device.isOn
                      ? color
                      : lc.subtle.withValues(alpha: 0.3),
                  boxShadow: device.isOn
                      ? [
                          BoxShadow(
                            color: color.withValues(alpha: 0.5),
                            blurRadius: 12,
                            spreadRadius: 2,
                          )
                        ]
                      : null,
                ),
                child: device.isOn
                    ? null
                    : Icon(Icons.lightbulb_outline_rounded,
                        color: lc.subtle, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      device.displayName,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 16),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${device.ipAddress.isNotEmpty ? device.ipAddress : device.macAddress}  ·  ${device.deviceTypeLabel}',
                      style: TextStyle(
                          color: lc.subtle,
                          fontSize: 13,
                          fontWeight: FontWeight.w400),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: device.isOn
                      ? lc.amber.withValues(alpha: 0.15)
                      : lc.subtle.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  device.isOn ? 'On' : 'Off',
                  style: TextStyle(
                    color: device.isOn ? lc.amber : lc.subtle,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Icon(Icons.chevron_right_rounded, color: lc.subtle, size: 20),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _showOptions(BuildContext context, WidgetRef ref) async {
    final lc = context.lc;
    final action = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: lc.surface,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 8),
          Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                  color: lc.subtle.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 12),
          ListTile(
            leading:
                const Icon(Icons.drive_file_rename_outline_rounded),
            title: const Text('Rename'),
            onTap: () => Navigator.pop(ctx, 'rename'),
          ),
          ListTile(
            leading:
                Icon(Icons.delete_outline_rounded, color: Colors.red[400]),
            title: Text('Remove',
                style: TextStyle(color: Colors.red[400])),
            onTap: () => Navigator.pop(ctx, 'remove'),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );

    if (action == 'remove' && context.mounted) {
      ref.read(devicesProvider.notifier).remove(device.id);
    } else if (action == 'rename' && context.mounted) {
      _showRenameDialog(context, ref);
    }
  }

  Future<void> _showRenameDialog(BuildContext context, WidgetRef ref) async {
    final ctrl =
        TextEditingController(text: device.customName ?? device.displayName);
    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.lc.surface,
        title: const Text('Rename Device'),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Device name',
            hintStyle: TextStyle(color: context.lc.subtle),
          ),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('Cancel',
                  style: TextStyle(color: context.lc.subtle))),
          TextButton(
            onPressed: () {
              ref
                  .read(devicesProvider.notifier)
                  .rename(device.id, ctrl.text.trim());
              Navigator.pop(ctx);
            },
            child:
                Text('Save', style: TextStyle(color: context.lc.amber)),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.isScanning, required this.lc});
  final bool isScanning;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: lc.surface,
                shape: BoxShape.circle,
              ),
              child: Icon(
                isScanning
                    ? Icons.wifi_find_rounded
                    : Icons.lightbulb_outline_rounded,
                size: 36,
                color: lc.amber,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              isScanning ? 'Scanning network…' : 'No devices found',
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              isScanning
                  ? 'Looking for Magic Home compatible devices'
                  : 'Make sure your devices are on the same\nWi-Fi network, then tap the scan button.',
              textAlign: TextAlign.center,
              style: TextStyle(color: lc.subtle, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }
}

class _LampTextField extends StatelessWidget {
  const _LampTextField({
    required this.controller,
    required this.label,
    this.hint,
    this.keyboardType,
    this.validator,
  });

  final TextEditingController controller;
  final String label;
  final String? hint;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    final lc = context.lc;
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      style: const TextStyle(fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: TextStyle(color: lc.subtle),
        filled: true,
        fillColor: lc.card,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: lc.amber, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 1),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }
}
