# Merged UI Components and Window Manager
from flask import Blueprint, Response, request, render_template_string, jsonify, send_from_directory
import os
import uuid

# UI Component Classes
class UIComponent:
    def render(self):
        pass

class Window(UIComponent):
    def __init__(self, id, title, top=250, left=250):
        self.id = id
        self.title = title
        self.top = top
        self.left = left
        self.content = []

    def add(self, component):
        self.content.append(component)

    def render(self):
        content_html = "".join([c.render() for c in self.content])
        return f'''
<div class="window" id="{self.id}" style="top: {self.top}px; left: {self.left}px; display: flex; flex-direction: column;">
    <div class="window-header" onmousedown="startDrag(event, '{self.id}')">
        <div class="window-controls">
            <div class="window-control-button close" onclick="closeWindow('{self.id}')" title="Close"></div>
            <div class="window-control-button minimize" onclick="minimizeWindow('{self.id}')" title="Minimize"></div>
            <div class="window-control-button maximize" onclick="maximizeWindow('{self.id}')" title="Maximize"></div>
        </div>
        <div class="window-title">{self.title}</div>
        <div style="width: 48px;"></div>
    </div>
    <div class="window-content" style="padding: 20px;">
        {content_html}
    </div>
</div>
'''

class Button(UIComponent):
    def __init__(self, text, onclick=None, style="", type="button"):
        self.text = text
        self.onclick = onclick
        self.style = style
        self.type = type

    def render(self):
        onclick_attr = f' onclick="{self.onclick}"' if self.onclick else ""
        return f'<button type="{self.type}"{onclick_attr} style="{self.style}">{self.text}</button>'

class Form(UIComponent):
    def __init__(self, method="POST", action="", enctype=None):
        self.method = method
        self.action = action
        self.enctype = enctype
        self.elements = []

    def add(self, element):
        self.elements.append(element)

    def render(self):
        enctype_attr = f' enctype="{self.enctype}"' if self.enctype else ""
        elements_html = "".join([e.render() for e in self.elements])
        return f'<form method="{self.method}" action="{self.action}"{enctype_attr}>{elements_html}</form>'

class Input(UIComponent):
    def __init__(self, type="text", name="", placeholder="", required=False, style="", value=""):
        self.type = type
        self.name = name
        self.placeholder = placeholder
        self.required = required
        self.style = style
        self.value = value

    def render(self):
        required_attr = " required" if self.required else ""
        value_attr = f' value="{self.value}"' if self.value else ""
        return f'<input type="{self.type}" name="{self.name}" placeholder="{self.placeholder}"{required_attr}{value_attr} style="{self.style}">'

class Textarea(UIComponent):
    def __init__(self, name="", placeholder="", style="", value=""):
        self.name = name
        self.placeholder = placeholder
        self.style = style
        self.value = value

    def render(self):
        return f'<textarea name="{self.name}" placeholder="{self.placeholder}" style="{self.style}">{self.value}</textarea>'

class List(UIComponent):
    def __init__(self, items, style="background: #000; color: #0f0; padding: 10px; font-family: monospace;"):
        self.items = items  # list of dicts with 'text', 'href' or just strings
        self.style = style

    def render(self):
        items_html = ""
        for item in self.items:
            if isinstance(item, dict):
                href = item.get('href', '#')
                text = item.get('text', '')
                items_html += f'<div><a href="{href}" style="color: #0f0; text-decoration: none;">{text}</a></div>'
            else:
                items_html += f'<div>{item}</div>'
        return f'<div style="{self.style}">{items_html}</div>'

class Div(UIComponent):
    def __init__(self, content="", style=""):
        self.content = content
        self.style = style

    def render(self):
        return f'<div style="{self.style}">{self.content}</div>'

class Label(UIComponent):
    def __init__(self, text, style=""):
        self.text = text
        self.style = style

    def render(self):
        return f'<label style="{self.style}">{self.text}</label>'

# Window Manager Blueprint
window_manager_bp = Blueprint('window_manager', __name__)

# In-memory note storage
note_content = ""

js_code = """let dragData={dragging:false,offsetX:0,offsetY:0,targetId:null};function startDrag(e,id){dragData.dragging=true;dragData.targetId=id;const target=document.getElementById(id);dragData.offsetX=e.clientX-target.offsetLeft;dragData.offsetY=e.clientY-target.offsetTop;document.body.style.userSelect='none'}window.addEventListener('mousemove',(e)=>{if(!dragData.dragging)return;const target=document.getElementById(dragData.targetId);let newX=e.clientX-dragData.offsetX;let newY=e.clientY-dragData.offsetY;newX=Math.max(0,Math.min(newX,window.innerWidth-target.offsetWidth));newY=Math.max(0,Math.min(newY,window.innerHeight-target.offsetHeight-80));target.style.left=newX+'px';target.style.top=newY+'px'});window.addEventListener('mouseup',()=>{dragData.dragging=false;document.body.style.userSelect='auto'});function closeWindow(id){const win=document.getElementById(id);win.style.display='none'}function minimizeWindow(id){const win=document.getElementById(id);win.style.display='none'}function maximizeWindow(id){const win=document.getElementById(id);if(win.classList.contains('maximized')){win.style.top=win.dataset.prevTop;win.style.left=win.dataset.prevLeft;win.style.width='300px';win.style.height='auto';win.classList.remove('maximized')}else{win.dataset.prevTop=win.style.top;win.style.left=win.style.left;win.style.top='0px';win.style.left='0px';win.style.width='100vw';win.style.height='calc(100vh - 80px)';win.classList.add('maximized')}}function openWindow(id){const win=document.getElementById(id);win.style.display='flex';win.style.zIndex=1000}document.addEventListener('DOMContentLoaded',()=>{const saveDownloadBtn=document.getElementById('saveDownloadBtn');if(saveDownloadBtn){saveDownloadBtn.replaceWith(saveDownloadBtn.cloneNode(true));const newSaveDownloadBtn=document.getElementById('saveDownloadBtn');newSaveDownloadBtn.addEventListener('click',async()=>{const contentElem=document.getElementById('noteContent');if(!contentElem){alert('Note content element not found');return}const content=contentElem.value;try{const response=await fetch('/note/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({noteContent:content})});if(!response.ok){throw new Error('Failed to save note')}const data=await response.json();const noteId=data.note_id;const downloadUrl=`/note/download/${noteId}`;const a=document.createElement('a');a.href=downloadUrl;a.download=`${noteId}.txt`;document.body.appendChild(a);a.click();document.body.removeChild(a)}catch(error){alert('Error saving and downloading note: '+error.message)}})}})"""

@window_manager_bp.route('/window_manager.js')
def serve_js():
    return Response(js_code, mimetype='application/javascript')

@window_manager_bp.route('/note', methods=['GET', 'POST'])
def note():
    global note_content
    if request.method == 'POST':
        note_content = request.form.get('noteContent', '')
        return '', 204
    else:
        # Stream the note content as plain text
        return Response(note_content, mimetype='text/plain')

# Directory to save notes
SAVE_DIR = 'saved_notes'

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

@window_manager_bp.route('/note/save', methods=['POST'])
def save_note():
    data = request.get_json()
    content = data.get('noteContent', '')
    note_id = str(uuid.uuid4())
    filename = f"{note_id}.txt"
    filepath = os.path.join(SAVE_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return jsonify({'note_id': note_id})

@window_manager_bp.route('/note/download/<note_id>', methods=['GET'])
def download_note(note_id):
    filename = f"{note_id}.txt"
    return send_from_directory(SAVE_DIR, filename, as_attachment=True)

@window_manager_bp.route('/calculator', methods=['POST'])
def calculator():
    data = request.get_json()
    expression = data.get('expression', '')
    try:
        result = eval(expression)
        return jsonify({'result': str(result)})
    except Exception as e:
        return jsonify({'error': str(e)})
