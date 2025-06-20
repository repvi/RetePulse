from flask import Flask
from extensions import db

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Needed for flash messages

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # or use PostgreSQL/MySQL URI

db.init_app(app)