from ...app_instance import app, db, socketio
from ...models.models import Device
import paho.mqtt.client as mqtt
from sqlalchemy import select
import threading
from typing import Optional
import platform
import queue
import json
import os

current_os = platform.system()

# Configuration loader (moved here to avoid circular imports)
def load_mqtt_config():
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

# Load configuration
mqtt_config = load_mqtt_config()

# Fallback function for unrecognized MQTT topics
fallback = lambda *args: "Invalid"

# Load MQTT broker configuration with fallbacks
def get_mqtt_broker():
    """Get MQTT broker based on config file or fallback to platform defaults"""
    broker_url = get_config_value(mqtt_config, 'mqtt-broker')
    if broker_url:
        # Extract just the hostname from mqtt://hostname:port format
        if broker_url.startswith('mqtt://'):
            return broker_url.replace('mqtt://', '').split(':')[0]
        return broker_url
    
    # Fallback to platform-specific defaults
    return "test.mosquitto.org" if current_os == "Windows" else "localhost"

# Configuration-based constants
MQTT_BROKER = get_mqtt_broker()
MQTT_PORT = get_config_value(mqtt_config, 'mqtt-broker-port', 1883)
MQTT_TOPIC_LED = get_config_value(mqtt_config, 'topic.led', 'led')
MQTT_TOPIC_OTA = get_config_value(mqtt_config, 'topic.ota', 'ota') 
MQTT_TOPIC_SENSOR = get_config_value(mqtt_config, 'topic.sensor', 'sensor')
MQTT_TOPIC_SET_DEVICE = get_config_value(mqtt_config, 'topic.device-info', 'device_info')
MQTT_TOPIC_DEVICE_RECONFIGURE = get_config_value(mqtt_config, 'topic.device-reconfigure', 'device_reconfigure')
MQTT_TOPIC_STATUS = get_config_value(mqtt_config, 'topic.status', 'status')

# Thread-safe queue for incoming MQTT messages
message_queue = queue.Queue()
mqtt_client: Optional[mqtt.Client] = None

class MQTTMessage:
    """Represents an MQTT message with topic and payload."""
    def __init__(self, client: str, topic: str, payload: str):
        self.client = client
        self.topic = topic
        self.payload = payload

def get_device_from_db(name: str) -> Optional[Device]:
    """
    Retrieve a device from the database by its name.
    """
    with app.app_context():
        stmt = select(Device).where(Device.name == name)
        return db.session.execute(stmt).scalar_one_or_none()

def set_device_subscriptions(name) -> None:
    """
    Subscribe to a device's status topic.
    """
    subToTopic = MQTT_TOPIC_STATUS + f"/{name}"
    mqtt_client.subscribe(subToTopic)
    print(f"Subscribed to topic: {subToTopic}")
    process_operations[subToTopic] = device_set_status

def device_unsubscribe(name) -> None:
    """
    Unsubscribe from a device's status topic.
    """
    subToTopic = MQTT_TOPIC_STATUS + f"/{name}"
    mqtt_client.unsubscribe(subToTopic)
    print(f"Unsubscribed from topic: {subToTopic}")
    if subToTopic in process_operations:
        del process_operations[subToTopic]  # Remove the handler for this topic

def device_connection_info(data) -> None:
    """
    Emit device connection info to all connected SocketIO clients.
    Used when a device connects and sends its info.
    """
    with app.app_context():
        try:
            parsed = json.loads(data.payload)
            device_name = parsed['device_name']
            device_model = parsed['device_model']
            status = 'connected'
            sensor_type = parsed['sensor_type']
            last_updated = parsed['last_updated']

            existing_device = get_device_from_db(device_name)

            if existing_device:
                existing_device.name = device_name
                existing_device.model = device_model
                existing_device.status = status
                existing_device.sensor_type = sensor_type
                existing_device.last_updated = last_updated
                print(f"Updating existing device: {device_name}")
            else:
                print(f"Adding new device: {device_name}")
                new_device = Device(
                    name=device_name,
                    model=device_model,
                    status=status,
                    sensor_type=sensor_type,
                    last_updated=last_updated
                )
                print(f"New device: {new_device}")
                db.session.add(new_device)

            db.session.commit()
            set_device_subscriptions(device_name)
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

def device_set_status(data) -> None:
    """
    Placeholder function for setting device status.
    """
    with app.app_context():
        try: 
            print(f"Received device status update: {data.payload}")
            name = data.topic.split("/")[-1] # Extracts 'client42'
            parsed = json.loads(data.payload)
            status = parsed['status']
            existing_device = db.session.execute(select(Device).where(Device.name == name)).scalar_one_or_none()
            if existing_device and existing_device.status is not status:
                existing_device.status = status
                db.session.commit()
                print(f"Updated device {name} status to {status}")
            else:
                print(f"Device {name} not found in database, cannot update status.")
            socketio.emit('device_status_update', {
                'name': name,
                'status': status
            })
        except Exception as e:
            print(f"Database error in device_set_status: {str(e)}")
            db.session.rollback()

def device_sensor_data(data) -> None:
    pass

# Map MQTT topics to processing functions
process_operations = {
    MQTT_TOPIC_SET_DEVICE : device_connection_info #default
}

def process_messages() -> None:
    """
    Background thread function to process messages from the MQTT queue.
    Decodes JSON payloads and dispatches to the appropriate handler.
    """
    try:
        global message_queue
        while True:
            data = message_queue.get()

            if data.topic in process_operations:
                """ Already registered topic """
                process_operations[data.topic](data)
                print(f"Processing message for topic: {data.topic}")
            else:
                print(f"No processing function found for topic: {data.topic}")
                # request as if it is a completely new device
                send_message(MQTT_TOPIC_DEVICE_RECONFIGURE, "reset")

    except Exception as e:
        print(f"JSON parse error: {e}")

def on_connect(client, userdata, flags, rc) -> None:
    """MQTT callback for successful connection."""
    client_id = client._client_id.decode()
    print(f"Device {client_id} connected with result code {rc}")
    #client.subscribe(MQTT_TOPIC_SENSOR + f"/{client_id}")
    client.subscribe(MQTT_TOPIC_SET_DEVICE)

def on_message(client, userdata, msg) -> None:
    """
    MQTT callback for incoming messages.
    Puts the message into the processing queue
    """
    global message_queue
    message_data = MQTTMessage(
        client=client,
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
            print(f"Attempting to connect to MQTT broker {MQTT_BROKER}:{MQTT_PORT} (Attempt {attempt + 1}/{retry_count})")
            status = mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
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

def reload_config():
    """
    Reload configuration from file.
    Useful for runtime configuration updates.
    """
    global mqtt_config, MQTT_BROKER, MQTT_PORT
    global MQTT_TOPIC_LED, MQTT_TOPIC_OTA, MQTT_TOPIC_SENSOR
    global MQTT_TOPIC_SET_DEVICE, MQTT_TOPIC_DEVICE_RECONFIGURE, MQTT_TOPIC_STATUS
    
    mqtt_config = load_mqtt_config()
    
    # Reload all configuration-based constants
    MQTT_BROKER = get_mqtt_broker()
    MQTT_PORT = get_config_value(mqtt_config, 'mqtt-broker-port', 1883)
    MQTT_TOPIC_LED = get_config_value(mqtt_config, 'topic.led', 'led')
    MQTT_TOPIC_OTA = get_config_value(mqtt_config, 'topic.ota', 'ota') 
    MQTT_TOPIC_SENSOR = get_config_value(mqtt_config, 'topic.sensor', 'sensor')
    MQTT_TOPIC_SET_DEVICE = get_config_value(mqtt_config, 'topic.device-info', 'device_info')
    MQTT_TOPIC_DEVICE_RECONFIGURE = get_config_value(mqtt_config, 'topic.device-reconfigure', 'device_reconfigure')
    MQTT_TOPIC_STATUS = get_config_value(mqtt_config, 'topic.status', 'status')
    
    return mqtt_config