from .services.mqtt.mqtt_service import send_message, device_unsubscribe
from flask import request, jsonify
from flask_cors import CORS
from sqlalchemy import select
from .app_instance import app, db, socketio
from .models.models import Device
from .start import run_flask

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

@app.route('/db/delete', methods=['POST', 'OPTIONS'])
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
