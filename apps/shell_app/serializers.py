from rest_framework import serializers
from .models import ShellCommand, ShellAlias


class ShellCommandSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShellCommand
        fields = ['id', 'command', 'output', 'error', 'return_code', 'executed_at', 'execution_time']
        read_only_fields = ['executed_at', 'return_code', 'output', 'error', 'execution_time']


class ShellAliasSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShellAlias
        fields = ['id', 'name', 'command', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
