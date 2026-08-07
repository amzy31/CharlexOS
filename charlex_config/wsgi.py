"""
WSGI config for Charlex Web OS project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'charlex_config.settings')

application = get_wsgi_application()
