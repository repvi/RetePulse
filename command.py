from backend.app_instance import app
from backend.extensions import db

with app.app_context():
    db.drop_all()
    db.create_all()


from backend.app_instance import app
from backend.extensions import db
from backend.models import User, Device

with app.app_context():
    db.create_all()
