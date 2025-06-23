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
MQTT_TOPIC_DIR_PROTOCOL = "prot/"
MQTT_TOPIC_SET_DEVICE = MQTT_TOPIC_DIR_PROTOCOL + "device/info"
MQTT_TOPIC_STATUS = MQTT_TOPIC_DIR_PROTOCOL + "status"

# Thread-safe queue for incoming MQTT messages
message_queue = queue.Queue()

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


# Map MQTT topics to processing functions
process_operations = {
    MQTT_TOPIC_SET_DEVICE : device_connection_info,
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
            data = json.loads(message.payload.decode('utf-8'))
            result = process_operations.get(message.topic, fallback)(data)
            print(result)
    except Exception as e:
        print(f"JSON parse error: {e}")

def on_connect(client, userdata, flags, rc) -> None:
    """
    MQTT callback for successful connection.
    Subscribes to the sensor topic.
    """
    print("Connected with result code " + str(rc))
    client.subscribe(MQTT_TOPIC_SENSOR)

def on_message(client, userdata, msg) -> None:
    """
    MQTT callback for incoming messages.
    Puts the message into the processing queue.
    """
    global message_queue
    message_queue.put(msg)

# Set up MQTT client and callbacks
mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION1)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, 1883, 60)
mqtt_client.loop_start()

# Start background thread for processing MQTT messages
processing_thread = threading.Thread(target=process_messages, daemon=True)
processing_thread.start()

def send_message(literal, message: str) -> None:
    """
    Publish a message to the specified MQTT topic.
    """
    mqtt_client.publish(literal, message)

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

    return True