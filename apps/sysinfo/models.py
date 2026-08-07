from django.db import models


class ProcessInfo(models.Model):
    """Store running process information"""
    pid = models.IntegerField()
    name = models.CharField(max_length=255)
    cpu_percent = models.FloatField(default=0.0)
    memory_mb = models.FloatField(default=0.0)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Process Info"
        ordering = ['-memory_mb']

    def __str__(self):
        return f"{self.name} (PID: {self.pid})"


class DiskUsage(models.Model):
    """Store disk usage statistics"""
    mount_point = models.CharField(max_length=255, unique=True)
    total_gb = models.FloatField()
    used_gb = models.FloatField()
    free_gb = models.FloatField()
    percent_used = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Disk Usage"
        ordering = ['mount_point']

    def __str__(self):
        return f"{self.mount_point} - {self.percent_used}% used"
