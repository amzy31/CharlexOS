from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SysInfoViewSet, ProcessInfoViewSet, DiskUsageViewSet

router = DefaultRouter()
router.register(r'processes', ProcessInfoViewSet, basename='process-info')
router.register(r'disk', DiskUsageViewSet, basename='disk-usage')
router.register(r'info', SysInfoViewSet, basename='sysinfo')

urlpatterns = [
    path('', include(router.urls)),
]
