"""
Main Flask application for Charlex-MP.
Handles routing, blueprints, and database initialization.
"""

from flask import Flask, render_template, request, jsonify
from flask_login import LoginManager
from ui_components import window_manager_bp
from webdisk import webdisk_bp
from models import db
from shell import shell

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = '126d7df4-e660-45e1-ad94-bd616cd5b719z'  # TODO: Use environment variable for security
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///webdisk.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database and login manager
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'webdisk.webdisk'

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login."""
    from models import User
    return User.query.get(int(user_id))

# Register blueprints
app.register_blueprint(window_manager_bp)
app.register_blueprint(webdisk_bp)

@app.route('/')
def index():
    """Render the main index page."""
    return render_template('index.html')

@app.route('/shell/execute', methods=['POST'])
def shell_execute():
    """Execute a shell command and return output."""
    data = request.get_json()
    command = data.get('command', '').strip()
    if not command:
        return jsonify({'output': 'No command provided'}), 400
    output = shell.execute_command(command)
    return jsonify({'output': output})

@app.route('/shell/history', methods=['GET'])
def shell_history():
    """Retrieve shell command history."""
    history = shell.get_history()
    return jsonify({'history': history})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
