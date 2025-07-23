from . import UPLOAD_FOLDER, ALLOWED_EXTENSIONS, is_file_allowed, get_firmware_path, validate_ota_config
from flask import Blueprint, request, render_template, redirect, url_for, flash
from werkzeug.utils import secure_filename
from flask import current_app
from flask_cors import CORS
from ...utils.auth_utils import login_required
 # Import inside function to avoid circular import

import os
from app.config import REACT_APP_URL, IOT_WEB_URL
import json

# Configure Flask app with OTA settings

ota_bp = Blueprint('ota', __name__)
CORS(ota_bp, resources={r"/upload": {"origins": [REACT_APP_URL, IOT_WEB_URL]}}, supports_credentials=True)

def allowed_file(filename: str) -> bool:
    """
    Check if the uploaded file has an allowed extension.
    Uses configuration from ota_config.json
    """
    return is_file_allowed(filename)

@ota_bp.route('/upload', methods=['GET', 'POST'])
def upload_file():
    print("UPLOAD_FILE ROUTE TRIGGERED")
    """
    Handle firmware file uploads.
    - GET: Render upload form.
    - POST: Save uploaded .bin file, trigger OTA update via MQTT, and redirect to dashboard.
    """
    if request.method == 'POST':
        # If AJAX request, return JSON instead of redirect
        is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.is_json
        def json_response(success, message):
            return (json.dumps({'success': success, 'message': message}), 200 if success else 400, {'Content-Type': 'application/json'})

        config_validation = validate_ota_config()
        if not config_validation['valid']:
            msg = '; '.join(config_validation['errors'])
            if is_ajax:
                return json_response(False, f'Configuration error: {msg}')
            for error in config_validation['errors']:
                flash(f'Configuration error: {error}', 'error')
            return redirect(request.url)

        model_string = request.form.get('model_string', '').strip()
        if model_string:
            with open('model_string.txt', 'w') as f:
                f.write(model_string)
            from ..mqtt import send_message, MQTT_TOPIC_OTA
            send_message(MQTT_TOPIC_OTA, json.dumps({"command": "set_model", "model": model_string}))

        if 'file' not in request.files:
            msg = 'No file part'
            if is_ajax:
                return json_response(False, msg)
            print(msg)
            return redirect(request.url)

        file = request.files['file']
        if file.filename == '':
            msg = 'No selected file'
            if is_ajax:
                return json_response(False, msg)
            print(msg)
            return redirect(request.url)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = get_firmware_path(filename)
            print(f"Resolved firmware upload path: {filepath}")
            try:
                print(f"Attempting to save file to: {filepath}")
                file.save(filepath)
                print(f"File save complete. Exists? {os.path.exists(filepath)}")
                from ..mqtt import send_message, MQTT_TOPIC_OTA
                send_message(MQTT_TOPIC_OTA, json.dumps({"command": "ota_update"}))
                print('File successfully uploaded and OTA update initiated')
                if is_ajax:
                    return json_response(True, 'File uploaded and OTA update initiated')
                return redirect(url_for('dashboard.dashboard'))
            except Exception as e:
                msg = f'Error saving file: {str(e)}'
                if is_ajax:
                    return json_response(False, msg)
                print(msg, 'error')
                return redirect(request.url)
        else:
            allowed_exts = ', '.join(ALLOWED_EXTENSIONS)
            msg = f'Invalid file type. Allowed extensions: {allowed_exts}'
            if is_ajax:
                return json_response(False, msg)
            print(msg)
            return redirect(request.url)

    return render_template('upload.html')