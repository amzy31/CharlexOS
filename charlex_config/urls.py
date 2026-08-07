"""
URL configuration for Charlex Web OS project.
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from pathlib import Path

urlpatterns = [
    path('api/shell/', include('apps.shell_app.urls')),
    path('api/notes/', include('apps.notes.urls')),
    path('api/sysinfo/', include('apps.sysinfo.urls')),
    path('api/webdisk/', include('apps.webdisk.urls')),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Serve static files from STATICFILES_DIRS (not STATIC_ROOT which is for production)
    for static_dir in settings.STATICFILES_DIRS:
        urlpatterns += static(settings.STATIC_URL, document_root=static_dir)
    # Also serve /img/ for compatibility with relative paths in JavaScript
    img_dir = Path(settings.STATICFILES_DIRS[0]) / 'img'
    urlpatterns += static('/img/', document_root=str(img_dir))
