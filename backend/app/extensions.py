from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

db = SQLAlchemy()  # Initialize SQLAlchemy without an app context
socketio = SocketIO(cors_allowed_origins="*")  # Initialize SocketIO with C