from flask import Blueprint, session, request, redirect, url_for, render_template, flash
from ..extensions import db
from app.models.models import User
from ..utils.auth_utils import login_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def home():
    """Redirect root URL to login page."""
    return redirect(url_for('auth.login'))

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        role_id = int(request.form['user_role'])

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already taken.')
            return redirect(url_for('register'))

        new_user = User(username=username, role_id=role_id)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        flash('Registration successful! Please log in.')
        return redirect(url_for('auth.login'))

    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            session['user_id'] = user.id
            session['role_id'] = user.role_id
            # do not get the session password, not needed
            flash('Welcome back!')
            return redirect(url_for('dashboard'))  # Redirect to next page, successful login
        else:
            flash('Invalid username or password.')
            return redirect(url_for('home'))  # Do nothing, stay the same

    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    session.pop('user_id', None)  # Remove user from session if logged in
    flash('You\'ve been logged out.')
    return redirect(url_for('home'))  # Send them back to login page