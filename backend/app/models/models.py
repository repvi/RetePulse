from ..extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role_id = db.Column(db.Integer, nullable=False)  # ← your level system: 1=admin, 2=viewer, etc.

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

class Device(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    model = db.Column(db.String(25), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    sensor_type = db.Column(db.String(20), nullable=False)
    last_updated = db.Column(db.String(15), nullable=False)

#    python
#>>> from app_instance import app
#>>> from extensions import db
#>>> from models import Device
#>>> with app.app_context():
#...     db.create_all()

#     Device.__table__.drop(db.engine)
