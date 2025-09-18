from flask import Blueprint, request, jsonify, render_template_string, session, redirect, url_for, flash, get_flashed_messages
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User, File, Folder
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
import base64
import hashlib
from ui_components import Window, Form, Input, Button, List

webdisk_bp = Blueprint('webdisk', __name__)

def derive_key(passphrase):
    return base64.urlsafe_b64encode(hashlib.sha256(passphrase.encode()).digest())

@webdisk_bp.route('/webdisk/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        login_user(user)
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Invalid credentials'})

@webdisk_bp.route('/webdisk/register', methods=['POST'])
def register_api():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists'})
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Registration successful'})

@webdisk_bp.route('/webdisk/unlock', methods=['POST'])
@login_required
def unlock_api():
    data = request.get_json()
    passphrase = data.get('passphrase')
    session['passphrase'] = passphrase
    session['readonly'] = False  # Always allow write access if passphrase is provided
    session['current_folder'] = None
    return jsonify({'success': True})

@webdisk_bp.route('/webdisk/files', methods=['GET'])
@login_required
def files_api():
    current_folder = session.get('current_folder')
    files = File.query.filter_by(user_id=current_user.id, folder_id=current_folder).all()
    folders = Folder.query.filter_by(user_id=current_user.id).all() if not current_folder else []
    file_list = [{'id': f.id, 'filename': f.filename} for f in files]
    folder_list = [{'id': f.id, 'name': f.name} for f in folders]
    folder_name = None
    if current_folder:
        folder = Folder.query.get(current_folder)
        if folder:
            folder_name = folder.name
    readonly = session.get('readonly', 'passphrase' not in session)
    return jsonify({'success': True, 'files': file_list, 'folders': folder_list, 'readonly': readonly, 'current_folder': current_folder, 'folder_name': folder_name})

@webdisk_bp.route('/webdisk/upload', methods=['POST'])
@login_required
def upload_api():
    if 'passphrase' not in session:
        return jsonify({'success': False, 'message': 'Not unlocked'})
    file = request.files['file']
    if file:
        key = derive_key(session['passphrase'])
        fernet = Fernet(key)
        encrypted_data = fernet.encrypt(file.read())
        new_file = File(filename=file.filename, data=encrypted_data, user_id=current_user.id, folder_id=session.get('current_folder'))
        db.session.add(new_file)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'No file'})

@webdisk_bp.route('/webdisk/create_folder', methods=['POST'])
@login_required
def create_folder_api():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Directory name required'})
    if Folder.query.filter_by(user_id=current_user.id, name=name).first():
        return jsonify({'success': False, 'message': 'Directory already exists'})
    new_folder = Folder(name=name, user_id=current_user.id)
    db.session.add(new_folder)
    db.session.commit()
    return jsonify({'success': True})

@webdisk_bp.route('/webdisk/navigate/<folder_id>', methods=['POST'])
@login_required
def navigate_api(folder_id):
    if folder_id == 'root':
        session['current_folder'] = None
    else:
        folder = Folder.query.get_or_404(int(folder_id))
        if folder.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Unauthorized'})
        session['current_folder'] = int(folder_id)
    return jsonify({'success': True})

@webdisk_bp.route('/webdisk/logout', methods=['POST'])
@login_required
def logout_api():
    logout_user()
    session.pop('passphrase', None)
    session.pop('current_folder', None)
    return jsonify({'success': True})



@webdisk_bp.route('/webdisk/unlock', methods=['GET', 'POST'])
@login_required
def unlock():
    if request.method == 'POST':
        passphrase = request.form.get('passphrase')
        session['passphrase'] = passphrase
        return redirect(url_for('webdisk.files'))
    window = Window(id="unlockWindow", title="Unlock WebDisk", top=200, left=200)
    unlock_form = Form(method="POST")
    unlock_form.add(Input(type="password", name="passphrase", placeholder="Passphrase", required=True, style="width: 100%; margin-bottom: 10px; padding: 8px;"))
    unlock_form.add(Button(text="Unlock", style="width: 100%; padding: 8px; background: #1e90ff; color: white; border: none;"))
    window.add(unlock_form)
    return window.render()

@webdisk_bp.route('/webdisk/files', methods=['GET'])
@login_required
def files():
    if 'passphrase' not in session:
        return redirect(url_for('webdisk.unlock'))
    current_folder = session.get('current_folder')
    files_db = File.query.filter_by(user_id=current_user.id, folder_id=current_folder).all()
    folders_db = Folder.query.filter_by(user_id=current_user.id).all() if not current_folder else []
    folder_items = [{'text': f'📁 {f.name}', 'href': url_for('webdisk.navigate', folder_id=f.id)} for f in folders_db]
    file_items = [{'text': f.filename, 'href': f'/webdisk/download/{f.id}'} for f in files_db]
    items = folder_items + file_items
    title = "WebDisk Files"
    if current_folder:
        folder = Folder.query.get(current_folder)
        if folder:
            title += f" - {folder.name}"
    window = Window(id="filesWindow", title=title)
    # Create folder form
    create_folder_form = Form(method="POST", action=url_for('webdisk.create_folder_ui'))
    create_folder_form.add(Input(type="text", name="name", placeholder="New Folder Name", required=True, style="margin-bottom: 10px; padding: 8px; width: 100%;"))
    create_folder_form.add(Button(text="Create Folder", style="padding: 8px; background: #28a745; color: white; border: none; margin-bottom: 10px;"))
    window.add(create_folder_form)
    # Upload form
    upload_form = Form(method="POST", action="/webdisk/upload", enctype="multipart/form-data")
    upload_form.add(Input(type="file", name="file", required=True, style="margin-bottom: 10px;"))
    upload_form.add(Button(text="Upload", style="padding: 8px; background: #1e90ff; color: white; border: none;"))
    window.add(upload_form)
    # Navigation
    if current_folder:
        nav_form = Form(method="POST", action=url_for('webdisk.navigate', folder_id='root'))
        nav_form.add(Button(text="Back to Root", style="padding: 8px; background: #6c757d; color: white; border: none; margin-bottom: 10px;"))
        window.add(nav_form)
    file_list = List(items=items)
    window.add(file_list)
    return window.render()

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
        new_file = File(filename=file.filename, data=encrypted_data, user_id=current_user.id, folder_id=session.get('current_folder'))
        db.session.add(new_file)
        db.session.commit()
    return redirect(url_for('webdisk.files'))

@webdisk_bp.route('/webdisk/download/<int:file_id>')
@login_required
def download(file_id):
    if 'passphrase' not in session:
        return 'Passphrase not set', 400
    if session.get('readonly'):
        return 'Read-only mode, cannot download', 403
    file = File.query.get_or_404(file_id)
    if file.user_id != current_user.id:
        return 'Unauthorized', 403
    key = derive_key(session['passphrase'])
    fernet = Fernet(key)
    try:
        decrypted_data = fernet.decrypt(file.data)
    except Exception as e:
        return 'Invalid passphrase', 400
    from flask import send_file
    import io
    return send_file(io.BytesIO(decrypted_data), as_attachment=True, download_name=file.filename)

@webdisk_bp.route('/webdisk/create_folder_ui', methods=['POST'])
@login_required
def create_folder_ui():
    if 'passphrase' not in session:
        return redirect(url_for('webdisk.unlock'))
    name = request.form.get('name')
    if not name:
        flash('Directory name required')
        return redirect(url_for('webdisk.files'))
    if Folder.query.filter_by(user_id=current_user.id, name=name).first():
        flash('Directory already exists')
        return redirect(url_for('webdisk.files'))
    new_folder = Folder(name=name, user_id=current_user.id)
    db.session.add(new_folder)
    db.session.commit()
    return redirect(url_for('webdisk.files'))

@webdisk_bp.route('/webdisk/navigate/<folder_id>', methods=['GET', 'POST'])
@login_required
def navigate(folder_id):
    if 'passphrase' not in session:
        return redirect(url_for('webdisk.unlock'))
    if folder_id == 'root':
        session['current_folder'] = None
    else:
        folder = Folder.query.get_or_404(int(folder_id))
        if folder.user_id != current_user.id:
            flash('Unauthorized')
            return redirect(url_for('webdisk.files'))
        session['current_folder'] = int(folder_id)
    return redirect(url_for('webdisk.files'))

@webdisk_bp.route('/webdisk/logout')
@login_required
def logout():
    logout_user()
    session.pop('passphrase', None)
    session.pop('current_folder', None)
    return redirect(url_for('webdisk.webdisk'))
