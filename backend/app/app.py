from flask import request, render_template, redirect, url_for, flash, jsonify
from flask_cors import CORS, cross_origin
from sqlalchemy import select, func, delete
from .app_instance import app, db, socketio
from .models.models import Device
from .config import run_flask
from .services.mqtt_service import send_message, MQTT_TOPIC_LED
from .services.ota import MQTT_TOPIC_OTA

# Placeholder for sensor data (can be updated elsewhere

CORS(app, 
    resources={
        r"/load/devices": {"origins": "http://localhost:3000"},
        r"/db/delete": {"origins": "http://localhost:3000"}
    }, 
    supports_credentials=True
)

@app.route('/load/devices', methods=['POST', 'OPTIONS'])
def load_devices():
    """
    Load and return device list from database.
    Uses application context to ensure proper database access.
    """
    with app.app_context():
        try:
            if request.method == 'OPTIONS':
                print("🔥 load_devices() got called with OPTIONS method!")
                return jsonify({"message": "CORS preflight response"}), 200
            
            print("🔥 load_devices() got called with POST method!")

            # Database operations
            devices = db.session.execute(select(Device)).scalars().all()
            # Build refresh list
            refresh_devices = []
            #         count = Device.query.filter_by(name=name).delete()
            #db.session.commit()
            #
            #db.session.execute(delete(Device))
            #db.session.commit()
            num = 1
            for device in devices:
                device.status = 'dissconnected'  # Set status to disconnected
                entry = {
                    'name': device.name,
                    'model': device.model,
                    'status': device.status,
                    'sensor_type': device.sensor_type,
                    'last_updated': device.last_updated
                }
                refresh_devices.append(entry)

            db.session.commit()  # Commit changes to the database

            for d in refresh_devices:
                print(f"Device: {d['name']}, Model: {d['model']}, Status: {d['status']}, Sensor Type: {d['sensor_type']}, Last Updated: {d['last_updated']}")

            return jsonify({"deviceArray": refresh_devices})

        except Exception as e:
            print(f"Database error: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route('/db/delete', methods=['POST', 'OPTIONS'])
def removeDeviceFromDb():
    with app.app_context():
        if request.method == 'OPTIONS':
            print("🔥 load_devices() got called with OPTIONS method!")
            return jsonify({"message": "CORS preflight response"}), 200

        print("🔥 load_devices() got called with POST method!")
        data = request.get_json() or {}

        name = data.get('name')
        existing_device = Device.query.filter_by(name=name).first()
        if existing_device:
            db.session.delete(existing_device)
            db.session.commit()
            socketio.emit('device_delete_update', {
                'name' : name
            })
        
        return '', 204  # 204 means "No Content"

@app.route('/led/<state>')
def led_control(state: str):
    """
    Control the LED on the device via MQTT.
    Accepts 'on' or 'off' as state.
    Sends MQTT message and returns status as JSON.
    """
    if state == 'on':
        send_message(MQTT_TOPIC_LED, "on")
    elif state == 'off':
        send_message(MQTT_TOPIC_LED, "off")

    return jsonify({"status": state})
