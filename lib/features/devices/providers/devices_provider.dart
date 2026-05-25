import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/lamp_device.dart';
import '../services/discovery_service.dart';
import '../services/magic_home_protocol.dart';

// ─── Devices list ────────────────────────────────────────────────────────────

class DevicesState {
  const DevicesState({
    this.devices = const [],
    this.isScanning = false,
    this.error,
  });

  final List<LampDevice> devices;
  final bool isScanning;
  final String? error;

  DevicesState copyWith({
    List<LampDevice>? devices,
    bool? isScanning,
    String? error,
  }) =>
      DevicesState(
        devices: devices ?? this.devices,
        isScanning: isScanning ?? this.isScanning,
        error: error,
      );
}

class DevicesNotifier extends StateNotifier<DevicesState> {
  DevicesNotifier() : super(const DevicesState()) {
    _loadSaved();
  }

  final _discovery = DiscoveryService();
  static const _prefsKey = 'saved_devices';

  Future<void> scan() async {
    state = state.copyWith(isScanning: true, error: null);
    try {
      final found = await _discovery.discover();
      final merged = <LampDevice>[];
      for (final d in found) {
        final existing = state.devices.where((e) => e.id == d.id).firstOrNull;
        merged.add(existing != null
            ? d.copyWith(customName: existing.customName)
            : d);
      }
      // Keep manually-added devices that weren't discovered
      for (final existing in state.devices) {
        if (!merged.any((m) => m.id == existing.id)) {
          merged.add(existing);
        }
      }
      state = state.copyWith(devices: merged, isScanning: false);
      await _persist();
    } catch (e) {
      state = state.copyWith(isScanning: false, error: e.toString());
    }
  }

  void addManual(LampDevice device) {
    if (!state.devices.any((d) => d.id == device.id)) {
      state = state.copyWith(devices: [...state.devices, device]);
      _persist();
    }
  }

  void remove(String id) {
    state = state.copyWith(
        devices: state.devices.where((d) => d.id != id).toList());
    _persist();
  }

  void update(LampDevice device) {
    state = state.copyWith(
      devices: state.devices
          .map((d) => d.id == device.id ? device : d)
          .toList(),
    );
    _persist();
  }

  void rename(String id, String name) {
    final device = state.devices.firstWhere((d) => d.id == id);
    update(device.copyWith(customName: name));
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    final list = state.devices.map((d) => d.toJsonString()).toList();
    await prefs.setStringList(_prefsKey, list);
  }

  Future<void> _loadSaved() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_prefsKey) ?? [];
    final devices = list.map(LampDevice.fromJsonString).toList();
    if (devices.isNotEmpty) {
      state = state.copyWith(devices: devices);
    }
  }
}

final devicesProvider =
    StateNotifierProvider<DevicesNotifier, DevicesState>(
        (_) => DevicesNotifier());

// ─── Per-device control ───────────────────────────────────────────────────────

class DeviceControlNotifier extends StateNotifier<LampDevice> {
  DeviceControlNotifier(LampDevice device, this._ref) : super(device) {
    _proto = MagicHomeProtocol(device.ipAddress);
  }

  final Ref _ref;
  late MagicHomeProtocol _proto;

  bool get isConnected => _proto.isConnected;

  Future<void> connect() async {
    if (state.connectionType == ConnectionType.wifi) {
      final ok = await _proto.connect();
      if (ok) await refresh();
    }
  }

  void disconnect() => _proto.disconnect();

  Future<void> refresh() async {
    final s = await _proto.queryState();
    if (s != null) {
      state = state.copyWith(
        isOn: s.isOn,
        r: s.r,
        g: s.g,
        b: s.b,
        warmWhite: s.warmWhite,
        coolWhite: s.coolWhite,
      );
      _syncToList();
    }
  }

  Future<void> setPower(bool on) async {
    await _proto.setPower(on);
    state = state.copyWith(isOn: on);
    _syncToList();
  }

  Future<void> setColor(int r, int g, int b) async {
    if (state.deviceType == DeviceType.rgbw) {
      await _proto.setRGBW(r, g, b, state.warmWhite);
    } else {
      await _proto.setRGB(r, g, b);
    }
    state = state.copyWith(r: r, g: g, b: b);
    _syncToList();
  }

  Future<void> setWarmWhite(int value) async {
    if (state.deviceType == DeviceType.cct) {
      await _proto.setCCT(value, state.coolWhite);
    } else {
      await _proto.setWarmWhite(value);
    }
    state = state.copyWith(warmWhite: value);
    _syncToList();
  }

  Future<void> setCoolWhite(int value) async {
    await _proto.setCCT(state.warmWhite, value);
    state = state.copyWith(coolWhite: value);
    _syncToList();
  }

  Future<void> setScene(int code, {int speed = 100}) async {
    await _proto.setScene(code, speed);
  }

  void _syncToList() {
    _ref.read(devicesProvider.notifier).update(state);
  }
}

final deviceControlProvider = StateNotifierProvider.family
    .autoDispose<DeviceControlNotifier, LampDevice, String>(
  (ref, deviceId) {
    final device = ref
        .watch(devicesProvider.select((s) => s.devices))
        .firstWhere((d) => d.id == deviceId);
    final notifier = DeviceControlNotifier(device, ref);
    ref.onDispose(notifier.disconnect);
    return notifier;
  },
);
