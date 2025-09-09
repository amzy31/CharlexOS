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
import subprocess
import socket
import platform

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

@app.route('/network/ping', methods=['POST'])
def network_ping():
    """Ping an IP address and return output."""
    data = request.get_json()
    ip = data.get('ip', '').strip()
    if not ip:
        return jsonify({'output': 'No IP address provided'}), 400
    try:
        # Use ping command, cross-platform
        if platform.system() == 'Windows':
            result = subprocess.run(['ping', '-n', '4', ip], capture_output=True, text=True, timeout=10)
        else:
            result = subprocess.run(['ping', '-c', '4', ip], capture_output=True, text=True, timeout=10)
        output = result.stdout
        if result.stderr:
            output += f"\nError: {result.stderr}"
        return jsonify({'output': output.strip()})
    except subprocess.TimeoutExpired:
        return jsonify({'output': 'Ping timed out'})
    except Exception as e:
        return jsonify({'output': f'Error: {str(e)}'})

@app.route('/network/status', methods=['GET'])
def network_status():
    """Get network status information."""
    try:
        hostname = socket.gethostname()
        ip_address = socket.gethostbyname(hostname)
        return jsonify({'hostname': hostname, 'ip_address': ip_address, 'status': 'Connected'})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/system/monitor', methods=['GET'])
def system_monitor():
    """Get system monitor information."""
    try:
        import psutil
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        return jsonify({'cpu': cpu_percent, 'memory': memory.percent, 'disk': disk.percent})
    except ImportError:
        # Simulated values if psutil not available
        return jsonify({'cpu': 45, 'memory': 60, 'disk': 70})
    except Exception as e:
        return jsonify({'error': str(e)})
    
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create default user if not exists
        from models import User
        if not User.query.filter_by(username='default').first():
            user = User(username='default')
            user.set_password('default')
            db.session.add(user)
            db.session.commit()
    app.run(debug=True, port=5000)
