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
