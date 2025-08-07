"use strict";
/**
 * TypeScript example for testing code obfuscation.
 * This module demonstrates various TypeScript constructs that should be obfuscated.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = exports.UserService = exports.User = exports.BaseEntity = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "admin";
    UserRole["Member"] = "member";
    UserRole["Guest"] = "guest";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
class BaseEntity {
    constructor() {
        this.id = 0;
        this.createdAt = new Date();
    }
    getId() {
        return this.id;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getAgeInDays() {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
exports.BaseEntity = BaseEntity;
class User extends BaseEntity {
    constructor(name, email, role = UserRole.Member) {
        super();
        this.name = name;
        this.email = email;
        this.role = role;
        this.isActive = true;
    }
    getInfo() {
        return `User: ${this.name} (${this.email}) - ${this.role}`;
    }
    getDisplayName() {
        return `${this.name} <${this.email}>`;
    }
    updateEmail(newEmail) {
        if (this.validateEmail(newEmail)) {
            this.email = newEmail;
            return true;
        }
        return false;
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isAdmin() {
        return this.role === UserRole.Admin;
    }
    deactivate() {
        this.isActive = false;
    }
    activate() {
        this.isActive = true;
    }
    hasPermission(requiredRole) {
        const roleHierarchy = {
            [UserRole.Guest]: 0,
            [UserRole.Member]: 1,
            [UserRole.Admin]: 2
        };
        return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
    }
    toString() {
        return this.getDisplayName();
    }
}
exports.User = User;
class UserService {
    constructor() {
        this.users = new Map();
        this.nextId = 1;
    }
    addUser(userData) {
        const user = new User(userData.name, userData.email, userData.role);
        user['id'] = this.nextId; // Access protected property
        user.isActive = userData.isActive;
        this.users.set(this.nextId, user);
        return this.nextId++;
    }
    getUserById(id) {
        const user = this.users.get(id);
        return user || null;
    }
    getAllUsers() {
        return Array.from(this.users.values());
    }
    getActiveUsers() {
        return this.getAllUsers().filter(user => user.isActive);
    }
    getUsersByRole(role) {
        return this.getAllUsers().filter(user => user.role === role);
    }
    removeUser(id) {
        return this.users.delete(id);
    }
    updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) {
            return false;
        }
        Object.assign(user, updates);
        return true;
    }
    getUserCount() {
        return this.users.size;
    }
    getActiveUserCount() {
        return this.getActiveUsers().length;
    }
    printUserStats() {
        console.log(`Total users: ${this.getUserCount()}`);
        console.log(`Active users: ${this.getActiveUserCount()}`);
        Object.values(UserRole).forEach(role => {
            const count = this.getUsersByRole(role).length;
            console.log(`${role} users: ${count}`);
        });
    }
}
exports.UserService = UserService;
class UserManager {
    constructor(userService) {
        this.eventHandlers = new Map();
        this.userService = userService || new UserService();
        this.initializeEventHandlers();
    }
    initializeEventHandlers() {
        this.eventHandlers.set('userCreated', []);
        this.eventHandlers.set('userUpdated', []);
        this.eventHandlers.set('userDeleted', []);
    }
    addEventListener(event, handler) {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.push(handler);
        this.eventHandlers.set(event, handlers);
    }
    removeEventListener(event, handler) {
        const handlers = this.eventHandlers.get(event) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }
    emitEvent(event, data) {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(handler => handler(data));
    }
    createUser(name, email, role = UserRole.Member) {
        const userId = this.userService.addUser({ name, email, role, isActive: true });
        this.emitEvent('userCreated', { userId, name, email, role });
        return userId;
    }
    deleteUser(userId) {
        const user = this.userService.getUserById(userId);
        if (user && this.userService.removeUser(userId)) {
            this.emitEvent('userDeleted', { userId, user });
            return true;
        }
        return false;
    }
    updateUserRole(userId, newRole) {
        const success = this.userService.updateUser(userId, { role: newRole });
        if (success) {
            this.emitEvent('userUpdated', { userId, field: 'role', value: newRole });
        }
        return success;
    }
    getService() {
        return this.userService;
    }
}
exports.UserManager = UserManager;
//# sourceMappingURL=user.js.map