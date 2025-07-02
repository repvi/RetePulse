from .app import run_flask
from .app_instance import app
from .routes.auth import register, login, logout
from .routes.dashboard import dashboard
from .extensions import db, socketio
from .utils.auth_utils import login_required
from flask_socketio import SocketIO