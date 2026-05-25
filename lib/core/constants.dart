class MagicHomeConstants {
  static const int tcpPort = 5577;
  static const int udpPort = 48899;
  static const String discoveryMessage = 'HF-A11ASSISTHREAD';
  static const Duration connectionTimeout = Duration(seconds: 5);
  static const Duration discoveryTimeout = Duration(seconds: 4);

  // BLE UUIDs for newer Magic Home devices
  static const String bleServiceUuid = '0000FFD5-0000-1000-8000-00805F9B34FB';
  static const String bleCharacteristicUuid = '0000FFD9-0000-1000-8000-00805F9B34FB';
}

class BuiltinScenes {
  static const List<Map<String, dynamic>> list = [
    {'name': 'Seven Colors', 'code': 0x25, 'icon': '🌈'},
    {'name': 'Red Gradual', 'code': 0x26, 'icon': '🔴'},
    {'name': 'Green Gradual', 'code': 0x27, 'icon': '🟢'},
    {'name': 'Blue Gradual', 'code': 0x28, 'icon': '🔵'},
    {'name': 'Yellow Gradual', 'code': 0x29, 'icon': '🟡'},
    {'name': 'Cyan Gradual', 'code': 0x2A, 'icon': '🩵'},
    {'name': 'Purple Gradual', 'code': 0x2B, 'icon': '🟣'},
    {'name': 'White Gradual', 'code': 0x2C, 'icon': '⚪'},
    {'name': 'RGB Strobe', 'code': 0x30, 'icon': '⚡'},
    {'name': 'Red Strobe', 'code': 0x31, 'icon': '🚨'},
  ];
}
