from .app import run_flask
from .app_instance import app
from .extensions import db, socketio
from .utils.auth_utils import login_required
from flask_socketio import SocketIO