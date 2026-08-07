from django.db import models


class ShellCommand(models.Model):
    """Store shell command history"""
    command = models.TextField()
    output = models.TextField(blank=True)
    error = models.TextField(blank=True)
    return_code = models.IntegerField(default=0)
    executed_at = models.DateTimeField(auto_now_add=True)
    execution_time = models.FloatField(default=0.0)  # seconds

    class Meta:
        ordering = ['-executed_at']
        verbose_name_plural = "Shell Commands"

    def __str__(self):
        return f"${self.command[:100]}"


class ShellAlias(models.Model):
    """Store custom shell aliases"""
    name = models.CharField(max_length=255, unique=True)
    command = models.TextField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Shell Aliases"

    def __str__(self):
        return f"{self.name} -> {self.command[:50]}"
