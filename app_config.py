"""
app_config.py
-------------
Configuration and utility functions for the MicroUSC-Sentinel Flask application.

Features:
- MQTT client setup and message handling
- Device connection info broadcasting via Flask-SocketIO
- Message processing in a background thread
- Utility functions for sending MQTT messages and running Flask

Dependencies:
- Flask app instance from app_instance.py
- paho-mqtt for MQTT communication
- Flask-SocketIO for real-time updates to frontend
- threading, multiprocessing, queue, json, platform
"""

from typing import Optional
from app_instance import app
import paho.mqtt.client as mqtt
from multiprocessing import Process
import platform
import queue
import json
import threading
from flask_socketio import SocketIO, emit

# Initialize Flask-SocketIO for real-time communication
socketio = SocketIO(app, cors_allowed_origins="*")  # Allow all origins for dev

# Fallback function for unrecognized MQTT topics
fallback = lambda *args: "Invalid"

# Configuration constants
CONFIG_DEBUG = True
MQTT_BROKER = "test.mosquitto.org" # for windows
# MQTT_BROKER = "localhost" # for linux
MQTT_TOPIC_LED = "led"
MQTT_TOPIC_OTA = "ota"
MQTT_TOPIC_SENSOR = "sensor"
MQTT_TOPIC_SET_DEVICE = "device_info"
MQTT_TOPIC_STATUS = "device/status"

# Thread-safe queue for incoming MQTT messages
message_queue = queue.Queue()
mqtt_client: Optional[mqtt.Client] = None

class MQTTMessage:
    """Represents an MQTT message with topic and payload."""
    def __init__(self, client_id: str, topic: str, payload: str):
        self.client_id = client_id
        self.topic = topic
        self.payload = payload

def device_connection_info(data) -> None:
    """
    Emit device connection info to all connected SocketIO clients.
    Used when a device connects and sends its info.
    """
    socketio.emit('device_update', {
        'device_name' : data['device_name'],
        'device_model' :  data['device_model'],
        'last_updated' :  data['last_updated'],
        'status' : 'connected',
        'sensor_type' : data['sensor_type']
    })

def device_sensor_data(data) -> None:
    pass

# Map MQTT topics to processing functions
process_operations = {
    MQTT_TOPIC_SET_DEVICE : device_connection_info,
    MQTT_TOPIC_SENSOR : device_sensor_data,
}

def process_messages() -> None:
    """
    Background thread function to process messages from the MQTT queue.
    Decodes JSON payloads and dispatches to the appropriate handler.
    """
    try:
        global message_queue
        while True:
            message = message_queue.get()
            data = json.loads(message.payload)
            result = process_operations.get(message.topic, fallback)(data)
            print(result)
    except Exception as e:
        print(f"JSON parse error: {e}")

def on_connect(client, userdata, flags, rc) -> None:
    """MQTT callback for successful connection."""
    client_id = client._client_id.decode()
    print(f"Device {client_id} connected with result code {rc}")
    client.subscribe(MQTT_TOPIC_SENSOR + f"/{client_id}")

def on_message(client, userdata, msg) -> None:
    """
    MQTT callback for incoming messages.
    Puts the message into the processing queue
    """
    global message_queue
    message_data = MQTTMessage(
        client_id=client._client_id.decode(),
        topic=msg.topic,
        payload=msg.payload.decode('utf-8')
    )
    message_queue.put(message_data)

# Set up MQTT client and callbacks

def start_mqtt_client() -> bool:
    """
    Initialize and start the MQTT client.
    Connects to the broker and sets up callbacks.
    """
    global mqtt_client
    mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION1)
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message
    
    status = mqtt_client.connect(MQTT_BROKER, 1883, 60)
    if status != mqtt.MQTT_ERR_SUCCESS:
        print(f"Failed to connect to MQTT broker: {status}")
        return False
    
    status = mqtt_client.loop_start()
    if status != mqtt.MQTT_ERR_SUCCESS:
        print(f"Failed to start MQTT loop: {status}")
        return False
    
    if not mqtt_client.is_connected():
        print("MQTT client is not connected.")
        return False
    
    return True

# Start background thread for processing MQTT messages
processing_thread = threading.Thread(target=process_messages, daemon=True)
processing_thread.start()

def send_message(topic: str, message: str) -> None:
    """
    Publish a message to the specified MQTT topic.
    """
    global mqtt_client
    mqtt_client.publish(topic, message)

def run_flask(host, port, debug) -> bool:
    """
    Start the Flask application.
    - On Windows: runs Flask directly.
    - On Linux: runs Flask directly if debug, otherwise starts in a separate process.
    Returns True if started successfully, False otherwise.
    """
    current_os = platform.system()
    if current_os == "Windows":
        app.run(host=host, port=port, debug=debug)
    elif current_os == "Linux":
        if CONFIG_DEBUG is True:
            app.run(host=host, port=port, debug=debug)
        else:
            frontend_process = Process(target=run_flask, args=(host, port, debug))
            frontend_process.start()
    else:
        return False
    
    return start_mqtt_client()