from flask import request, render_template, redirect, url_for, flash, jsonify
from flask_cors import CORS, cross_origin
from sqlalchemy import select, func
from .app_instance import app
from .extensions import db
from .models.models import Device
from .config import run_flask
from .services.mqtt_service import send_message, MQTT_TOPIC_LED
from .services.ota import MQTT_TOPIC_OTA

# Placeholder for sensor data (can be updated elsewhere

CORS(app, resources={r"/load/devices": {"origins": "http://localhost:3000"}}, supports_credentials=True)

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
            # Get JSON data from request within context
            data = request.get_json()
            device_list = data.get('devices', [])

            # Database operations
            stmt = select(func.count()).select_from(Device)
            device_count = db.session.execute(stmt).scalar()
            devices = db.session.execute(select(Device)).scalars().all()

            # Compare counts
            #if len(device_list) == device_count:
            #    print(f"🔥 load_devices() - Device count matches: {len(device_list)}")
            #    return jsonify({"deviceArray": None})
            
            devices.append(Device(name="New Device", model="Model X", status="active", sensor_type="uart", last_updated="2023-10-01T12:00:00Z"))
            devices.append(Device(name="Another Device", model="Model Y", status="inactive", sensor_type="i2c", last_updated="2023-10-02T12:00:00Z"))
            # Build refresh list
            refresh_devices = [{
                'name': device.name,
                'model': device.model,
                'status': device.status,
                'sensor_type': device.sensor_type,
                'last_updated': device.last_updated
            } for device in devices]

            for d in refresh_devices:
                print(f"Device: {d['name']}, Model: {d['model']}, Status: {d['status']}, Sensor Type: {d['sensor_type']}, Last Updated: {d['last_updated']}")

            return jsonify({"deviceArray": refresh_devices})

        except Exception as e:
            print(f"Database error: {str(e)}")
            return jsonify({"error": str(e)}), 500

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
