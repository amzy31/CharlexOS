from django.contrib import admin
from .models import ProcessInfo, DiskUsage


@admin.register(ProcessInfo)
class ProcessInfoAdmin(admin.ModelAdmin):
    list_display = ['name', 'pid', 'cpu_percent', 'memory_mb', 'status']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'pid']
    readonly_fields = ['created_at']


@admin.register(DiskUsage)
class DiskUsageAdmin(admin.ModelAdmin):
    list_display = ['mount_point', 'percent_used', 'total_gb', 'used_gb', 'free_gb']
    search_fields = ['mount_point']
    readonly_fields = ['updated_at']
