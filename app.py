from flask import request, render_template, redirect, url_for, flash
from app_instance import app
from app_config import run_flask, send_message_to_esp, MQTT_TOPIC_LED, MQTT_TOPIC_OTA
from app_users import register, login, logout # needs to be included
from werkzeug.utils import secure_filename
from auth_utils import login_required

app.config['UPLOAD_FOLDER'] = '/var/fm_project/firmware'  # Where the file will be saved
ALLOWED_EXTENSIONS = {'bin'}
sensor_data = ""

@app.route('/')
def home():
    return redirect(url_for('register'))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', sensor_data=sensor_data)

@app.route('/led/<state>')
@login_required
def led_control(state):
    if state == 'on':
        send_message_to_esp(MQTT_TOPIC_LED, "on")
    elif state == 'off':
        send_message_to_esp(MQTT_TOPIC_LED, "off")
    # return jsonify(success=True)

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload_file():
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
            send_message_to_esp(MQTT_TOPIC_OTA, "update")
            flash('File successfully uploaded and OTA update initiated')
            return redirect(url_for('dashboard'))
    return render_template('upload.html')

if __name__ == '__main__':
    run_flask(host='0.0.0.0', port=5000, debug=True)