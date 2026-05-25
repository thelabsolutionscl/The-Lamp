import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import '../models/lamp_device.dart';
import '../../../core/constants.dart';

class DiscoveryService {
  Future<List<LampDevice>> discover() async {
    final devices = <LampDevice>[];
    RawDatagramSocket? socket;

    try {
      socket = await RawDatagramSocket.bind(
        InternetAddress.anyIPv4,
        MagicHomeConstants.udpPort,
        reuseAddress: true,
      );
      socket.broadcastEnabled = true;

      final msg = Uint8List.fromList(
          MagicHomeConstants.discoveryMessage.codeUnits);
      socket.send(
          msg, InternetAddress('255.255.255.255'), MagicHomeConstants.udpPort);

      final completer = Completer<List<LampDevice>>();

      final timer = Timer(MagicHomeConstants.discoveryTimeout, () {
        socket?.close();
        if (!completer.isCompleted) completer.complete(devices);
      });

      socket.listen((event) {
        if (event == RawSocketEvent.read) {
          final datagram = socket!.receive();
          if (datagram != null) {
            final response =
                String.fromCharCodes(datagram.data).trim();
            final device = _parse(response, datagram.address.address);
            if (device != null &&
                !devices.any((d) => d.id == device.id)) {
              devices.add(device);
            }
          }
        }
      }, onError: (_) {
        timer.cancel();
        if (!completer.isCompleted) completer.complete(devices);
      });

      return completer.future;
    } catch (_) {
      socket?.close();
      return devices;
    }
  }

  LampDevice? _parse(String response, String senderIp) {
    final parts = response.split(',');
    if (parts.length >= 2) {
      final ip = parts[0].trim();
      final mac = parts[1].trim();
      final model = parts.length >= 3 ? parts[2].trim() : 'Magic Home';
      final id = mac.toLowerCase().replaceAll(':', '').replaceAll('-', '');
      return LampDevice(
        id: id.isNotEmpty ? id : ip.replaceAll('.', ''),
        ipAddress: ip,
        macAddress: mac,
        modelName: model,
        deviceType: _inferType(model),
        connectionType: ConnectionType.wifi,
      );
    }
    // Some older firmware only sends IP
    if (_isValidIp(senderIp) && senderIp != '255.255.255.255') {
      return LampDevice(
        id: senderIp.replaceAll('.', ''),
        ipAddress: senderIp,
        macAddress: '',
        modelName: 'Magic Home',
        deviceType: DeviceType.rgb,
        connectionType: ConnectionType.wifi,
      );
    }
    return null;
  }

  DeviceType _inferType(String model) {
    final m = model.toLowerCase();
    if (m.contains('cct') || m.contains('ww') || m.contains('cw')) {
      return DeviceType.cct;
    }
    if (m.contains('rgbw') || m.contains('rgb+w') || m.contains('rgbcct')) {
      return DeviceType.rgbw;
    }
    return DeviceType.rgb;
  }

  bool _isValidIp(String ip) {
    try {
      InternetAddress(ip);
      return true;
    } catch (_) {
      return false;
    }
  }
}
