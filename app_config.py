from app_instance import app
import paho.mqtt.client as mqtt
from multiprocessing import Process
import platform
import queue
import json
import threading
from flask_socketio import SocketIO, emit

socketio = SocketIO(app, cors_allowed_origins="*")  # Allow all origins for dev

fallback = lambda *args: "Invalid"

CONFIG_DEBUG = True

MQTT_BROKER = "test.mosquitto.org" # for windows
# MQTT_BROKER = "localhost" # for linux
MQTT_TOPIC_LED = "led"
MQTT_TOPIC_OTA = "ota"
MQTT_TOPIC_SENSOR = "sensor"
MQTT_TOPIC_CONNECT = "connect"

message_queue = queue.Queue()

def device_connection_info(data) -> None:
    device_name = data['device_name']
    model = data['device_model']
    last_updated = data['last_updated']
    status = 'connected'
    
    socketio.emit('device_update', {
        'device_name' : device_name,
        'device_model' : model,
        'last_updated' : last_updated,
        'status' : status
    })

process_operations = {
    MQTT_TOPIC_CONNECT : device_connection_info
}


def process_messages() -> None:
    try:
        global message_queue
        while True:
            message = message_queue.get()
            data = json.loads(message.decode('utf-8'))
            result = process_operations.get(data['protocol'], fallback)(data) 
            print(result)
    except Exception as e:
        print(f"JSON parse error: {e}")

def on_connect(client, userdata, flags, rc) -> None:
    print("Connected with result code " + str(rc))
    client.subscribe(MQTT_TOPIC_SENSOR)

def on_message(client, userdata, msg) -> None:
    global message_queue
    message_queue.put(msg.payload)
    #global sensor_data
    #payload_sisze = len(msg.payload)
    #sensor_data = msg.payload.decode()
    #print(f"Received message: {sensor_data}")

mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION1)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, 1883, 60)
mqtt_client.loop_start()

processing_thread = threading.Thread(target=process_messages, daemon=True)
processing_thread.start()

def send_message(literal, message: str) -> None:
    mqtt_client.publish(literal, message)

def run_flask(host, port, debug) -> bool:
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