"""
OTA (Over-The-Air) Service Package for Firmware Updates

This package provides OTA firmware update functionality for IoT devices,
including file upload handling, validation, and MQTT-based update triggers.

Main Components:
- Configuration management for OTA settings
- File upload validation and processing
- Firmware storage and distribution
- MQTT integration for update notifications
"""

import json
import os
from typing import List, Dict, Any, Optional

# Configuration loader for OTA settings
def load_ota_config() -> Dict[str, Any]:
    """
    Load OTA configuration from ota_config.json
    Returns the configuration dictionary
    """
    config_path = os.path.join(os.path.dirname(__file__), 'ota_config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"OTA config file not found at {config_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error parsing OTA config: {e}")
        return {}

def get_ota_config_value(config: Dict[str, Any], key: str, default: Any = None) -> Any:
    """
    Get an OTA configuration value with optional default.
    
    Args:
        config: Configuration dictionary
        key: Configuration key (supports dot notation like 'storage.path')
        default: Default value if key is not found
    
    Returns:
        Configuration value or default
    """
    if not config:
        return default
    
    # Support dot notation for nested keys
    keys = key.split('.')
    value = config
    
    try:
        for k in keys:
            value = value[k]
        return value
    except (KeyError, TypeError):
        return default

# Load OTA configuration
ota_config = load_ota_config()

def get_upload_folder() -> str:
    """Get the firmware upload folder path from config or fallback"""
    path = get_ota_config_value(ota_config, 'file-storage-path')
    if path:
        resolved = os.path.abspath(path)
        print(f"[OTA] Using configured firmware folder: {resolved}")
        return resolved

    # Use firmware folder inside the ota service directory
    ota_dir = os.path.dirname(os.path.abspath(__file__))
    firmware_folder = os.path.join(ota_dir, 'firmware')
    print(f"[OTA] Using OTA-local firmware folder: {firmware_folder}")
    return firmware_folder

from typing import Set

def get_allowed_extensions() -> Set[str]:
    """Get allowed file extensions from config or fallback"""
    extensions = get_ota_config_value(ota_config, 'allowed-extensions', ['.bin'])
    # Remove dots if present and convert to set for faster lookup
    return {ext.lstrip('.').lower() for ext in extensions}

# Configuration-based constants
UPLOAD_FOLDER = get_upload_folder()
ALLOWED_EXTENSIONS = get_allowed_extensions()

def reload_ota_config() -> Dict[str, Any]:
    """
    Reload OTA configuration from file.
    Useful for runtime configuration updates.
    """
    global ota_config, UPLOAD_FOLDER, ALLOWED_EXTENSIONS
    
    ota_config = load_ota_config()
    
    # Reload all configuration-based constants
    UPLOAD_FOLDER = get_upload_folder()
    ALLOWED_EXTENSIONS = get_allowed_extensions()
    
    return ota_config

# Utility functions for easy configuration access
def is_file_allowed(filename: str) -> bool:
    """
    Check if a file extension is allowed based on configuration.
    
    Args:
        filename: Name of the file to check
        
    Returns:
        True if file extension is allowed, False otherwise
    """
    if not filename or '.' not in filename:
        return False
    
    file_ext = filename.rsplit('.', 1)[1].lower()
    return file_ext in ALLOWED_EXTENSIONS

def get_firmware_path(filename: str) -> str:
    """
    Get the full path where a firmware file should be stored.
    
    Args:
        filename: Name of the firmware file
        
    Returns:
        Full path to store the file
    """
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    return os.path.join(UPLOAD_FOLDER, filename)

def validate_ota_config() -> Dict[str, Any]:
    """
    Validate the current OTA configuration and return status.
    
    Returns:
        Dictionary with validation results
    """
    validation = {
        'valid': True,
        'errors': [],
        'warnings': []
    }
    
    # Check if upload folder is accessible
    try:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        if not os.access(UPLOAD_FOLDER, os.W_OK):
            validation['errors'].append(f"Upload folder {UPLOAD_FOLDER} is not writable")
            validation['valid'] = False
    except Exception as e:
        validation['errors'].append(f"Cannot create upload folder {UPLOAD_FOLDER}: {e}")
        validation['valid'] = False
    
    # Check if allowed extensions are configured
    if not ALLOWED_EXTENSIONS:
        validation['warnings'].append("No allowed file extensions configured")
    
    # Check if config file exists
    config_path = os.path.join(os.path.dirname(__file__), 'ota_config.json')
    if not os.path.exists(config_path):
        validation['warnings'].append("OTA config file not found, using defaults")
    
    return validation

# Import OTA functions after utility functions are defined
from .ota import (
    allowed_file,
    upload_file,
)

# Package metadata
__version__ = "1.0.0"
__author__ = "repvi"
__description__ = "OTA firmware update service for IoT devices"

# Public API
__all__ = [
    # Core OTA functions
    'allowed_file',
    'upload_file',
    
    # Configuration management
    'ota_config',
    'load_ota_config',
    'get_ota_config_value',
    'reload_ota_config',
    'get_upload_folder',
    'get_allowed_extensions',
    
    # Utility functions
    'is_file_allowed',
    'get_firmware_path',
    'validate_ota_config',
    
    # Configuration constants
    'UPLOAD_FOLDER',
    'ALLOWED_EXTENSIONS',
]
