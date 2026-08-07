from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, FolderViewSet

router = DefaultRouter()
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'folders', FolderViewSet, basename='folder')

urlpatterns = [
    path('', include(router.urls)),
]
