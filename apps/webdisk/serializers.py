from rest_framework import serializers
from .models import Folder, File


class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'folder', 'size_bytes', 'mime_type', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'size_bytes']
