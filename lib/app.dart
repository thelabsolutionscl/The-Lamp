import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/permissions_gate.dart';
import 'features/devices/screens/home_screen.dart';

class TheLampApp extends StatelessWidget {
  const TheLampApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'The Lamp',
      theme: AppTheme.dark(),
      debugShowCheckedModeBanner: false,
      home: const PermissionsGate(child: HomeScreen()),
    );
  }
}
