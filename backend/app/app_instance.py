from flask import Flask
from .extensions import db, socketio, SocketIO
from .routes import auth_bp, dashboard_bp

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Needed for flash messages

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # or use PostgreSQL/MySQL URI

app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)

db.init_app(app)

socketio.init_app(app, cors_allowed_origins="*")  # Allow all origins for dev