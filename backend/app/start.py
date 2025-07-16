from .app_instance import app, db, socketio
from .services.mqtt import set_device_subscriptions, start_mqtt_client, MQTTConfig
from sqlalchemy import select
from .models import Device

def _set_up_db() -> bool:
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
        
def _init_subscriptions() -> None:
    """
    Initialize MQTT subscriptions for devices.
    This function should be called after the MQTT client is started.
    """
    with app.app_context():
        devices = db.session.execute(select(Device)).scalars().all()
        for device in devices:
            set_device_subscriptions(device.name)

def run_flask(host, port, debug) -> bool:
    """
    Start the Flask application.
    - On Windows: runs Flask directly.
    - On Linux: runs Flask directly if debug, otherwise starts in a separate process.
    Returns True if started successfully, False otherwise.
    """

    if start_mqtt_client():
        print(f"MQTT broker IP address: {MQTTConfig.BROKER}")
        print("Flask server starting")    
        if _set_up_db():
            _init_subscriptions()
            socketio.run(app, host=host, port=port, debug=debug, use_reloader=False)
            return True
        else:
            print("There was an error setting up the database init")
    else:
        print("Failed to start MQTT client.")
    
    return False