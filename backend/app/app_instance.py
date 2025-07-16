from .config import API_KEY, DATABASE_URI, DATABASE_KEY_CONFIG
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .extensions import db, socketio
from .routes import auth_bp, dashboard_bp
#from .config import config

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.secret_key = API_KEY

app.config['JWT_SECRET_KEY'] = 'asminview_venv_ap3x'
jwt = JWTManager(app)

app.config[DATABASE_KEY_CONFIG] = DATABASE_URI

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

db.init_app(app)

socketio.init_app(app, cors_allowed_origins="*")  # Allow all origins for dev

with app.app_context():
    db.create_all()