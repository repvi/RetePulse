from app.utils.auth_utils import login_required
from flask import Blueprint, render_template

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard')
@login_required
def dashboard():
    """
    Render the dashboard page.
    Requires user to be logged in.
    Passes sensor_data to the template.
    """
    return render_template('dashboard.html')