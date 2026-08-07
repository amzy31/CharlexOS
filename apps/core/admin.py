from django.contrib import admin
from .models import SystemInfo, SystemLog


@admin.register(SystemInfo)
class SystemInfoAdmin(admin.ModelAdmin):
    list_display = ['hostname', 'cpu_usage_percent', 'available_memory', 'updated_at']
    readonly_fields = ['hostname', 'os_type', 'os_version', 'uptime_seconds', 'total_memory', 'available_memory', 'cpu_count', 'cpu_usage_percent', 'created_at', 'updated_at']


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ['level', 'component', 'message', 'timestamp']
    list_filter = ['level', 'component', 'timestamp']
    search_fields = ['message', 'component']
    readonly_fields = ['timestamp']
