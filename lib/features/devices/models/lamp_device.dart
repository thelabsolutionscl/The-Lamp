import 'dart:convert';
import 'package:flutter/material.dart';

enum DeviceType { rgb, rgbw, cct, unknown }

enum ConnectionType { wifi, ble }

class LampDevice {
  const LampDevice({
    required this.id,
    required this.ipAddress,
    required this.macAddress,
    required this.modelName,
    this.deviceType = DeviceType.rgb,
    this.connectionType = ConnectionType.wifi,
    this.isOn = false,
    this.r = 255,
    this.g = 165,
    this.b = 0,
    this.warmWhite = 0,
    this.coolWhite = 0,
    this.brightness = 255,
    this.customName,
    this.bleId,
  });

  final String id;
  final String ipAddress;
  final String macAddress;
  final String modelName;
  final DeviceType deviceType;
  final ConnectionType connectionType;
  final bool isOn;
  final int r;
  final int g;
  final int b;
  final int warmWhite;
  final int coolWhite;
  final int brightness;
  final String? customName;
  final String? bleId;

  String get displayName {
    if (customName != null && customName!.isNotEmpty) return customName!;
    if (modelName.isNotEmpty && modelName != 'Unknown') return modelName;
    final suffix = macAddress.length >= 6
        ? macAddress.substring(macAddress.length - 5).replaceAll(':', '')
        : ipAddress.split('.').last;
    return 'Lamp-$suffix';
  }

  String get deviceTypeLabel {
    switch (deviceType) {
      case DeviceType.rgb:
        return 'RGB';
      case DeviceType.rgbw:
        return 'RGB+W';
      case DeviceType.cct:
        return 'White';
      case DeviceType.unknown:
        return 'Unknown';
    }
  }

  Color get currentColor => Color.fromARGB(255, r, g, b);

  LampDevice copyWith({
    String? id,
    String? ipAddress,
    String? macAddress,
    String? modelName,
    DeviceType? deviceType,
    ConnectionType? connectionType,
    bool? isOn,
    int? r,
    int? g,
    int? b,
    int? warmWhite,
    int? coolWhite,
    int? brightness,
    String? customName,
    String? bleId,
  }) =>
      LampDevice(
        id: id ?? this.id,
        ipAddress: ipAddress ?? this.ipAddress,
        macAddress: macAddress ?? this.macAddress,
        modelName: modelName ?? this.modelName,
        deviceType: deviceType ?? this.deviceType,
        connectionType: connectionType ?? this.connectionType,
        isOn: isOn ?? this.isOn,
        r: r ?? this.r,
        g: g ?? this.g,
        b: b ?? this.b,
        warmWhite: warmWhite ?? this.warmWhite,
        coolWhite: coolWhite ?? this.coolWhite,
        brightness: brightness ?? this.brightness,
        customName: customName ?? this.customName,
        bleId: bleId ?? this.bleId,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'ipAddress': ipAddress,
        'macAddress': macAddress,
        'modelName': modelName,
        'deviceType': deviceType.index,
        'connectionType': connectionType.index,
        'customName': customName,
        'bleId': bleId,
      };

  factory LampDevice.fromJson(Map<String, dynamic> json) => LampDevice(
        id: json['id'] as String,
        ipAddress: json['ipAddress'] as String,
        macAddress: json['macAddress'] as String,
        modelName: json['modelName'] as String,
        deviceType: DeviceType.values[json['deviceType'] as int? ?? 0],
        connectionType:
            ConnectionType.values[json['connectionType'] as int? ?? 0],
        customName: json['customName'] as String?,
        bleId: json['bleId'] as String?,
      );

  String toJsonString() => jsonEncode(toJson());
  factory LampDevice.fromJsonString(String s) =>
      LampDevice.fromJson(jsonDecode(s) as Map<String, dynamic>);
}
