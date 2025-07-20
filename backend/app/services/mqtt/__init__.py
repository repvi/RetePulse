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

# Import configuration first
from .config import MQTTConfig, get_config_value, reload_config

# Import SocketIO function from extensions
from ...extensions import socketio_device_status_update

# Then import service functions
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
    message_queue
)

# Package metadata
__version__ = "1.0.0"
__author__ = "repvi"
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
    
    # Configuration
    'MQTTConfig',
    'get_config_value',
    'reload_config',
    
    # SocketIO functions
    'socketio_device_status_update',
]
