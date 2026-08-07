from rest_framework import serializers
from .models import ProcessInfo, DiskUsage


class ProcessInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessInfo
        fields = ['id', 'pid', 'name', 'cpu_percent', 'memory_mb', 'status', 'created_at']
        read_only_fields = ['created_at']


class DiskUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiskUsage
        fields = ['id', 'mount_point', 'total_gb', 'used_gb', 'free_gb', 'percent_used', 'updated_at']
        read_only_fields = ['updated_at']
