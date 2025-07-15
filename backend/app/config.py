from .app_instance import app, db, socketio
from multiprocessing import Process
import platform
from .services.mqtt_service import start_mqtt_client, MQTT_BROKER
from sqlalchemy import select, func, delete
from .models.models import Device
current_os = platform.system()
# Configuration constants
CONFIG_DEBUG = True

def set_up_db() -> bool:
    with app.app_context():
        try:
            devices = db.session.execute(select(Device)).scalars().all()
            for device in devices:
                device.status = 'dissconnected'  # Set status to disconnected
            db.session.commit()  # Commit changes to the database
            return True
        except Exception as e:
            print(f"Database error: {str(e)}")
            return False
        

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
        if set_up_db():
            socketio.run(app, host=host, port=port, debug=debug, use_reloader=False)
        else:
            print("There was an error setting up the database init")
        return True
    else:
        print("Failed to start MQTT client.")
        return False