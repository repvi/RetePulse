from app_instance import app
import paho.mqtt.client as mqtt
from multiprocessing import Process
import platform
import queue

CONFIG_DEBUG = True

MQTT_BROKER = "test.mosquitto.org" # for windows
# MQTT_BROKER = "localhost" # for linux
MQTT_TOPIC_LED = "home/led"
MQTT_TOPIC_OTA = "home/ota"
MQTT_TOPIC_SENSOR = "home/sensor"

message_queue = queue.Queue()

def on_connect(client, userdata, flags, rc) -> None:
    print("Connected with result code " + str(rc))
    client.subscribe(MQTT_TOPIC_SENSOR)

def on_message(client, userdata, msg) -> None:
    message_queue.put(msg)
    #global sensor_data
    #payload_sisze = len(msg.payload)
    #sensor_data = msg.payload.decode()
    #print(f"Received message: {sensor_data}")

mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION1)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, 1883, 60)
mqtt_client.loop_start()

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