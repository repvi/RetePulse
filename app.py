"""
app.py
------
Main Flask application for the MicroUSC-Sentinel dashboard.

Features:
- User authentication (login required for dashboard and device actions)
- Dashboard rendering
- LED control via MQTT
- Firmware upload and OTA update via MQTT
"""

from flask import request, render_template, redirect, url_for, flash, jsonify
from app_instance import app
from app_config import run_flask, send_message, MQTT_TOPIC_LED, MQTT_TOPIC_OTA
from app_users import register, login, logout # needs to be included
from werkzeug.utils import secure_filename
from auth_utils import login_required

# Configuration for firmware uploads
app.config['UPLOAD_FOLDER'] = '/var/fm_project/firmware'  # Where the file will be saved
ALLOWED_EXTENSIONS = {'bin'}

# Placeholder for sensor data (can be updated elsewhere)
sensor_data = ""

@app.route('/')
def home():
    """Redirect root URL to login page."""
    return redirect(url_for('login'))

def allowed_file(filename: str) -> bool:
    """
    Check if the uploaded file has an allowed extension.
    Only .bin files are accepted for firmware updates.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/dashboard')
@login_required
def dashboard():
    """
    Render the dashboard page.
    Requires user to be logged in.
    Passes sensor_data to the template.
    """
    return render_template('dashboard.html', sensor_data=sensor_data)

@app.route('/led/<state>')
@login_required
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

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload_file():
    """
    Handle firmware file uploads.
    - GET: Render upload form.
    - POST: Save uploaded .bin file, trigger OTA update via MQTT, and redirect to dashboard.
    """
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            send_message(MQTT_TOPIC_OTA, "update")
            flash('File successfully uploaded and OTA update initiated')
            return redirect(url_for('dashboard'))
    return render_template('upload.html')

if __name__ == '__main__':
    # Start the Flask app using custom run_flask function
    run_flask(host='0.0.0.0', port=5000, debug=True)