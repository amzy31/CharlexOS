from django.db import models


class SystemInfo(models.Model):
    """Store system information"""
    hostname = models.CharField(max_length=255)
    os_type = models.CharField(max_length=100)
    os_version = models.CharField(max_length=100)
    uptime_seconds = models.IntegerField(default=0)
    total_memory = models.BigIntegerField(default=0)
    available_memory = models.BigIntegerField(default=0)
    cpu_count = models.IntegerField(default=0)
    cpu_usage_percent = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "System Info"
        ordering = ['-updated_at']

    def __str__(self):
        return f"System Info - {self.hostname}"


class SystemLog(models.Model):
    """Store system logs"""
    LOG_LEVELS = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('debug', 'Debug'),
    ]
    
    level = models.CharField(max_length=20, choices=LOG_LEVELS, default='info')
    message = models.TextField()
    component = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.level}] {self.component} - {self.message[:50]}"
