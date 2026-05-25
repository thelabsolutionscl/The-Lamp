import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import '../../../core/constants.dart';

/// Result of a single diagnostic check
class DiagResult {
  DiagResult({required this.label, this.ok, this.detail});
  final String label;
  final bool? ok; // null = pending/info
  final String? detail;
}

class DiagnosticsService {
  /// Full test against a device IP — returns results as they stream in
  Stream<DiagResult> runAll(String ip) async* {
    yield DiagResult(label: 'Target', detail: '$ip:${MagicHomeConstants.tcpPort}');

    // 1. Reachability via raw socket connect
    yield* _testTcp(ip);

    // 2. Query state
    yield* _testQueryState(ip);

    // 3. Power ON
    yield* _testCommand(ip, 'Send Power ON', [0x71, 0x23, 0x0F]);

    // 4. Set red
    yield* _testCommand(
        ip, 'Set Red (255,0,0)', [0x31, 0xFF, 0x00, 0x00, 0x00, 0xF0, 0x0F]);

    await Future.delayed(const Duration(milliseconds: 800));

    // 5. Set warm white
    yield* _testCommand(
        ip, 'Set Warm White (128)', [0x31, 0x00, 0x00, 0x00, 0x80, 0x0F, 0x0F]);

    await Future.delayed(const Duration(milliseconds: 800));

    // 6. Power OFF
    yield* _testCommand(ip, 'Send Power OFF', [0x71, 0x24, 0x0F]);
  }

  Stream<DiagResult> _testTcp(String ip) async* {
    yield DiagResult(label: 'TCP Connect', detail: 'connecting…');
    try {
      final sock = await Socket.connect(ip, MagicHomeConstants.tcpPort,
          timeout: const Duration(seconds: 4));
      sock.destroy();
      yield DiagResult(label: 'TCP Connect', ok: true, detail: 'Connected ✓');
    } catch (e) {
      yield DiagResult(label: 'TCP Connect', ok: false, detail: e.toString());
    }
  }

  Stream<DiagResult> _testQueryState(String ip) async* {
    yield DiagResult(label: 'Query State', detail: 'sending 81 8A 8B…');
    try {
      final sock = await Socket.connect(ip, MagicHomeConstants.tcpPort,
          timeout: const Duration(seconds: 4));
      final cmd = [0x81, 0x8A, 0x8B];
      final cs = cmd.fold(0, (s, b) => s + b) & 0xFF;
      sock.add([...cmd, cs]);
      await sock.flush();

      List<int>? response;
      try {
        response = await sock.first.timeout(const Duration(seconds: 3));
      } catch (_) {}
      sock.destroy();

      if (response == null || response.isEmpty) {
        yield DiagResult(
            label: 'Query State',
            ok: false,
            detail: 'No response from device');
        return;
      }

      final hex = response.map((b) => b.toRadixString(16).padLeft(2, '0')).join(' ');
      final isOn = response.length > 2 && response[2] == 0x23;
      final r = response.length > 6 ? response[6] : 0;
      final g = response.length > 7 ? response[7] : 0;
      final b = response.length > 8 ? response[8] : 0;
      final ww = response.length > 9 ? response[9] : 0;

      yield DiagResult(
        label: 'Query State',
        ok: true,
        detail: 'Power:${isOn ? "ON" : "OFF"}  RGB:$r,$g,$b  WW:$ww\nRaw: $hex',
      );
    } catch (e) {
      yield DiagResult(label: 'Query State', ok: false, detail: e.toString());
    }
  }

  Stream<DiagResult> _testCommand(
      String ip, String label, List<int> cmd) async* {
    try {
      final sock = await Socket.connect(ip, MagicHomeConstants.tcpPort,
          timeout: const Duration(seconds: 4));
      final cs = cmd.fold(0, (s, b) => s + b) & 0xFF;
      final full = [...cmd, cs];
      sock.add(full);
      await sock.flush();
      sock.destroy();
      final hex = full.map((b) => b.toRadixString(16).padLeft(2, '0')).join(' ');
      yield DiagResult(label: label, ok: true, detail: 'Sent: $hex');
    } catch (e) {
      yield DiagResult(label: label, ok: false, detail: e.toString());
    }
  }

  /// Quick UDP scan and return raw responses
  Future<List<String>> rawUdpScan() async {
    final responses = <String>[];
    RawDatagramSocket? sock;
    try {
      sock = await RawDatagramSocket.bind(
          InternetAddress.anyIPv4, MagicHomeConstants.udpPort,
          reuseAddress: true);
      sock.broadcastEnabled = true;
      sock.send(
          Uint8List.fromList(MagicHomeConstants.discoveryMessage.codeUnits),
          InternetAddress('255.255.255.255'),
          MagicHomeConstants.udpPort);

      final done = Completer<void>();
      Timer(const Duration(seconds: 3), () {
        sock?.close();
        if (!done.isCompleted) done.complete();
      });

      sock.listen((e) {
        if (e == RawSocketEvent.read) {
          final dg = sock!.receive();
          if (dg != null) {
            responses.add(
                '${dg.address.address} → "${String.fromCharCodes(dg.data).trim()}"');
          }
        }
      });

      await done.future;
    } catch (e) {
      responses.add('Error: $e');
    } finally {
      sock?.close();
    }
    return responses;
  }
}
