import 'dart:async';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import '../devices/models/lamp_device.dart';
import '../../core/constants.dart';

class BleService {
  static final BleService _instance = BleService._();
  factory BleService() => _instance;
  BleService._();

  BluetoothDevice? _connectedDevice;
  BluetoothCharacteristic? _writeChar;
  StreamSubscription? _scanSub;

  Stream<List<LampDevice>> scan({Duration timeout = const Duration(seconds: 6)}) async* {
    final devices = <LampDevice>[];
    final ctrl = StreamController<List<LampDevice>>();

    await FlutterBluePlus.startScan(
      timeout: timeout,
      withServices: [Guid(MagicHomeConstants.bleServiceUuid)],
    );

    _scanSub = FlutterBluePlus.scanResults.listen((results) {
      for (final r in results) {
        final bleId = r.device.remoteId.str;
        if (!devices.any((d) => d.bleId == bleId)) {
          final name = r.advertisementData.advName.isNotEmpty
              ? r.advertisementData.advName
              : 'BLE Lamp';
          devices.add(LampDevice(
            id: bleId.replaceAll(':', ''),
            ipAddress: '',
            macAddress: bleId,
            modelName: name,
            deviceType: DeviceType.rgb,
            connectionType: ConnectionType.ble,
            bleId: bleId,
          ));
          ctrl.add(List.unmodifiable(devices));
        }
      }
    });

    await Future.delayed(timeout);
    await FlutterBluePlus.stopScan();
    await _scanSub?.cancel();
    ctrl.close();

    yield* ctrl.stream;
  }

  Future<bool> connect(LampDevice device) async {
    if (device.bleId == null) return false;
    try {
      final btDevice = BluetoothDevice(remoteId: DeviceIdentifier(device.bleId!));
      await btDevice.connect(timeout: const Duration(seconds: 8));
      _connectedDevice = btDevice;

      final services = await btDevice.discoverServices();
      for (final svc in services) {
        if (svc.uuid.toString().toUpperCase().startsWith('FFD5')) {
          for (final c in svc.characteristics) {
            if (c.uuid.toString().toUpperCase().startsWith('FFD9')) {
              _writeChar = c;
              return true;
            }
          }
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<void> disconnect() async {
    await _connectedDevice?.disconnect();
    _connectedDevice = null;
    _writeChar = null;
  }

  Future<bool> send(List<int> cmd) async {
    if (_writeChar == null) return false;
    try {
      final checksum = cmd.fold(0, (s, b) => s + b) & 0xFF;
      await _writeChar!.write([...cmd, checksum], withoutResponse: true);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> setPower(bool on) => send([0x71, on ? 0x23 : 0x24, 0x0F]);
  Future<bool> setRGB(int r, int g, int b) =>
      send([0x31, r, g, b, 0x00, 0xF0, 0x0F]);
  Future<bool> setRGBW(int r, int g, int b, int w) =>
      send([0x31, r, g, b, w, 0xF0, 0x0F]);
  Future<bool> setWarmWhite(int warm) =>
      send([0x31, 0x00, 0x00, 0x00, warm, 0x0F, 0x0F]);
}
