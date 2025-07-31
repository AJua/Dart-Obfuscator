import 'package:test/test.dart';
import '../lib/models/user.dart';
import '../lib/services/user_service.dart';

void main() {
  group('User', () {
    test('should create user with required fields', () {
      final user = User(
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      );

      expect(user.id, equals('1'));
      expect(user.name, equals('John Doe'));
      expect(user.email, equals('john@example.com'));
      expect(user.age, equals(30));
      expect(user.isActive, isTrue);
    });

    test('should convert to and from JSON', () {
      final user = User(
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 25,
        isActive: false,
      );

      final json = user.toJson();
      final userFromJson = User.fromJson(json);

      expect(userFromJson.id, equals(user.id));
      expect(userFromJson.name, equals(user.name));
      expect(userFromJson.email, equals(user.email));
      expect(userFromJson.age, equals(user.age));
      expect(userFromJson.isActive, equals(user.isActive));
    });

    test('should validate user data correctly', () {
      final validUser = User(
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      );

      final invalidUser = User(
        id: '',
        name: '',
        email: 'invalid-email',
        age: -5,
      );

      expect(validUser.isValid, isTrue);
      expect(invalidUser.isValid, isFalse);
    });
  });

  group('InMemoryUserService', () {
    late InMemoryUserService service;

    setUp(() {
      service = InMemoryUserService();
      service.clearAllUsers();
    });

    test('should create and retrieve user', () async {
      final user = User(
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      );

      await service.createUser(user);
      final retrievedUser = await service.getUserById('1');

      expect(retrievedUser, isNotNull);
      expect(retrievedUser!.name, equals('Test User'));
    });

    test('should throw exception when creating duplicate user', () async {
      final user = User(
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      );

      await service.createUser(user);

      expect(
        () async => await service.createUser(user),
        throwsA(isA<UserAlreadyExistsException>()),
      );
    });

    test('should update existing user', () async {
      final user = User(
        id: '1',
        name: 'Original Name',
        email: 'original@example.com',
        age: 25,
      );

      await service.createUser(user);

      final updatedUser = User(
        id: '1',
        name: 'Updated Name',
        email: 'updated@example.com',
        age: 30,
      );

      await service.updateUser(updatedUser);
      final retrievedUser = await service.getUserById('1');

      expect(retrievedUser!.name, equals('Updated Name'));
      expect(retrievedUser.email, equals('updated@example.com'));
      expect(retrievedUser.age, equals(30));
    });

    test('should delete user', () async {
      final user = User(
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      );

      await service.createUser(user);
      final deleted = await service.deleteUser('1');
      final retrievedUser = await service.getUserById('1');

      expect(deleted, isTrue);
      expect(retrievedUser, isNull);
    });
  });

  group('UserUtils', () {
    test('should validate email correctly', () {
      expect(UserUtils.isValidEmail('valid@example.com'), isTrue);
      expect(UserUtils.isValidEmail('invalid-email'), isFalse);
      expect(UserUtils.isValidEmail(''), isFalse);
    });

    test('should format display name correctly', () {
      expect(UserUtils.formatDisplayName('John', 'Doe'), equals('John Doe'));
      expect(UserUtils.formatDisplayName('Jane', ''), equals('Jane'));
      expect(UserUtils.formatDisplayName('', 'Smith'), equals('Smith'));
    });

    test('should generate user ID', () {
      final id1 = UserUtils.generateUserId();
      final id2 = UserUtils.generateUserId();

      expect(id1, isNotEmpty);
      expect(id2, isNotEmpty);
      expect(id1, isNot(equals(id2)));
    });
  });
}