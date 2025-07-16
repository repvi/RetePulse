import os
import json

def load_config(_file_: str, json_file: str) -> dict:
    """
    Load MQTT configuration from mqtt_config.json
    Returns the configuration dictionary
    """
    config_path = os.path.join(os.path.dirname(_file_), json_file)
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"{json_file} not found at {config_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error parsing {json_file} config: {e}")
        return {}

def get_config_value(config, key, default=None):
    """
    Get a configuration value with optional default.
    
    Args:
        config: Configuration dictionary
        key: Configuration key (supports dot notation like 'topic.ota')
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