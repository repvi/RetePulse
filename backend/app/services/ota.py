from flask import Blueprint, request, render_template, redirect, url_for, flash
from werkzeug.utils import secure_filename
from ..app_instance import app
from ..utils.auth_utils import login_required
from .mqtt_service import send_message, MQTT_TOPIC_OTA

# Configuration for firmware uploads
app.config['UPLOAD_FOLDER'] = '/var/fm_project/firmware'  # Where the file will be saved
ALLOWED_EXTENSIONS = {'bin'}

def allowed_file(filename: str) -> bool:
    """
    Check if the uploaded file has an allowed extension.
    Only .bin files are accepted for firmware updates.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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