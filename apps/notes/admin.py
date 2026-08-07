from django.contrib import admin
from .models import Note, Folder


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'color', 'is_pinned', 'updated_at']
    list_filter = ['is_pinned', 'updated_at']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
