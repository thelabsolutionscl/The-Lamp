import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/devices/screens/home_screen.dart';

class TheLampApp extends StatelessWidget {
  const TheLampApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'The Lamp',
      theme: AppTheme.dark(),
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
