from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

db = SQLAlchemy()  # Initialize SQLAlchemy without an app context
socketio = SocketIO()

def socketio_device_status_update(name: str, status: str) -> None:
    """
    Emit a device status update event to all connected SocketIO clients.
    """
    socketio.emit('device_status_update', {
        'name': name,
        'status': status
    })
