# The Lamp

Smart lighting control app — compatible with Magic Home hardware, con skin propia.

## Características

- **Descubrimiento automático** de dispositivos vía UDP broadcast (protocolo Magic Home)
- **Control RGB / RGBW / CCT** en tiempo real por TCP (puerto 5577)
- **BLE** para dispositivos Magic Home de última generación
- **Rueda de color** custom con selector HSV
- **Escenas integradas** (7 colores, strobe, fade, etc.)
- **Agregar manualmente** dispositivos por IP
- **Persistencia** de dispositivos y nombres personalizados

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Flutter 3.x (Dart) |
| State | Riverpod 2 |
| BLE | flutter_blue_plus |
| Persistence | shared_preferences |
| Typography | Space Grotesk (Google Fonts) |

## Setup rápido

### Requisitos previos

1. Instalar Flutter SDK: https://docs.flutter.dev/get-started/install
2. Instalar Xcode (iOS) o Android Studio (Android)

### Primera vez en este repo

```bash
# 1. Clonar
git clone https://github.com/thelabsolutionscl/the-lamp.git
cd the-lamp

# 2. Generar archivos nativos (solo primera vez)
flutter create . --project-name the_lamp --org com.thelab --overwrite

# 3. Instalar dependencias
flutter pub get

# 4. Correr
flutter run
```

> El paso 2 (`flutter create --overwrite`) regenera los archivos de Android/iOS  
> sin tocar el código en `lib/` ni el `pubspec.yaml`.

### Desarrollo

```bash
flutter run          # hot reload activado
flutter run -d ios   # forzar iOS
flutter run -d android
```

## Arquitectura

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── theme/app_theme.dart       # Dark theme + LampColors extension
│   └── constants.dart             # Puertos, UUIDs, escenas
├── features/
│   ├── devices/
│   │   ├── models/lamp_device.dart          # Modelo + serialización JSON
│   │   ├── services/
│   │   │   ├── discovery_service.dart       # UDP broadcast discovery
│   │   │   └── magic_home_protocol.dart     # TCP control (checksum, comandos)
│   │   ├── providers/devices_provider.dart  # Riverpod state
│   │   └── screens/
│   │       ├── home_screen.dart             # Lista de dispositivos
│   │       └── device_control_screen.dart   # Control de color/blanco/escenas
│   └── ble/
│       └── ble_service.dart                 # BLE scan + control
└── shared/
    └── widgets/
        └── color_wheel_picker.dart          # Rueda de color custom (CustomPainter)
```

## Protocolo Magic Home

Los comandos TCP siguen el protocolo original:

| Acción | Bytes |
|---|---|
| Power ON | `71 23 0F` + checksum |
| Power OFF | `71 24 0F` + checksum |
| Set RGB | `31 R G B 00 F0 0F` + checksum |
| Set RGBW | `31 R G B W F0 0F` + checksum |
| Set Warm White | `31 00 00 00 WW 0F 0F` + checksum |
| Set CCT | `35 WW CW 00 00 0F 0F` + checksum |
| Query state | `81 8A 8B` + checksum |

**Checksum** = suma de todos los bytes & 0xFF

## Permisos requeridos

### Android
- `INTERNET`, `ACCESS_WIFI_STATE`, `CHANGE_WIFI_MULTICAST_STATE` — red
- `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT` — BLE (API 31+)
- `ACCESS_FINE_LOCATION` — BLE scan (Android < 12)

### iOS
- `NSBluetoothAlwaysUsageDescription`
- `NSLocalNetworkUsageDescription`

---

*Desarrollado por The Lab Solutions*
