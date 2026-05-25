import 'dart:io';
import 'package:permission_handler/permission_handler.dart' as ph;

class PermissionsResult {
  const PermissionsResult({
    required this.bluetooth,
    required this.location,
  });

  final bool bluetooth;
  final bool location;

  bool get allGranted => bluetooth;
  bool get bleReady => bluetooth && location;

  List<String> get missing {
    final out = <String>[];
    if (!bluetooth) out.add('Bluetooth');
    if (!location) out.add('Location');
    return out;
  }
}

class PermissionsService {
  /// Check current status without requesting
  static Future<PermissionsResult> check() async {
    if (!Platform.isAndroid && !Platform.isIOS) {
      return const PermissionsResult(bluetooth: true, location: true);
    }
    return PermissionsResult(
      bluetooth: await _btGranted(),
      location: (await ph.Permission.location.status).isGranted,
    );
  }

  /// Request all permissions needed for discovery + BLE
  static Future<PermissionsResult> request() async {
    if (!Platform.isAndroid && !Platform.isIOS) {
      return const PermissionsResult(bluetooth: true, location: true);
    }

    final toRequest = <ph.Permission>[ph.Permission.location];
    if (Platform.isAndroid) {
      toRequest.addAll([
        ph.Permission.bluetoothScan,
        ph.Permission.bluetoothConnect,
      ]);
    } else {
      toRequest.add(ph.Permission.bluetooth);
    }

    final results = await toRequest.request();
    return PermissionsResult(
      bluetooth: _btFromResults(results),
      location: results[ph.Permission.location]?.isGranted ?? false,
    );
  }

  static Future<bool> _btGranted() async {
    if (Platform.isAndroid) {
      final scan = await ph.Permission.bluetoothScan.status;
      final connect = await ph.Permission.bluetoothConnect.status;
      return scan.isGranted && connect.isGranted;
    }
    return (await ph.Permission.bluetooth.status).isGranted;
  }

  static bool _btFromResults(
      Map<ph.Permission, ph.PermissionStatus> results) {
    if (Platform.isAndroid) {
      final scan = results[ph.Permission.bluetoothScan]?.isGranted ?? false;
      final connect =
          results[ph.Permission.bluetoothConnect]?.isGranted ?? false;
      return scan && connect;
    }
    return results[ph.Permission.bluetooth]?.isGranted ?? false;
  }

  static Future<void> openSettings() => ph.openAppSettings();
}
