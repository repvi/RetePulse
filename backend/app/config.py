from .app_instance import app, socketio
from multiprocessing import Process
import platform
from .services.mqtt_service import start_mqtt_client, MQTT_BROKER

current_os = platform.system()
# Configuration constants
CONFIG_DEBUG = True

def run_flask(host, port, debug) -> bool:
    """
    Start the Flask application.
    - On Windows: runs Flask directly.
    - On Linux: runs Flask directly if debug, otherwise starts in a separate process.
    Returns True if started successfully, False otherwise.
    """

    if start_mqtt_client():
        print(f"MQTT broker IP address: {MQTT_BROKER}")
        print("Flask server starting")
        socketio.run(app, host=host, port=port, debug=debug, use_reloader=False)
        return True
    else:
        print("Failed to start MQTT client.")
        return False