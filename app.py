from flask import Flask, render_template, redirect, url_for, request, jsonify
from flask_login import LoginManager
from ui_components import window_manager_bp
from webdisk import webdisk_bp
from models import db
from shell import shell

app = Flask(__name__)
app.config['SECRET_KEY'] = '126d7df4-e660-45e1-ad94-bd616cd5b719z'  # Change this to a secure key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///webdisk.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'webdisk.webdisk'

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

app.register_blueprint(window_manager_bp)
app.register_blueprint(webdisk_bp)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/shell/execute', methods=['POST'])
def shell_execute():
    data = request.get_json()
    command = data.get('command', '')
    if not command:
        return jsonify({'output': 'No command provided'}), 400
    output = shell.execute_command(command)
    return jsonify({'output': output})

@app.route('/shell/history', methods=['GET'])
def shell_history():
    history = shell.get_history()
    return jsonify({'history': history})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
