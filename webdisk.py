from flask import Blueprint, request, jsonify, render_template_string, session, redirect, url_for, flash, get_flashed_messages
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User, File
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
import base64
import hashlib

webdisk_bp = Blueprint('webdisk', __name__)

def derive_key(passphrase):
    return base64.urlsafe_b64encode(hashlib.sha256(passphrase.encode()).digest())

@webdisk_bp.route('/webdisk', methods=['GET', 'POST'])
def webdisk():
    messages = get_flashed_messages()
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('webdisk.unlock'))
        flash('Invalid credentials')
        messages = get_flashed_messages()
    return render_template_string('''
    <div class="window" id="webdiskWindow" style="top: 150px; left: 150px; display: flex; flex-direction: column;">
        <div class="window-header" onmousedown="startDrag(event, 'webdiskWindow')">
            <div class="window-controls">
                <div class="window-control-button close" onclick="closeWindow('webdiskWindow')" title="Close"></div>
                <div class="window-control-button minimize" onclick="minimizeWindow('webdiskWindow')" title="Minimize"></div>
                <div class="window-control-button maximize" onclick="maximizeWindow('webdiskWindow')" title="Maximize"></div>
            </div>
            <div class="window-title">WebDisk Login</div>
            <div style="width: 48px;"></div>
        </div>
        <div class="window-content" style="padding: 20px;">
            {% if messages %}
            <div style="color: red; margin-bottom: 10px;">
                {% for message in messages %}
                {{ message }}<br>
                {% endfor %}
            </div>
            {% endif %}
            <form method="POST">
                <input type="text" name="username" placeholder="Username" required style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                <input type="password" name="password" placeholder="Password" required style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                <button type="submit" style="width: 100%; padding: 8px; background: #1e90ff; color: white; border: none;">Login</button>
            </form>
            <a href="{{ url_for('webdisk.register') }}">Register</a>
        </div>
    </div>
    ''', messages=messages)

@webdisk_bp.route('/register', methods=['GET', 'POST'])
def register():
    messages = get_flashed_messages()
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            messages = get_flashed_messages()
        else:
            user = User(username=username)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            flash('Registration successful, please login')
            return redirect(url_for('webdisk.webdisk'))
    return render_template_string('''
    <div class="window" id="registerWindow" style="top: 150px; left: 150px; display: flex; flex-direction: column;">
        <div class="window-header" onmousedown="startDrag(event, 'registerWindow')">
            <div class="window-controls">
                <div class="window-control-button close" onclick="closeWindow('registerWindow')" title="Close"></div>
                <div class="window-control-button minimize" onclick="minimizeWindow('registerWindow')" title="Minimize"></div>
                <div class="window-control-button maximize" onclick="maximizeWindow('registerWindow')" title="Maximize"></div>
            </div>
            <div class="window-title">Register</div>
            <div style="width: 48px;"></div>
        </div>
        <div class="window-content" style="padding: 20px;">
            {% if messages %}
            <div style="color: red; margin-bottom: 10px;">
                {% for message in messages %}
                {{ message }}<br>
                {% endfor %}
            </div>
            {% endif %}
            <form method="POST">
                <input type="text" name="username" placeholder="Username" required style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                <input type="password" name="password" placeholder="Password" required style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                <button type="submit" style="width: 100%; padding: 8px; background: #1e90ff; color: white; border: none;">Register</button>
            </form>
            <a href="{{ url_for('webdisk.webdisk') }}">Login</a>
        </div>
    </div>
    ''', messages=messages)

@webdisk_bp.route('/webdisk/unlock', methods=['GET', 'POST'])
@login_required
def unlock():
    if request.method == 'POST':
        passphrase = request.form.get('passphrase')
        session['passphrase'] = passphrase
        return redirect(url_for('webdisk.files'))
    return render_template_string('''
    <div class="window" id="unlockWindow" style="top: 200px; left: 200px; display: flex; flex-direction: column;">
        <div class="window-header" onmousedown="startDrag(event, 'unlockWindow')">
            <div class="window-controls">
                <div class="window-control-button close" onclick="closeWindow('unlockWindow')" title="Close"></div>
                <div class="window-control-button minimize" onclick="minimizeWindow('unlockWindow')" title="Minimize"></div>
                <div class="window-control-button maximize" onclick="maximizeWindow('unlockWindow')" title="Maximize"></div>
            </div>
            <div class="window-title">Unlock WebDisk</div>
            <div style="width: 48px;"></div>
        </div>
        <div class="window-content" style="padding: 20px;">
            <form method="POST">
                <input type="password" name="passphrase" placeholder="Passphrase" required style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
                <button type="submit" style="width: 100%; padding: 8px; background: #1e90ff; color: white; border: none;">Unlock</button>
            </form>
        </div>
    </div>
    ''')

@webdisk_bp.route('/webdisk/files', methods=['GET'])
@login_required
def files():
    if 'passphrase' not in session:
        return redirect(url_for('webdisk.unlock'))
    files = File.query.filter_by(user_id=current_user.id).all()
    file_list = [{'id': f.id, 'filename': f.filename} for f in files]
    return render_template_string('''
    <div class="window" id="filesWindow" style="top: 250px; left: 250px; display: flex; flex-direction: column;">
        <div class="window-header" onmousedown="startDrag(event, 'filesWindow')">
            <div class="window-controls">
                <div class="window-control-button close" onclick="closeWindow('filesWindow')" title="Close"></div>
                <div class="window-control-button minimize" onclick="minimizeWindow('filesWindow')" title="Minimize"></div>
                <div class="window-control-button maximize" onclick="maximizeWindow('filesWindow')" title="Maximize"></div>
            </div>
            <div class="window-title">WebDisk Files</div>
            <div style="width: 48px;"></div>
        </div>
        <div class="window-content" style="padding: 20px;">
            <form method="POST" action="/webdisk/upload" enctype="multipart/form-data">
                <input type="file" name="file" required style="margin-bottom: 10px;"><br>
                <button type="submit" style="padding: 8px; background: #1e90ff; color: white; border: none;">Upload</button>
            </form>
            <ul>
                {% for file in files %}
                <li>{{ file.filename }} <a href="/webdisk/download/{{ file.id }}">Download</a></li>
                {% endfor %}
            </ul>
        </div>
    </div>
    ''', files=file_list)

@webdisk_bp.route('/webdisk/upload', methods=['POST'])
@login_required
def upload():
    if 'passphrase' not in session:
        return redirect(url_for('webdisk.unlock'))
    file = request.files['file']
    if file:
        key = derive_key(session['passphrase'])
        fernet = Fernet(key)
        encrypted_data = fernet.encrypt(file.read())
        new_file = File(filename=file.filename, data=encrypted_data, user_id=current_user.id)
        db.session.add(new_file)
        db.session.commit()
    return redirect(url_for('webdisk.files'))

@webdisk_bp.route('/webdisk/download/<int:file_id>')
@login_required
def download(file_id):
    if 'passphrase' not in session:
        return redirect(url_for('webdisk.unlock'))
    file = File.query.get_or_404(file_id)
    if file.user_id != current_user.id:
        return 'Unauthorized', 403
    key = derive_key(session['passphrase'])
    fernet = Fernet(key)
    decrypted_data = fernet.decrypt(file.data)
    from flask import send_file
    import io
    return send_file(io.BytesIO(decrypted_data), as_attachment=True, download_name=file.filename)

@webdisk_bp.route('/webdisk/logout')
@login_required
def logout():
    logout_user()
    session.pop('passphrase', None)
    return redirect(url_for('webdisk.webdisk'))
