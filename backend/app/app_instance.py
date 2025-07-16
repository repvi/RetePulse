from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .extensions import db, socketio
from .routes import auth_bp, dashboard_bp
#from .config import config

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.secret_key = 'supersecretkey'  # Needed for flash messages

app.config['JWT_SECRET_KEY'] = 'asminview_venv_ap3x'
jwt = JWTManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # or use PostgreSQL/MySQL URI

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

db.init_app(app)

socketio.init_app(app, cors_allowed_origins="*")  # Allow all origins for dev

with app.app_context():
    db.create_all()