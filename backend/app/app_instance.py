from .config import API_KEY, DATABASE_URI, DATABASE_KEY_CONFIG, REACT_APP_URL, JWT_SECRET_KEY
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .extensions import db, socketio
from .routes import auth_bp, dashboard_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": REACT_APP_URL}}, supports_credentials=True)
app.secret_key = API_KEY

app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
jwt = JWTManager(app)

app.config[DATABASE_KEY_CONFIG] = DATABASE_URI

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

db.init_app(app)

socketio.init_app(app, cors_allowed_origins="*")  # Allow all origins for dev, change in the future

with app.app_context():
    db.create_all()