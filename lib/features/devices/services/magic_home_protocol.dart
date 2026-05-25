import 'dart:async';
import 'dart:io';
import '../../../core/constants.dart';

class LampState {
  const LampState({
    required this.isOn,
    required this.r,
    required this.g,
    required this.b,
    required this.warmWhite,
    required this.coolWhite,
    required this.mode,
  });

  final bool isOn;
  final int r;
  final int g;
  final int b;
  final int warmWhite;
  final int coolWhite;
  final int mode;
}

class MagicHomeProtocol {
  MagicHomeProtocol(this.ipAddress);

  final String ipAddress;
  Socket? _socket;
  bool _connected = false;

  bool get isConnected => _connected;

  Future<bool> connect() async {
    try {
      _socket = await Socket.connect(
        ipAddress,
        MagicHomeConstants.tcpPort,
        timeout: MagicHomeConstants.connectionTimeout,
      );
      _connected = true;
      _socket!.done.then((_) {
        _connected = false;
        _socket = null;
      });
      return true;
    } catch (_) {
      _connected = false;
      return false;
    }
  }

  Future<bool> ensureConnected() async {
    if (_connected && _socket != null) return true;
    return connect();
  }

  void disconnect() {
    _socket?.destroy();
    _socket = null;
    _connected = false;
  }

  Future<bool> setPower(bool on) =>
      _send([0x71, on ? 0x23 : 0x24, 0x0F]);

  Future<bool> setRGB(int r, int g, int b) =>
      _send([0x31, r, g, b, 0x00, 0xF0, 0x0F]);

  Future<bool> setRGBW(int r, int g, int b, int w) =>
      _send([0x31, r, g, b, w, 0xF0, 0x0F]);

  Future<bool> setWarmWhite(int warm) =>
      _send([0x31, 0x00, 0x00, 0x00, warm, 0x0F, 0x0F]);

  Future<bool> setCCT(int warm, int cool) =>
      _send([0x35, warm, cool, 0x00, 0x00, 0x0F, 0x0F]);

  Future<bool> setBrightness(int value) =>
      _send([0x31, value, value, value, 0x00, 0xF0, 0x0F]);

  Future<bool> setScene(int sceneCode, int speed) =>
      _send([0x61, sceneCode, speed, 0x0F]);

  Future<LampState?> queryState() async {
    if (!await ensureConnected()) return null;
    try {
      final sent = await _send([0x81, 0x8A, 0x8B]);
      if (!sent) return null;

      final data = await _socket!.first
          .timeout(const Duration(seconds: 2));
      return _parseState(data);
    } catch (_) {
      return null;
    }
  }

  Future<bool> _send(List<int> cmd) async {
    if (!await ensureConnected()) return false;
    final checksum = cmd.fold(0, (s, b) => s + b) & 0xFF;
    try {
      _socket!.add([...cmd, checksum]);
      await _socket!.flush();
      return true;
    } catch (_) {
      _connected = false;
      _socket = null;
      return false;
    }
  }

  LampState? _parseState(List<int> data) {
    // Expected response: 0x81, deviceType, power, mode, speed, r, g, b, warm, cool, ...
    if (data.length < 12) return null;
    return LampState(
      isOn: data[2] == 0x23,
      mode: data[3],
      r: data[6],
      g: data[7],
      b: data[8],
      warmWhite: data[9],
      coolWhite: data[10],
    );
  }
}
