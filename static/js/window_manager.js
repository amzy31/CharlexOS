// Window Manager JavaScript for drag, resize, and interactions
let dragData = { dragging: false, offsetX: 0, offsetY: 0, targetId: null };

function startDrag(e, id) {
  dragData.dragging = true;
  dragData.targetId = id;
  const target = document.getElementById(id);
  dragData.offsetX = e.clientX - target.offsetLeft;
  dragData.offsetY = e.clientY - target.offsetTop;
  document.body.style.userSelect = 'none';
}

window.addEventListener('mousemove', (e) => {
  if (!dragData.dragging) return;
  const target = document.getElementById(dragData.targetId);
  let newX = e.clientX - dragData.offsetX;
  let newY = e.clientY - dragData.offsetY;
  newX = Math.max(0, Math.min(newX, window.innerWidth - target.offsetWidth));
  newY = Math.max(0, Math.min(newY, window.innerHeight - target.offsetHeight - 80));
  target.style.left = newX + 'px';
  target.style.top = newY + 'px';
});

window.addEventListener('mouseup', () => {
  dragData.dragging = false;
  document.body.style.userSelect = 'auto';
});

function closeWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'none';
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'none';
}

function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (win.classList.contains('maximized')) {
    win.style.top = win.dataset.prevTop;
    win.style.left = win.dataset.prevLeft;
    win.style.width = '300px';
    win.style.height = 'auto';
    win.classList.remove('maximized');
  } else {
    win.dataset.prevTop = win.style.top;
    win.dataset.prevLeft = win.style.left;
    win.style.top = '0px';
    win.style.left = '0px';
    win.style.width = '100vw';
    win.style.height = 'calc(100vh - 80px)';
    win.classList.add('maximized');
  }
}

function openWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'flex';
  win.style.zIndex = 1000;
}

document.addEventListener('DOMContentLoaded', () => {
  const saveDownloadBtn = document.getElementById('saveDownloadBtn');
  if (saveDownloadBtn) {
    saveDownloadBtn.replaceWith(saveDownloadBtn.cloneNode(true));
    const newSaveDownloadBtn = document.getElementById('saveDownloadBtn');
    newSaveDownloadBtn.addEventListener('click', async () => {
      const contentElem = document.getElementById('noteContent');
      if (!contentElem) {
        alert('Note content element not found');
        return;
      }
      const content = contentElem.value;
      try {
        const response = await fetch('/note/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteContent: content })
        });
        if (!response.ok) throw new Error('Failed to save note');
        const data = await response.json();
        const noteId = data.note_id;
        const downloadUrl = `/note/download/${noteId}`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${noteId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        alert('Error saving and downloading note: ' + error.message);
      }
    });
  }
});
