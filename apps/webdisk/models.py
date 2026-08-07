from django.db import models
from django.core.files.storage import default_storage


class Folder(models.Model):
    """Store folder structure for webdisk"""
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'parent')
        ordering = ['name']

    def __str__(self):
        return self.name


class File(models.Model):
    """Store file metadata for webdisk"""
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='webdisk/')
    folder = models.ForeignKey(Folder, null=True, blank=True, on_delete=models.CASCADE, related_name='files')
    size_bytes = models.BigIntegerField()
    mime_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'folder')
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_size_display(self):
        """Return human-readable file size"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if self.size_bytes < 1024:
                return f"{self.size_bytes:.2f} {unit}"
            self.size_bytes /= 1024
        return f"{self.size_bytes:.2f} TB"
