"""
User model module for demonstrating Python class obfuscation.
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any
import datetime


@dataclass
class Address:
    """User address data class."""
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "USA"
    
    def get_full_address(self) -> str:
        """Get formatted full address."""
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}, {self.country}"
    
    def is_us_address(self) -> bool:
        """Check if address is in the United States."""
        return self.country.upper() in ["USA", "US", "UNITED STATES"]


class UserProfile:
    """Extended user profile with additional information."""
    
    def __init__(self, user_id: int, username: str):
        self.user_id = user_id
        self.username = username
        self.profile_data: Dict[str, Any] = {}
        self.address: Optional[Address] = None
        self.preferences = UserPreferences()
        self.last_updated = datetime.datetime.now()
    
    def set_address(self, address: Address):
        """Set user address."""
        self.address = address
        self._update_timestamp()
    
    def update_profile_field(self, field: str, value: Any):
        """Update a profile field."""
        self.profile_data[field] = value
        self._update_timestamp()
    
    def get_profile_field(self, field: str, default: Any = None) -> Any:
        """Get a profile field value."""
        return self.profile_data.get(field, default)
    
    def _update_timestamp(self):
        """Private method to update last modified timestamp."""
        self.last_updated = datetime.datetime.now()
    
    def has_complete_profile(self) -> bool:
        """Check if user has completed their profile."""
        required_fields = ["first_name", "last_name", "phone"]
        return all(field in self.profile_data for field in required_fields)
    
    def get_display_info(self) -> Dict[str, str]:
        """Get formatted display information."""
        info = {
            "username": self.username,
            "user_id": str(self.user_id),
            "last_updated": self.last_updated.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        if self.address:
            info["address"] = self.address.get_full_address()
        
        return info


class UserPreferences:
    """User preferences and settings."""
    
    def __init__(self):
        self.theme = "light"
        self.language = "en"
        self.notifications_enabled = True
        self.email_frequency = "daily"
        self.privacy_settings = {
            "profile_visible": True,
            "email_visible": False,
            "phone_visible": False
        }
    
    def set_theme(self, theme: str):
        """Set user interface theme."""
        if theme in ["light", "dark", "auto"]:
            self.theme = theme
    
    def set_language(self, language: str):
        """Set user language preference."""
        self.language = language
    
    def toggle_notifications(self):
        """Toggle notification settings."""
        self.notifications_enabled = not self.notifications_enabled
    
    def update_privacy_setting(self, setting: str, value: bool):
        """Update a privacy setting."""
        if setting in self.privacy_settings:
            self.privacy_settings[setting] = value
    
    def get_notification_preferences(self) -> Dict[str, Any]:
        """Get notification preferences."""
        return {
            "enabled": self.notifications_enabled,
            "frequency": self.email_frequency
        }
    
    def is_profile_public(self) -> bool:
        """Check if user profile is public."""
        return self.privacy_settings.get("profile_visible", False)