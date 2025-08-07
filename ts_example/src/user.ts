/**
 * TypeScript example for testing code obfuscation.
 * This module demonstrates various TypeScript constructs that should be obfuscated.
 */

export enum UserRole {
    Admin = 'admin',
    Member = 'member',
    Guest = 'guest'
}

export interface IUserData {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
}

export interface IUserService {
    addUser(userData: Omit<IUserData, 'id' | 'createdAt'>): number;
    getUserById(id: number): IUserData | null;
    getAllUsers(): IUserData[];
    removeUser(id: number): boolean;
    updateUser(id: number, updates: Partial<IUserData>): boolean;
}

export abstract class BaseEntity {
    protected id: number = 0;
    protected createdAt: Date;

    constructor() {
        this.createdAt = new Date();
    }

    public getId(): number {
        return this.id;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public abstract getInfo(): string;

    public getAgeInDays(): number {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

export class User extends BaseEntity implements IUserData {
    public name: string;
    public email: string;
    public role: UserRole;
    public isActive: boolean;

    constructor(name: string, email: string, role: UserRole = UserRole.Member) {
        super();
        this.name = name;
        this.email = email;
        this.role = role;
        this.isActive = true;
    }

    public getInfo(): string {
        return `User: ${this.name} (${this.email}) - ${this.role}`;
    }

    public getDisplayName(): string {
        return `${this.name} <${this.email}>`;
    }

    public updateEmail(newEmail: string): boolean {
        if (this.validateEmail(newEmail)) {
            this.email = newEmail;
            return true;
        }
        return false;
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public isAdmin(): boolean {
        return this.role === UserRole.Admin;
    }

    public deactivate(): void {
        this.isActive = false;
    }

    public activate(): void {
        this.isActive = true;
    }

    public hasPermission(requiredRole: UserRole): boolean {
        const roleHierarchy = {
            [UserRole.Guest]: 0,
            [UserRole.Member]: 1,
            [UserRole.Admin]: 2
        };

        return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
    }

    public toString(): string {
        return this.getDisplayName();
    }
}

export class UserService implements IUserService {
    private users: Map<number, User> = new Map();
    private nextId: number = 1;

    public addUser(userData: Omit<IUserData, 'id' | 'createdAt'>): number {
        const user = new User(userData.name, userData.email, userData.role);
        user['id'] = this.nextId; // Access protected property
        user.isActive = userData.isActive;
        
        this.users.set(this.nextId, user);
        return this.nextId++;
    }

    public getUserById(id: number): IUserData | null {
        const user = this.users.get(id);
        return user || null;
    }

    public getAllUsers(): IUserData[] {
        return Array.from(this.users.values());
    }

    public getActiveUsers(): IUserData[] {
        return this.getAllUsers().filter(user => user.isActive);
    }

    public getUsersByRole(role: UserRole): IUserData[] {
        return this.getAllUsers().filter(user => user.role === role);
    }

    public removeUser(id: number): boolean {
        return this.users.delete(id);
    }

    public updateUser(id: number, updates: Partial<IUserData>): boolean {
        const user = this.users.get(id);
        if (!user) {
            return false;
        }

        Object.assign(user, updates);
        return true;
    }

    public getUserCount(): number {
        return this.users.size;
    }

    public getActiveUserCount(): number {
        return this.getActiveUsers().length;
    }

    public printUserStats(): void {
        console.log(`Total users: ${this.getUserCount()}`);
        console.log(`Active users: ${this.getActiveUserCount()}`);
        
        Object.values(UserRole).forEach(role => {
            const count = this.getUsersByRole(role).length;
            console.log(`${role} users: ${count}`);
        });
    }
}

export class UserManager {
    private userService: IUserService;
    private eventHandlers: Map<string, Function[]> = new Map();

    constructor(userService?: IUserService) {
        this.userService = userService || new UserService();
        this.initializeEventHandlers();
    }

    private initializeEventHandlers(): void {
        this.eventHandlers.set('userCreated', []);
        this.eventHandlers.set('userUpdated', []);
        this.eventHandlers.set('userDeleted', []);
    }

    public addEventListener(event: string, handler: Function): void {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.push(handler);
        this.eventHandlers.set(event, handlers);
    }

    public removeEventListener(event: string, handler: Function): void {
        const handlers = this.eventHandlers.get(event) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }

    private emitEvent(event: string, data: any): void {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(handler => handler(data));
    }

    public createUser(name: string, email: string, role: UserRole = UserRole.Member): number {
        const userId = this.userService.addUser({ name, email, role, isActive: true });
        this.emitEvent('userCreated', { userId, name, email, role });
        return userId;
    }

    public deleteUser(userId: number): boolean {
        const user = this.userService.getUserById(userId);
        if (user && this.userService.removeUser(userId)) {
            this.emitEvent('userDeleted', { userId, user });
            return true;
        }
        return false;
    }

    public updateUserRole(userId: number, newRole: UserRole): boolean {
        const success = this.userService.updateUser(userId, { role: newRole });
        if (success) {
            this.emitEvent('userUpdated', { userId, field: 'role', value: newRole });
        }
        return success;
    }

    public getService(): IUserService {
        return this.userService;
    }
}