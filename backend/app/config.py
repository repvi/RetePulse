from .app_instance import app
from multiprocessing import Process
import platform

current_os = platform.system()
# Configuration constants
CONFIG_DEBUG = True

def run_flask(host, port, debug) -> None:
    """
    Start the Flask application.
    - On Windows: runs Flask directly.
    - On Linux: runs Flask directly if debug, otherwise starts in a separate process.
    Returns True if started successfully, False otherwise.
    """
    """
    if not start_mqtt_client():
        print("Failed to start MQTT client.")
        return False
    else:
        print(f"MQTT broker IP address: {MQTT_BROKER}")
        print("Flask server starting")
    """
    
    global current_os
    if current_os == "Windows":
        app.run(host=host, port=port, debug=debug)
    elif current_os == "Linux":
        if CONFIG_DEBUG is True:
            app.run(host=host, port=port, debug=debug)
        else:
            frontend_process = Process(target=run_flask, args=(host, port, debug))
            frontend_process.start()
    else:
        print(f"Unsupported OS: {current_os}. Flask server not started.")
        return False