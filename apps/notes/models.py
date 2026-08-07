from django.db import models
from django.utils import timezone


class Note(models.Model):
    """Store notes/text documents"""
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#FFFFFF')  # Hex color
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['is_pinned', '-updated_at']),
        ]

    def __str__(self):
        return self.title or "Untitled Note"


class Folder(models.Model):
    """Store note folders/categories"""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
