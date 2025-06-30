from flask import Flask
from extensions import db, socketio

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Needed for flash messages

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # or use PostgreSQL/MySQL URI

db.init_app(app)

socketio.init_app(app, cors_allowed_origins="*")  # Allow all origins for dev
