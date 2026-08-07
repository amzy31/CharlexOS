from django.contrib import admin
from .models import Folder, File


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ['name', 'folder', 'size_bytes', 'mime_type', 'updated_at']
    list_filter = ['mime_type', 'created_at']
    search_fields = ['name', 'mime_type']
    readonly_fields = ['created_at', 'updated_at', 'size_bytes']
