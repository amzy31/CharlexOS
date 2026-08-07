from rest_framework import serializers
from .models import Note, Folder


class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'color', 'is_pinned', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
