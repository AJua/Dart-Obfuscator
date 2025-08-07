#!/usr/bin/env python3
"""
Python example for testing code obfuscation.
This module demonstrates various Python constructs that should be obfuscated.
"""

import datetime
from enum import Enum
from typing import List, Optional
from abc import ABC, abstractmethod


class UserRole(Enum):
    """User role enumeration."""
    ADMIN = "admin"
    MEMBER = "member"
    GUEST = "guest"


class BaseEntity(ABC):
    """Abstract base class for entities."""
    
    def __init__(self):
        self.id = None
        self.created_at = datetime.datetime.now()
    
    @abstractmethod
    def get_info(self) -> str:
        """Get entity information."""
        pass
    
    def get_age_days(self) -> int:
        """Get age in days since creation."""
        return (datetime.datetime.now() - self.created_at).days


class User(BaseEntity):
    """User class with basic user functionality."""
    
    def __init__(self, name: str, email: str, role: UserRole = UserRole.MEMBER):
        super().__init__()
        self.name = name
        self.email = email
        self.role = role
        self.is_active = True
    
    def get_info(self) -> str:
        """Get user information string."""
        return f"User: {self.name} ({self.email}) - {self.role.value}"
    
    def get_display_name(self) -> str:
        """Get formatted display name."""
        return f"{self.name} <{self.email}>"
    
    def update_email(self, new_email: str) -> bool:
        """Update user email address."""
        if self._validate_email(new_email):
            self.email = new_email
            return True
        return False
    
    def _validate_email(self, email: str) -> bool:
        """Private method to validate email format."""
        return "@" in email and "." in email
    
    def is_admin(self) -> bool:
        """Check if user has admin privileges."""
        return self.role == UserRole.ADMIN
    
    def deactivate_user(self):
        """Deactivate the user account."""
        self.is_active = False
    
    def __str__(self) -> str:
        return self.get_display_name()
    
    def __repr__(self) -> str:
        return f"User(name='{self.name}', email='{self.email}', role={self.role})"


class UserManager:
    """User management service class."""
    
    def __init__(self):
        self.users: List[User] = []
        self.next_id = 1
    
    def add_user(self, user: User) -> int:
        """Add a new user to the system."""
        user.id = self.next_id
        self.next_id += 1
        self.users.append(user)
        return user.id
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Retrieve user by ID."""
        for user in self.users:
            if user.id == user_id:
                return user
        return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Retrieve user by email address."""
        for user in self.users:
            if user.email == email:
                return user
        return None
    
    def get_all_users(self) -> List[User]:
        """Get all users in the system."""
        return self.users.copy()
    
    def get_active_users(self) -> List[User]:
        """Get only active users."""
        return [user for user in self.users if user.is_active]
    
    def remove_user(self, user_id: int) -> bool:
        """Remove user from the system."""
        user = self.get_user_by_id(user_id)
        if user:
            self.users.remove(user)
            return True
        return False
    
    def count_users(self) -> int:
        """Get total number of users."""
        return len(self.users)
    
    def count_users_by_role(self, role: UserRole) -> int:
        """Count users with specific role."""
        return len([user for user in self.users if user.role == role])
    
    def print_user_stats(self):
        """Print statistics about users."""
        print(f"Total users: {self.count_users()}")
        print(f"Active users: {len(self.get_active_users())}")
        for role in UserRole:
            count = self.count_users_by_role(role)
            print(f"{role.value.title()} users: {count}")


class Product:
    """Product class for e-commerce functionality."""
    
    def __init__(self, name: str, price: float, category: str):
        self.product_id = None
        self.name = name
        self.price = price
        self.category = category
        self.is_available = True
        self.created_at = datetime.datetime.now()
    
    def calculate_discounted_price(self, discount_percent: float) -> float:
        """Calculate price after discount."""
        return self.price * (1 - discount_percent / 100)
    
    def apply_discount(self, discount_percent: float):
        """Apply discount to product price."""
        self.price = self.calculate_discounted_price(discount_percent)
    
    def get_formatted_price(self) -> str:
        """Get formatted price string."""
        return f"${self.price:.2f}"
    
    def is_expensive(self, threshold: float = 100.0) -> bool:
        """Check if product is expensive."""
        return self.price > threshold
    
    def mark_unavailable(self):
        """Mark product as unavailable."""
        self.is_available = False
    
    def __str__(self) -> str:
        return f"{self.name} - {self.get_formatted_price()}"


def main():
    """Main function to demonstrate the code."""
    # Create user manager
    user_manager = UserManager()
    
    # Create sample users
    admin_user = User("Admin User", "admin@example.com", UserRole.ADMIN)
    regular_user = User("John Doe", "john@example.com", UserRole.MEMBER)
    guest_user = User("Guest User", "guest@example.com", UserRole.GUEST)
    
    # Add users to manager
    user_manager.add_user(admin_user)
    user_manager.add_user(regular_user)
    user_manager.add_user(guest_user)
    
    # Print user information
    print("=== User Management Demo ===")
    user_manager.print_user_stats()
    
    print("\nAll users:")
    for user in user_manager.get_all_users():
        print(f"  {user.get_info()}")
        print(f"    Admin: {user.is_admin()}")
        print(f"    Age: {user.get_age_days()} days")
    
    # Product demo
    print("\n=== Product Demo ===")
    laptop = Product("Gaming Laptop", 1299.99, "Electronics")
    book = Product("Python Programming", 39.99, "Books")
    
    print(f"Products:")
    print(f"  {laptop}")
    print(f"    Is expensive: {laptop.is_expensive()}")
    
    print(f"  {book}")
    print(f"    Is expensive: {book.is_expensive()}")
    
    # Apply discount
    laptop.apply_discount(10)
    print(f"  Laptop after 10% discount: {laptop}")
    
    print("\nPython example completed!")


if __name__ == "__main__":
    main()