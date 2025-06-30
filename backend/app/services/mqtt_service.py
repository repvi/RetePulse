import paho.mqtt.client as mqtt
from ..extensions import db, socketio, app
from sqlalchemy import select
from models import Device
import threading
from typing import Optional
import platform
import queue
import json

current_os = platform.system()

# Fallback function for unrecognized MQTT topics
fallback = lambda *args: "Invalid"

MQTT_BROKER = None
if current_os == "Windows":
    MQTT_BROKER = "test.mosquitto.org" # for windows
elif current_os == "Linux":
    MQTT_BROKER = "localhost" # for linux

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
    with app.app_context():
        try:
            device_name = data['device_name']
            device_model = data['device_model']
            status = 'connected'
            sensor_type = data['sensor_type']
            last_updated = data['last_updated']
            # Use modern select pattern
            stmt = select(Device).where(Device.name == device_name)
            existing_device = db.session.execute(stmt).scalar_one_or_none()

            if existing_device:
                existing_device.name = device_name
                existing_device.model = device_model
                existing_device.status = status
                existing_device.sensor_type = sensor_type
                existing_device.last_updated = last_updated
            else:
                new_device = Device(
                    name=device_name,
                    model=device_model,
                    status=status,
                    sensor_type=sensor_type,
                    last_updated=last_updated
                )
                db.session.add(new_device)

            db.session.commit()

            # Emit update after successful database operation
            socketio.emit('device_update', {
                'device_name': device_name,
                'device_model': device_model,
                'last_updated': last_updated,
                'status': status,
                'sensor_type': sensor_type
            })

        except Exception as e:
            print(f"Database error in device_connection_info: {str(e)}")
            db.session.rollback()

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
    client.subscribe(MQTT_TOPIC_SET_DEVICE)

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
    
# Start background thread for processing MQTT messages
processing_thread = threading.Thread(target=process_messages, daemon=True)
processing_thread.start()

def send_message(topic: str, message: str) -> None:
    """
    Publish a message to the specified MQTT topic.
    """
    global mqtt_client
    mqtt_client.publish(topic, message)

def start_mqtt_client() -> bool:
    """
    Initialize and start the MQTT client.
    Connects to the broker and sets up callbacks.
    """
    global mqtt_client
    try:
        mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION1)
        mqtt_client.on_connect = on_connect
        mqtt_client.on_message = on_message

        retry_count = 3
        for attempt in range(retry_count):
            print(f"Attempting to connect to MQTT broker (Attempt {attempt + 1}/{retry_count})")
            status = mqtt_client.connect(MQTT_BROKER, 1883, 60)
            if status == mqtt.MQTT_ERR_SUCCESS:
                status = mqtt_client.loop_start()
                if status == mqtt.MQTT_ERR_SUCCESS:
                    import time
                    time.sleep(1)

                    if mqtt_client.is_connected():
                        print("MQTT client connected successfully.")
                        return True
            print(f"Connection attempt {attempt + 1} failed. Retrying...")
            time.sleep(2)  # Wait before retrying
        print("Failed to connect to MQTT broker after multiple attempts.")
        return False
    except Exception as e:
        print(f"Error starting MQTT client: {e}")
        return False