from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShellCommandViewSet, ShellAliasViewSet

router = DefaultRouter()
router.register(r'commands', ShellCommandViewSet, basename='shell-command')
router.register(r'aliases', ShellAliasViewSet, basename='shell-alias')

urlpatterns = [
    path('', include(router.urls)),
]
