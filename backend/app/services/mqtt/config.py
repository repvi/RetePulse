"""
MQTT Configuration Module

This module loads MQTT configuration from mqtt_config.json and provides
configuration constants and utilities without circular import issues.
"""

import json
import os
import platform

current_os = platform.system()

def _load_mqtt_config():
    """
    Load MQTT configuration from mqtt_config.json
    Returns the configuration dictionary
    """
    config_path = os.path.join(os.path.dirname(__file__), 'mqtt_config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"MQTT config file not found at {config_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error parsing MQTT config: {e}")
        return {}

def _get_config_value(config, key, default=None):
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

def _get_mqtt_broker():
    """Get MQTT broker based on config file or fallback to platform defaults"""
    broker_url = _get_config_value(mqtt_config, 'mqtt-broker')
    if broker_url:
        # Extract just the hostname from mqtt://hostname:port format
        if broker_url.startswith('mqtt://'):
            return broker_url.replace('mqtt://', '').split(':')[0]
        return broker_url
    
    # Fallback to platform-specific defaults
    return "test.mosquitto.org" if current_os == "Windows" else "localhost"

# Load configuration
mqtt_config = _load_mqtt_config()

# Configuration class with all MQTT constants
class MQTTConfig:
    """Class to hold MQTT configuration constants"""
    BROKER = _get_mqtt_broker()
    PORT = _get_config_value(mqtt_config, 'mqtt-broker-port', 1883)
    TOPIC_LED = _get_config_value(mqtt_config, 'topic.led', 'led')
    TOPIC_OTA = _get_config_value(mqtt_config, 'topic.ota', 'ota')
    TOPIC_SENSOR = _get_config_value(mqtt_config, 'topic.sensor', 'sensor')
    TOPIC_SET_DEVICE = _get_config_value(mqtt_config, 'topic.device-info', 'device_info')
    TOPIC_DEVICE_RECONFIGURE = _get_config_value(mqtt_config, 'topic.device-reconfigure', 'device_reconfigure')
    TOPIC_STATUS = _get_config_value(mqtt_config, 'topic.status', 'status')

# Export configuration utilities
def get_config_value(key, default=None):
    """Get a configuration value from loaded MQTT config"""
    return _get_config_value(mqtt_config, key, default)

def reload_config():
    """Reload MQTT configuration from file"""
    global mqtt_config
    mqtt_config = _load_mqtt_config()
    
    # Update MQTTConfig class attributes
    MQTTConfig.BROKER = _get_mqtt_broker()
    MQTTConfig.PORT = _get_config_value(mqtt_config, 'mqtt-broker-port', 1883)
    MQTTConfig.TOPIC_LED = _get_config_value(mqtt_config, 'topic.led', 'led')
    MQTTConfig.TOPIC_OTA = _get_config_value(mqtt_config, 'topic.ota', 'ota')
    MQTTConfig.TOPIC_SENSOR = _get_config_value(mqtt_config, 'topic.sensor', 'sensor')
    MQTTConfig.TOPIC_SET_DEVICE = _get_config_value(mqtt_config, 'topic.device-info', 'device_info')
    MQTTConfig.TOPIC_DEVICE_RECONFIGURE = _get_config_value(mqtt_config, 'topic.device-reconfigure', 'device_reconfigure')
    MQTTConfig.TOPIC_STATUS = _get_config_value(mqtt_config, 'topic.status', 'status')
    
    return mqtt_config
