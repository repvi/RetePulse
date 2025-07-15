"""
MQTT Service Package for IoT Device Communication

This package provides MQTT client functionality for communicating with IoT devices,
including device status monitoring, sensor data collection, and device management.

Main Components:
- MQTTMessage: Message handling class
- Device management functions (subscribe/unsubscribe)
- Message processing and routing
- MQTT client lifecycle management
"""

from .mqtt_service import (
    # Core MQTT client functions
    start_mqtt_client,
    send_message,
    
    # Device management functions
    set_device_subscriptions,
    device_unsubscribe,
    get_device_from_db,
    
    # Message processing functions
    device_connection_info,
    device_set_status,
    device_sensor_data,
    process_messages,
    
    # MQTT event handlers
    on_connect,
    on_message,
    
    # Message queue and classes
    MQTTMessage,
    message_queue,
    
    # Topic constants
    MQTT_TOPIC_LED,
    MQTT_TOPIC_OTA,
    MQTT_TOPIC_SENSOR,
    MQTT_TOPIC_SET_DEVICE,
    MQTT_TOPIC_DEVICE_RECONFIGURE,
    MQTT_TOPIC_STATUS,
    
    # Configuration
    MQTT_BROKER,
    MQTT_PORT,
    mqtt_config,
    load_mqtt_config,
    get_config_value,
    reload_config
)

# Package metadata
__version__ = "1.0.0"
__author__ = "MicroUSC-Sentinel Team"
__description__ = "MQTT service for IoT device communication"

# Public API
__all__ = [
    # Core functions
    'start_mqtt_client',
    'send_message',
    
    # Device management
    'set_device_subscriptions',
    'device_unsubscribe',
    'get_device_from_db',
    
    # Message processing
    'device_connection_info',
    'device_set_status',
    'device_sensor_data',
    'process_messages',
    
    # Event handlers
    'on_connect',
    'on_message',
    
    # Classes and data structures
    'MQTTMessage',
    'message_queue',
    
    # Constants
    'MQTT_TOPIC_LED',
    'MQTT_TOPIC_OTA',
    'MQTT_TOPIC_SENSOR',
    'MQTT_TOPIC_SET_DEVICE',
    'MQTT_TOPIC_DEVICE_RECONFIGURE',
    'MQTT_TOPIC_STATUS',
    'MQTT_BROKER',
    'MQTT_PORT',
    
    # Configuration
    'mqtt_config',
    'load_mqtt_config',
    'get_config_value',
    'reload_config',
]

# Configuration functions are now imported from mqtt_service
# No need to redefine them here to avoid circular imports
