import 'package:meta/meta.dart';

/// A user model class
class User {
  /// User's unique identifier
  final String id;
  
  /// User's display name
  final String name;
  
  /// User's email address
  final String email;
  
  /// User's age
  final int age;
  
  /// Whether the user is active
  bool isActive;

  /// Creates a new User instance
  User({
    required this.id,
    required this.name,
    required this.email,
    required this.age,
    this.isActive = true,
  });

  /// Creates a User from JSON
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      age: json['age'] as int,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  /// Converts User to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'age': age,
      'isActive': isActive,
    };
  }

  /// Updates user's active status
  void updateActiveStatus(bool status) {
    isActive = status;
  }

  /// Gets user's full info as string
  String get fullInfo => '$name ($email) - Age: $age';

  /// Validates user data
  bool get isValid {
    return id.isNotEmpty && 
           name.isNotEmpty && 
           email.contains('@') && 
           age > 0;
  }

  @override
  String toString() {
    return 'User{id: $id, name: $name, email: $email, age: $age, isActive: $isActive}';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}