"""
Configuration Management for Flask Application

This module provides centralized configuration management that loads ALL settings 
from main_config.json without any hardcoded defaults. This ensures the JSON file
is the single source of truth for both Python and JavaScript code.

Features:
- Pure JSON-driven configuration (no Python defaults)
- Environment variable override support
- Dot notation access for nested values
- Runtime configuration updates
- Shared configuration between frontend and backend
"""

import json
import os
from typing import Any, Dict, Optional
from pathlib import Path

class ConfigManager:
    """Centralized configuration manager that relies entirely on JSON configuration"""
    
    def __init__(self):
        self.config_file = self._find_config_file()
        self.environment = os.getenv("FLASK_ENV", "development")
        self._config = self._load_config()
        if not self._config:
            raise RuntimeError(f"Configuration file {self.config_file} is required but not found or empty")
    
    def _find_config_file(self) -> Path:
        """Find the main configuration file"""
        # Try multiple possible locations
        possible_paths = [
            Path(__file__).parent.parent / "main_config.json",  # backend/main_config.json
            Path(__file__).parent.parent.parent / "main_config.json",  # project root/main_config.json
            Path("main_config.json"),  # current directory
        ]
        
        for path in possible_paths:
            if path.exists():
                return path
        
        # No fallback - require the config file to exist
        raise FileNotFoundError(
            f"Configuration file 'main_config.json' not found in any of these locations: "
            f"{[str(p) for p in possible_paths]}"
        )
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file - no defaults, pure JSON"""
        try:
            with open(self.config_file, 'r') as f:
                config_data = json.load(f)
            print(f"Configuration loaded from: {self.config_file}")
            
            if not config_data:
                raise ValueError("Configuration file is empty")
                
            return config_data
        except FileNotFoundError:
            raise FileNotFoundError(f"Required configuration file {self.config_file} not found")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in configuration file {self.config_file}: {e}")
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get a configuration value using dot notation.
        
        Args:
            key: Configuration key (supports dot notation like 'socketio.port')
            default: Default value if key is not found (only used if key missing from JSON)
            
        Returns:
            Configuration value from JSON or default if not found
        """
        # Check environment variables first (they override config file)
        env_key = key.upper().replace('.', '_').replace('-', '_')
        env_value = os.getenv(env_key)
        if env_value is not None:
            # Convert string env vars to appropriate types
            if env_value.lower() in ('true', 'false'):
                return env_value.lower() == 'true'
            if env_value.isdigit():
                return int(env_value)
            try:
                return float(env_value)
            except ValueError:
                return env_value
        
        # Get from JSON config file
        keys = key.split('.')
        value = self._config
        
        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            if default is None:
                available_keys = list(self._config.keys())
                raise KeyError(
                    f"Configuration key '{key}' not found in {self.config_file}. "
                    f"Available top-level keys: {available_keys}"
                )
            return default
    
    def get_all(self) -> Dict[str, Any]:
        """Get all configuration values from JSON"""
        return self._config.copy()
    
    def update(self, updates: Dict[str, Any]) -> bool:
        """
        Update configuration values and save to JSON file.
        
        Args:
            updates: Dictionary of configuration updates
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Deep update the config (for nested dictionaries)
            self._deep_update(self._config, updates)
            
            # Save to file
            with open(self.config_file, 'w') as f:
                json.dump(self._config, f, indent=4)
            
            print(f"Configuration updated and saved to {self.config_file}")
            return True
        except Exception as e:
            print(f"Error updating config file: {e}")
            return False
    
    def _deep_update(self, base_dict: Dict[str, Any], update_dict: Dict[str, Any]) -> None:
        """Deep update nested dictionaries"""
        for key, value in update_dict.items():
            if key in base_dict and isinstance(base_dict[key], dict) and isinstance(value, dict):
                self._deep_update(base_dict[key], value)
            else:
                base_dict[key] = value
    
    def reload(self) -> Dict[str, Any]:
        """
        Reload configuration from JSON file.
        
        Returns:
            Updated configuration dictionary
        """
        self._config = self._load_config()
        return self._config
    
    def has_key(self, key: str) -> bool:
        """
        Check if a configuration key exists in the JSON.
        
        Args:
            key: Configuration key (supports dot notation)
            
        Returns:
            True if key exists, False otherwise
        """
        keys = key.split('.')
        value = self._config
        
        try:
            for k in keys:
                value = value[k]
            return True
        except (KeyError, TypeError):
            return False
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """
        Get an entire configuration section.
        
        Args:
            section: Section name (e.g., 'socketio', 'flask')
            
        Returns:
            Configuration section dictionary
        """
        if section not in self._config:
            raise KeyError(f"Configuration section '{section}' not found in {self.config_file}")
        return self._config[section].copy()

# Global configuration instance
config_manager = ConfigManager()

# Direct access to the raw JSON configuration
config = config_manager.get_all()

# Convenience functions for easy access
def get_config(key: str, default: Any = None) -> Any:
    """Get a configuration value from JSON"""
    return config_manager.get(key, default)

def get_config_section(section: str) -> Dict[str, Any]:
    """Get an entire configuration section from JSON"""
    return config_manager.get_section(section)

def has_config(key: str) -> bool:
    """Check if a configuration key exists in JSON"""
    return config_manager.has_key(key)

def update_config(updates: Dict[str, Any]) -> bool:
    """Update configuration in JSON file"""
    return config_manager.update(updates)

def reload_config() -> Dict[str, Any]:
    """Reload configuration from JSON file"""
    global config
    config = config_manager.reload()
    return config

def list_config_keys() -> list:
    """List all top-level configuration keys available in JSON"""
    return list(config.keys())

# Validation - ensure required sections exist in JSON
required_sections = ["version", "frontend", "backend", "socketio"]
missing_sections = [section for section in required_sections if not has_config(section)]
if missing_sections:
    raise ValueError(f"Required configuration sections missing from JSON: {missing_sections}")

# Test function to validate the configuration
if __name__ == "__main__":
    print("Configuration loaded from JSON:")
    print(f"Available sections: {list_config_keys()}")
    print(f"Full configuration: {json.dumps(config, indent=2)}")