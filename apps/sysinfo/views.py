import os
import psutil
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ProcessInfo, DiskUsage
from .serializers import ProcessInfoSerializer, DiskUsageSerializer


class SysInfoViewSet(viewsets.ViewSet):
    """
    API endpoint for system information
    """
    
    @action(detail=False, methods=['get'])
    def cpu_info(self, request):
        """Get CPU information"""
        try:
            cpu_count = psutil.cpu_count()
            cpu_percent = psutil.cpu_percent(interval=1)
            return Response({
                'cpu_count': cpu_count,
                'cpu_percent': cpu_percent,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def memory_info(self, request):
        """Get memory information"""
        try:
            memory = psutil.virtual_memory()
            return Response({
                'total_mb': memory.total / (1024 ** 2),
                'available_mb': memory.available / (1024 ** 2),
                'percent_used': memory.percent,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def disk_usage(self, request):
        """Get disk usage information"""
        try:
            disk_usage = psutil.disk_usage('/')
            return Response({
                'total_gb': disk_usage.total / (1024 ** 3),
                'used_gb': disk_usage.used / (1024 ** 3),
                'free_gb': disk_usage.free / (1024 ** 3),
                'percent_used': disk_usage.percent,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def hostname(self, request):
        """Get hostname"""
        try:
            return Response({'hostname': os.uname().nodename})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def uptime(self, request):
        """Get system uptime"""
        try:
            boot_time = psutil.boot_time()
            uptime_seconds = int(os.times()[4] - boot_time)
            return Response({'uptime_seconds': uptime_seconds})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProcessInfoViewSet(viewsets.ModelViewSet):
    """
    API endpoint for process information
    """
    queryset = ProcessInfo.objects.all()
    serializer_class = ProcessInfoSerializer

    @action(detail=False, methods=['get'])
    def running(self, request):
        """Get list of running processes"""
        try:
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
                try:
                    processes.append({
                        'pid': proc.pid,
                        'name': proc.name(),
                        'cpu_percent': proc.cpu_percent(interval=0.1),
                        'memory_mb': proc.memory_info().rss / (1024 ** 2),
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            return Response(processes[:50])  # Limit to 50 processes
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DiskUsageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for disk usage
    """
    queryset = DiskUsage.objects.all()
    serializer_class = DiskUsageSerializer
    lookup_field = 'mount_point'
