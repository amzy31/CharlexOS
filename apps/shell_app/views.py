import subprocess
import time
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ShellCommand, ShellAlias
from .serializers import ShellCommandSerializer, ShellAliasSerializer


class ShellCommandViewSet(viewsets.ModelViewSet):
    """
    API endpoint for executing shell commands
    """
    queryset = ShellCommand.objects.all()
    serializer_class = ShellCommandSerializer

    @action(detail=False, methods=['post'])
    def execute(self, request):
        """Execute a shell command and save the result"""
        command = request.data.get('command', '')
        
        if not command:
            return Response({'error': 'Command is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_time = time.time()
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            execution_time = time.time() - start_time

            shell_command = ShellCommand.objects.create(
                command=command,
                output=result.stdout,
                error=result.stderr,
                return_code=result.returncode,
                execution_time=execution_time
            )

            serializer = self.get_serializer(shell_command)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except subprocess.TimeoutExpired:
            return Response({'error': 'Command execution timed out'}, status=status.HTTP_408_REQUEST_TIMEOUT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get command execution history"""
        limit = int(request.query_params.get('limit', 50))
        commands = ShellCommand.objects.all()[:limit]
        serializer = self.get_serializer(commands, many=True)
        return Response(serializer.data)


class ShellAliasViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing shell aliases
    """
    queryset = ShellAlias.objects.all()
    serializer_class = ShellAliasSerializer
    lookup_field = 'name'
