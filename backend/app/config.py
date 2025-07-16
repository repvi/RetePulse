from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("secret-key")

DATABASE_URI = os.getenv("database-url")
if DATABASE_URI == "sqlite:///users.db":
    DATABASE_KEY_CONFIG = "SQLALCHEMY_DATABASE_URI"
elif DATABASE_URI.startswith("postgresql://") or DATABASE_URI.startswith("mysql://"):
    DATABASE_KEY_CONFIG = "SQLALCHEMY_DATABASE_URI"
else:
    raise ValueError("Unsupported database URI format. Please use SQLite, PostgreSQL, or MySQL.")

JWT_SECRET_KEY = os.getenv("jwt-secret-key", "uvenv_load_ap3x")

REACT_APP_URL = os.getenv("react-app-url", "http://localhost:3000")

SOCKETIO_URL = os.getenv("socketio-url")