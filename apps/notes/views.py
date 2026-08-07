from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Note, Folder
from .serializers import NoteSerializer, FolderSerializer


class NoteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing notes
    """
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

    @action(detail=False, methods=['get'])
    def pinned(self, request):
        """Get all pinned notes"""
        pinned_notes = Note.objects.filter(is_pinned=True)
        serializer = self.get_serializer(pinned_notes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """Toggle pin status of a note"""
        note = self.get_object()
        note.is_pinned = not note.is_pinned
        note.save()
        serializer = self.get_serializer(note)
        return Response(serializer.data)


class FolderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing note folders
    """
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
    lookup_field = 'name'
