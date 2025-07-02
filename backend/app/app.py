from flask import request, render_template, redirect, url_for, flash, jsonify
from sqlalchemy import select, func
from .app_instance import app
from .extensions import db
from .models.models import Device
from .config import run_flask
from .services.mqtt_service import send_message, MQTT_TOPIC_LED
from .services.ota import MQTT_TOPIC_OTA
from .utils.auth_utils import login_required

# Placeholder for sensor data (can be updated elsewhere

@app.route('/load/devices', methods=['POST'])
def load_devices():
    """
    Load and return device list from database.
    Uses application context to ensure proper database access.
    """
    with app.app_context():
        try:
            # Get JSON data from request within context
            data = request.get_json()
            device_list = data.get('devices', [])

            # Database operations
            stmt = select(func.count()).select_from(Device)
            device_count = db.session.execute(stmt).scalar()
            devices = db.session.execute(select(Device)).scalars().all()

            # Compare counts
            if len(device_list) == device_count:
                return jsonify({"deviceList": None})

            # Build refresh list
            refresh_devices = [{
                'name': device.name,
                'model': device.model,
                'status': device.status,
                'sensor_type': device.sensor_type,
                'last_updated': device.last_updated
            } for device in devices]

            return jsonify({"deviceList": refresh_devices})

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
