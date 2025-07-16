from . import UPLOAD_FOLDER, ALLOWED_EXTENSIONS, is_file_allowed, get_firmware_path, validate_ota_config
from flask import Blueprint, request, render_template, redirect, url_for, flash
from werkzeug.utils import secure_filename
from ...app_instance import app
from ...utils.auth_utils import login_required
from ..mqtt import send_message, MQTT_TOPIC_OTA
import os

# Configure Flask app with OTA settings
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename: str) -> bool:
    """
    Check if the uploaded file has an allowed extension.
    Uses configuration from ota_config.json
    """
    return is_file_allowed(filename)

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload_file():
    """
    Handle firmware file uploads.
    - GET: Render upload form.
    - POST: Save uploaded .bin file, trigger OTA update via MQTT, and redirect to dashboard.
    """
    if request.method == 'POST':
        # Validate OTA configuration first
        config_validation = validate_ota_config()
        if not config_validation['valid']:
            for error in config_validation['errors']:
                flash(f'Configuration error: {error}', 'error')
            return redirect(request.url)
        
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = get_firmware_path(filename)
            
            try:
                file.save(filepath)
                send_message(MQTT_TOPIC_OTA, "update")
                flash('File successfully uploaded and OTA update initiated')
                return redirect(url_for('dashboard.dashboard'))
            except Exception as e:
                flash(f'Error saving file: {str(e)}', 'error')
                return redirect(request.url)
        else:
            allowed_exts = ', '.join(ALLOWED_EXTENSIONS)
            flash(f'Invalid file type. Allowed extensions: {allowed_exts}')
            return redirect(request.url)
    
    return render_template('upload.html')