/// Main library file for dart_example
library dart_example;

export 'models/user.dart';
export 'services/user_service.dart';

/// Application constants
class AppConstants {
  static const String appName = 'Dart Example';
  static const String version = '1.0.0';
  static const int maxUsers = 1000;
  static const Duration defaultTimeout = Duration(seconds: 30);
}

/// Application configuration
enum Environment {
  development,
  staging,
  production,
}

/// Main application class
class DartExampleApp {
  final Environment environment;
  final UserService userService;

  DartExampleApp({
    required this.environment,
    UserService? userService,
  }) : userService = userService ?? InMemoryUserService();

  /// Starts the application
  Future<void> start() async {
    print('Starting ${AppConstants.appName} v${AppConstants.version}');
    print('Environment: ${environment.name}');
    
    // Initialize services
    await _initializeServices();
    
    print('Application started successfully');
  }

  /// Initializes all services
  Future<void> _initializeServices() async {
    // Service initialization logic would go here
    await Future.delayed(const Duration(milliseconds: 100));
  }

  /// Stops the application
  Future<void> stop() async {
    print('Stopping application...');
    // Cleanup logic would go here
    print('Application stopped');
  }
}