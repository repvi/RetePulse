from flask import Blueprint, jsonify, session, request, redirect, url_for, render_template, flash, make_response
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_cors import CORS, cross_origin
from ..extensions import db
from app.models.models import User
from ..utils.auth_utils import login_required

auth_bp = Blueprint('auth', __name__)
CORS(auth_bp, resources={r"/login": {"origins": "http://localhost:3000"}}, supports_credentials=True)

def _cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response, 200

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        print("🔥 register() got called with OPTIONS method!")
        return _cors_preflight_response()
    
    print("🔥 register() got called with POST method!")
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    username = data.get('username')
    password = data.get('password')
    role_id = int(data.get('user_role'))

    existing_user = User.query.filter_by(username=username).first()
    if not existing_user:
        print("🔥 register() - Creating new user")
        print(f"🔥 register() - Username: {username}, password: {password}, Role ID: {role_id}")
        new_user = User(username=username, role_id=role_id)
        new_user.set_password(password)
        db.session.add(new_user)
    else:
        print("🔥 register() - User already exists, updating password")
        print(f"🔥 register() - Updating password for user: {username}")
        existing_user.set_password(password)
        existing_user.role_id = role_id  # Update role if needed

        db.session.commit()
        
    return '', 204  # 204 means "No Content"

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    print("🔥 login() got called!")        # simple print
    if request.method == 'OPTIONS':
        print("🔥 login() got called with OPTIONS method!")
        return _cors_preflight_response()
    
    print("🔥 login() got called with POST method!")
    
    data = request.get_json()  # Parse the JSON body
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    username = data.get('username')
    password = data.get('password')

    print(f"🔥 login() got called with username: {username} and password: {password}")

    user = User.query.filter_by(username=username).first()
    if user:
        print(f"🔍 Found user id={user.id}, verifying password…")
    else:
        print("❌ No such user found")

    if user and user.check_password(password):
        print("✅ login() successful, issuing token")
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    
    print("🚫 login() failed: bad credentials")
    return jsonify({"msg": "Bad username or password"}), 403
        
@auth_bp.route('/logout')
def logout():
    session.pop('user_id', None)  # Remove user from session if logged in
    return redirect(url_for('home'))  # Send them back to login page