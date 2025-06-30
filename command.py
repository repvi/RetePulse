from app_instance import app
from extensions import db

with app.app_context():
    db.drop_all()
    db.create_all()


from app_instance import app
from extensions import db
from models import User, Device

with app.app_context():
    db.create_all()
