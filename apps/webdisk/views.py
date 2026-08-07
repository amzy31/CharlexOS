from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Folder, File
from .serializers import FolderSerializer, FileSerializer


class FolderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing webdisk folders
    """
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

    @action(detail=False, methods=['get'])
    def root(self, request):
        """Get root folder"""
        root_folders = Folder.objects.filter(parent__isnull=True)
        serializer = self.get_serializer(root_folders, many=True)
        return Response(serializer.data)


class FileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing webdisk files
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        """Save file size when creating"""
        file_obj = serializer.validated_data.get('file')
        serializer.save(size_bytes=file_obj.size)

    @action(detail=False, methods=['get'])
    def by_folder(self, request):
        """Get files by folder"""
        folder_id = request.query_params.get('folder_id')
        if folder_id:
            files = File.objects.filter(folder_id=folder_id)
        else:
            files = File.objects.filter(folder__isnull=True)
        serializer = self.get_serializer(files, many=True)
        return Response(serializer.data)
