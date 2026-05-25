import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../services/diagnostics_service.dart';

class DiagnosticsScreen extends StatefulWidget {
  const DiagnosticsScreen({super.key, this.initialIp});
  final String? initialIp;

  @override
  State<DiagnosticsScreen> createState() => _DiagnosticsScreenState();
}

class _DiagnosticsScreenState extends State<DiagnosticsScreen> {
  final _ipCtrl = TextEditingController();
  final _svc = DiagnosticsService();
  final _results = <DiagResult>[];
  final _udpResults = <String>[];
  bool _running = false;
  bool _scanningUdp = false;
  StreamSubscription? _sub;

  @override
  void initState() {
    super.initState();
    if (widget.initialIp != null) _ipCtrl.text = widget.initialIp!;
  }

  @override
  void dispose() {
    _sub?.cancel();
    _ipCtrl.dispose();
    super.dispose();
  }

  Future<void> _runDiag() async {
    final ip = _ipCtrl.text.trim();
    if (ip.isEmpty) return;
    setState(() {
      _results.clear();
      _running = true;
    });

    _sub = _svc.runAll(ip).listen(
      (r) => setState(() => _results.add(r)),
      onDone: () => setState(() => _running = false),
      onError: (_) => setState(() => _running = false),
    );
  }

  Future<void> _runUdp() async {
    setState(() {
      _udpResults.clear();
      _scanningUdp = true;
    });
    final res = await _svc.rawUdpScan();
    setState(() {
      _udpResults.addAll(res.isEmpty ? ['No responses (broadcast may be blocked by router)'] : res);
      _scanningUdp = false;
    });
  }

  void _copyLog() {
    final text = [
      'UDP Scan:',
      ..._udpResults,
      '',
      'TCP Test:',
      ..._results.map((r) => '[${r.ok == true ? "OK" : r.ok == false ? "FAIL" : "INFO"}] ${r.label}: ${r.detail ?? ""}'),
    ].join('\n');
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Log copiado'),
        backgroundColor: context.lc.surface,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lc = context.lc;

    return Scaffold(
      backgroundColor: lc.bg,
      appBar: AppBar(
        title: const Text('Diagnostics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy_rounded),
            tooltip: 'Copy log',
            onPressed: _copyLog,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── UDP Scan ──────────────────────────────────────────────
          _SectionHeader('UDP Discovery Scan', lc: lc),
          const SizedBox(height: 8),
          Text(
            'Broadcasts "HF-A11ASSISTHREAD" to 255.255.255.255:48899.\nEach Magic Home device on your network should respond.',
            style: TextStyle(color: lc.subtle, fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 12),
          _LampButton(
            label: _scanningUdp ? 'Scanning…' : 'Run UDP Scan (3 s)',
            loading: _scanningUdp,
            onTap: _scanningUdp ? null : _runUdp,
            lc: lc,
          ),
          if (_udpResults.isNotEmpty) ...[
            const SizedBox(height: 10),
            _LogBox(lines: _udpResults, lc: lc),
          ],

          const SizedBox(height: 28),

          // ── TCP Test ──────────────────────────────────────────────
          _SectionHeader('TCP Protocol Test', lc: lc),
          const SizedBox(height: 8),
          Text(
            'Connects to port 5577 and runs: query state → power ON → set red → set warm white → power OFF.',
            style: TextStyle(color: lc.subtle, fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 12),
          _IpField(controller: _ipCtrl, lc: lc),
          const SizedBox(height: 10),
          _LampButton(
            label: _running ? 'Running…' : 'Run Protocol Test',
            loading: _running,
            onTap: _running ? null : _runDiag,
            lc: lc,
          ),
          if (_results.isNotEmpty) ...[
            const SizedBox(height: 14),
            ..._results.map((r) => _ResultRow(result: r, lc: lc)),
          ],

          const SizedBox(height: 28),

          // ── Tips ─────────────────────────────────────────────────
          _SectionHeader('Common Issues', lc: lc),
          const SizedBox(height: 8),
          ..._tips(lc),
        ],
      ),
    );
  }

  List<Widget> _tips(LampColors lc) {
    const tips = [
      ('UDP no encuentra dispositivos',
          'Tu router puede bloquear broadcasts. Usa "Add manually" con la IP directa del dispositivo (búscala en el router o en la app Magic Home original).'),
      ('TCP: Connection refused',
          'El dispositivo está apagado, en modo AP (punto de acceso), o la IP cambió. Verifica que esté en tu red WiFi.'),
      ('TCP: Connection timed out',
          'El dispositivo no responde en 5 s. Prueba hacer ping desde una terminal: ping <IP>'),
      ('Query State: No response',
          'El dispositivo conecta pero no devuelve datos. Puede ser que necesite el flujo de autenticación de algunas versiones de firmware. Prueba igualmente enviar comandos de color — muchos dispositivos responden aunque query no funcione.'),
      ('Set color no hace nada',
          'Verifica el tipo de dispositivo (RGB vs RGBW vs CCT). Un dispositivo CCT ignora comandos de color.'),
    ];
    return tips
        .map((t) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: lc.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(t.$1,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 4),
                    Text(t.$2,
                        style: TextStyle(
                            color: lc.subtle, fontSize: 13, height: 1.4)),
                  ],
                ),
              ),
            ))
        .toList();
  }
}

// ─── Widgets ─────────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title, {required this.lc});
  final String title;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return Text(title,
        style: TextStyle(
            color: lc.amber,
            fontWeight: FontWeight.w700,
            fontSize: 13,
            letterSpacing: 0.5));
  }
}

class _LampButton extends StatelessWidget {
  const _LampButton(
      {required this.label,
      required this.lc,
      this.onTap,
      this.loading = false});
  final String label;
  final LampColors lc;
  final VoidCallback? onTap;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: onTap != null ? lc.amber : lc.subtle.withValues(alpha: 0.3),
          foregroundColor: Colors.black,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 13),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        onPressed: onTap,
        child: loading
            ? const SizedBox.square(
                dimension: 18,
                child: CircularProgressIndicator(
                    color: Colors.black, strokeWidth: 2))
            : Text(label,
                style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}

class _IpField extends StatelessWidget {
  const _IpField({required this.controller, required this.lc});
  final TextEditingController controller;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.number,
      style: const TextStyle(fontSize: 15, fontFamily: 'monospace'),
      decoration: InputDecoration(
        prefixIcon: Icon(Icons.router_rounded, color: lc.subtle, size: 18),
        hintText: '192.168.1.100',
        hintStyle: TextStyle(color: lc.subtle),
        filled: true,
        fillColor: lc.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: lc.amber, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }
}

class _LogBox extends StatelessWidget {
  const _LogBox({required this.lines, required this.lc});
  final List<String> lines;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: lc.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: lines
            .map((l) => Text(l,
                style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: Color(0xFF88CC88),
                    height: 1.6)))
            .toList(),
      ),
    );
  }
}

class _ResultRow extends StatelessWidget {
  const _ResultRow({required this.result, required this.lc});
  final DiagResult result;
  final LampColors lc;

  @override
  Widget build(BuildContext context) {
    final Color statusColor;
    final IconData statusIcon;
    if (result.ok == true) {
      statusColor = const Color(0xFF4ADE80);
      statusIcon = Icons.check_circle_rounded;
    } else if (result.ok == false) {
      statusColor = const Color(0xFFF87171);
      statusIcon = Icons.cancel_rounded;
    } else {
      statusColor = lc.amber;
      statusIcon = Icons.info_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: lc.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: statusColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(statusIcon, color: statusColor, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(result.label,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13)),
                if (result.detail != null)
                  Text(result.detail!,
                      style: TextStyle(
                          color: lc.subtle,
                          fontSize: 12,
                          fontFamily: result.detail!.startsWith('Sent:') ||
                                  result.detail!.startsWith('Raw:')
                              ? 'monospace'
                              : null,
                          height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
