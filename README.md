# Charlex WebOS

A Django-powered web-based operating system with REST APIs for shell commands, notes, system information, and file management.

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run migrations
python manage.py migrate

# 3. Start server
python manage.py runserver

# 4. Visit http://localhost:8000
```

## Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Run server:**
   ```bash
   python manage.py runserver
   ```

Access at:
- App: http://localhost:8000
- Admin: http://localhost:8000/admin
- API: http://localhost:8000/api/

## Project Structure

```
.
├── charlex_config/       # Django configuration
├── apps/
│   ├── core/            # Core utilities
│   ├── shell_app/       # Shell command API
│   ├── notes/           # Notes management API
│   ├── sysinfo/         # System info API
│   └── webdisk/         # File management API
├── templates/           # HTML templates
├── static/              # CSS, JS, images
├── manage.py
└── requirements.txt
```

## Features

### Shell App (`/api/shell/`)
Execute shell commands with history tracking.

```bash
POST /api/shell/commands/execute/
{
  "command": "ls -la"
}
```

### Notes App (`/api/notes/`)
Create and manage notes with folders.

```bash
POST /api/notes/notes/
{
  "title": "My Note",
  "content": "Note content",
  "color": "#FFD700",
  "is_pinned": false
}
```

### System Info App (`/api/sysinfo/`)
Get system metrics: CPU, memory, disk, processes.

```bash
GET /api/sysinfo/info/cpu_info/
GET /api/sysinfo/info/memory_info/
GET /api/sysinfo/info/disk_usage/
```

### File Manager App (`/api/webdisk/`)
Manage files and folders.

```bash
GET/POST /api/webdisk/folders/
GET/POST /api/webdisk/files/
```

## Database Models

- **Shell:** ShellCommand, ShellAlias
- **Notes:** Note, Folder
- **System Info:** ProcessInfo, DiskUsage
- **Files:** Folder, File
- **Core:** SystemInfo, SystemLog

## API Integration

Fetch data in JavaScript:

```javascript
fetch('/api/shell/commands/execute/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({command: 'whoami'})
})
.then(r => r.json())
.then(data => console.log(data.output));
```

## Configuration

Create `.env` file:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn charlex_config.wsgi:application --bind 0.0.0.0:8000
```

### Using Docker

```bash
docker build -t charlex .
docker run -p 8000:8000 charlex
```

## Troubleshooting

```bash
# Database issues
python manage.py migrate --run-syncdb

# Missing static files
python manage.py collectstatic --noinput

# Different port
python manage.py runserver 8001
```

## Development

- Models: `apps/*/models.py`
- API Views: `apps/*/views.py`
- Serializers: `apps/*/serializers.py`
- URLs: `apps/*/urls.py`

## Security (Production)

1. Set `DEBUG = False`
2. Generate new `SECRET_KEY`
3. Update `ALLOWED_HOSTS`
4. Use environment variables for secrets
5. Enable HTTPS
6. Use PostgreSQL instead of SQLite

## License

Same as original Charlex Web OS project.
