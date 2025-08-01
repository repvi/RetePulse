from .services.mqtt import send_message, device_unsubscribe, MQTTConfig
from flask import request, jsonify
from flask_cors import CORS
from sqlalchemy import select
from .app_instance import app, db, socketio
from .extensions import socketio_device_status_update
from .models import Device
from .config import REACT_APP_URL, IOT_WEB_URL
from .start import run_flask
from .services.ota import upload_file

import json
# Placeholder for sensor data (can be updated elsewhere

LOAD_DEVICES_ROUTE = '/load/devices'
DB_DELETE_ROUTE = '/db/delete'
DEVICE_CONTROL_ROUTE = '/device/control'

CORS(app, 
    resources={
        LOAD_DEVICES_ROUTE: {"origins": [REACT_APP_URL, IOT_WEB_URL]},
        DB_DELETE_ROUTE: {"origins": [REACT_APP_URL, IOT_WEB_URL]},
        DEVICE_CONTROL_ROUTE: {"origins": [REACT_APP_URL, IOT_WEB_URL]}
    }, 
    supports_credentials=True
)

@app.route(LOAD_DEVICES_ROUTE, methods=['POST', 'OPTIONS'])
def load_devices():
    """
    Load and return device list from database.
    Uses application context to ensure proper database access.
    """
    with app.app_context():
        try:
            if request.method == 'OPTIONS':
                return jsonify({"message": "CORS preflight response"}), 200            

            # Database operations
            devices = db.session.execute(select(Device)).scalars().all()
            # Build refresh list
            #         count = Device.query.filter_by(name=name).delete()
            #db.session.commit()
            #
            #db.session.execute(delete(Device))
            #db.session.commit()
            refresh_devices = [
                {
                    'name':         d.name,
                    'model':        d.model,
                    'status':       d.status,
                    'sensor_type':  d.sensor_type,
                    'last_updated': d.last_updated
                } 
                for d in devices
            ]
            
            for d in refresh_devices:
                print(f"Device: {d['name']}, Model: {d['model']}, Status: {d['status']}, Sensor Type: {d['sensor_type']}, Last Updated: {d['last_updated']}")

            return jsonify({"deviceArray": refresh_devices})

        except Exception as e:
            print(f"Database error: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route(DB_DELETE_ROUTE, methods=['POST', 'OPTIONS'])
def removeDeviceFromDb():
    with app.app_context():
        if request.method == 'OPTIONS':
            return jsonify({"message": "CORS preflight response"}), 200

        data = request.get_json() or {}

        name = data.get('name')
        existing_device = Device.query.filter_by(name=name).first()
        if existing_device:
            device_unsubscribe(name)
            db.session.delete(existing_device)
            db.session.commit()
            socketio.emit('device_delete_update', {
                'name' : name
            })
        
        return '', 204  # 204 means "No Content"

@app.route(DEVICE_CONTROL_ROUTE, methods=['POST', 'OPTIONS'])
def control_device():
    with app.app_context():
        if request.method == 'OPTIONS':
            return jsonify({"message": "CORS preflight response"}), 200

        data = request.get_json() or {}
        command = data.get('command')
        name = data.get('name')
        send_topic = f"{MQTTConfig.TOPIC_DEVICE_RECONFIGURE}/{name}"

        if command == "reconfigure":
            print(f"Sending reconfigure command to device: {name}")
            send_message(send_topic, json.dumps({"command": "reconfigure"}))
        elif command == "gpio":
            print(f"Sending data to device: {name}, command: {command}, data: {data}")
            send_message(send_topic, json.dumps({
                "command": "gpio", 
                "set": data.get('set'), 
                "pin": data.get('pin'), 
                "state": data.get('state')
            }))
        elif command == "ota_update":
            print(f"Sending OTA update command to device: {name}")
            # Assuming the OTA update command is sent to the same topic
            send_message(send_topic, json.dumps({"command": "ota_update"}))
        elif command == "reset":
            print(f"Sending reset command to device: {name}")
            send_message(send_topic, json.dumps({"command": "reset"}))
            existing_device = db.session.execute(select(Device).where(Device.name == name)).scalar_one_or_none()
            if existing_device:
                print(f"Resetting device {name} status in database")
                existing_device.status = "resetting"
                db.session.commit()
                socketio_device_status_update(name, "resetting")


        return '', 204  # 204 means "No Content"
#
#@app.route('/led/<state>')
#def led_control(state: str):
#    """
#    Control the LED on the device via MQTT.
#    Accepts 'on' or 'off' as state.
#    Sends MQTT message and returns status as JSON.
#    """
#    if state == 'on':
#        send_message(MQTT_TOPIC_LED, "on")
#    elif state == 'off':
#        send_message(MQTT_TOPIC_LED, "off")
#
#    return jsonify({"status": state})
