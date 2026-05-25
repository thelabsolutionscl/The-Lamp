import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:the_lamp/app.dart';
import 'package:the_lamp/features/devices/providers/devices_provider.dart';

// Notifier that never triggers a network scan (safe for tests)
class _NoOpDevicesNotifier extends DevicesNotifier {
  @override
  Future<void> scan() async {}
}

void main() {
  testWidgets('App renders home screen title', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          devicesProvider.overrideWith((_) => _NoOpDevicesNotifier()),
        ],
        child: const TheLampApp(),
      ),
    );
    await tester.pump();
    expect(find.text('The Lamp'), findsOneWidget);
  });
}
