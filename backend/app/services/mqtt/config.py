"""
MQTT Configuration Module

This module loads MQTT configuration from mqtt_config.json and provides
configuration constants and utilities without circular import issues.
"""
from app.config_module.config_helper import load_config, get_config_value
import platform

current_os = platform.system()

def _get_mqtt_broker():
    """Get MQTT broker based on config file or fallback to platform defaults"""
    broker_url = get_config_value(mqtt_config, 'mqtt-broker')
    if broker_url:
        # Extract just the hostname from mqtt://hostname:port format
        if broker_url.startswith('mqtt://'):
            return broker_url.replace('mqtt://', '').split(':')[0]
        return broker_url
    
    # Fallback to platform-specific defaults
    return "test.mosquitto.org" if current_os == "Windows" else "localhost"

# Load configuration
mqtt_config = load_config(__file__, 'mqtt_config.json')

# Configuration class with all MQTT constants
class MQTTConfig:
    """Class to hold MQTT configuration constants"""
    BROKER = _get_mqtt_broker()
    PORT = get_config_value(mqtt_config, 'mqtt-broker-port', 1883)
    TOPIC_LED = get_config_value(mqtt_config, 'topic.led', 'led')
    TOPIC_OTA = get_config_value(mqtt_config, 'topic.ota', 'ota')
    TOPIC_SENSOR = get_config_value(mqtt_config, 'topic.sensor', 'sensor')
    TOPIC_SET_DEVICE = get_config_value(mqtt_config, 'topic.device-info', 'device_info')
    TOPIC_DEVICE_RECONFIGURE = get_config_value(mqtt_config, 'send-topic.device-reconfigure', 'device_reconfigure')
    TOPIC_STATUS = get_config_value(mqtt_config, 'topic.status', 'status')

def reload_config():
    """Reload MQTT configuration from file"""
    global mqtt_config
    mqtt_config = load_config(__file__, 'mqtt_config.json')

    # Update MQTTConfig class attributes
    MQTTConfig.BROKER = _get_mqtt_broker()
    MQTTConfig.PORT = get_config_value(mqtt_config, 'mqtt-broker-port', 1883)
    MQTTConfig.TOPIC_LED = get_config_value(mqtt_config, 'topic.led', 'led')
    MQTTConfig.TOPIC_OTA = get_config_value(mqtt_config, 'topic.ota', 'ota')
    MQTTConfig.TOPIC_SENSOR = get_config_value(mqtt_config, 'topic.sensor', 'sensor')
    MQTTConfig.TOPIC_SET_DEVICE = get_config_value(mqtt_config, 'topic.device-info', 'device_info')
    MQTTConfig.TOPIC_DEVICE_RECONFIGURE = get_config_value(mqtt_config, 'send-topic.device-reconfigure', 'device_reconfigure')
    MQTTConfig.TOPIC_STATUS = get_config_value(mqtt_config, 'topic.status', 'status')

    return mqtt_config
