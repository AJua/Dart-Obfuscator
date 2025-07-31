import '../models/user.dart';

/// Service for managing users
abstract class UserService {
  /// Gets all users
  Future<List<User>> getAllUsers();
  
  /// Gets a user by ID
  Future<User?> getUserById(String id);
  
  /// Creates a new user
  Future<User> createUser(User user);
  
  /// Updates an existing user
  Future<User> updateUser(User user);
  
  /// Deletes a user
  Future<bool> deleteUser(String id);
}

/// In-memory implementation of UserService
class InMemoryUserService implements UserService {
  final Map<String, User> _users = {};
  
  /// Private constructor for singleton pattern
  InMemoryUserService._();
  
  /// Singleton instance
  static final InMemoryUserService _instance = InMemoryUserService._();
  
  /// Factory constructor returning singleton
  factory InMemoryUserService() => _instance;

  @override
  Future<List<User>> getAllUsers() async {
    await _simulateDelay();
    return _users.values.toList();
  }

  @override
  Future<User?> getUserById(String id) async {
    await _simulateDelay();
    return _users[id];
  }

  @override
  Future<User> createUser(User user) async {
    await _simulateDelay();
    if (_users.containsKey(user.id)) {
      throw UserAlreadyExistsException('User with ID ${user.id} already exists');
    }
    _users[user.id] = user;
    return user;
  }

  @override
  Future<User> updateUser(User user) async {
    await _simulateDelay();
    if (!_users.containsKey(user.id)) {
      throw UserNotFoundException('User with ID ${user.id} not found');
    }
    _users[user.id] = user;
    return user;
  }

  @override
  Future<bool> deleteUser(String id) async {
    await _simulateDelay();
    return _users.remove(id) != null;
  }

  /// Simulates network delay
  Future<void> _simulateDelay() async {
    await Future.delayed(const Duration(milliseconds: 100));
  }

  /// Clears all users (for testing)
  void clearAllUsers() {
    _users.clear();
  }
}

/// Exception thrown when user already exists
class UserAlreadyExistsException implements Exception {
  final String message;
  UserAlreadyExistsException(this.message);
  
  @override
  String toString() => 'UserAlreadyExistsException: $message';
}

/// Exception thrown when user is not found
class UserNotFoundException implements Exception {
  final String message;
  UserNotFoundException(this.message);
  
  @override
  String toString() => 'UserNotFoundException: $message';
}

/// User management utilities
class UserUtils {
  /// Private constructor to prevent instantiation
  UserUtils._();

  /// Validates email format
  static bool isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  /// Generates a random user ID
  static String generateUserId() {
    return DateTime.now().millisecondsSinceEpoch.toString();
  }

  /// Formats user display name
  static String formatDisplayName(String firstName, String lastName) {
    return '$firstName $lastName'.trim();
  }
}