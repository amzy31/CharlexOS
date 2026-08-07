from django.contrib import admin
from .models import ShellCommand, ShellAlias


@admin.register(ShellCommand)
class ShellCommandAdmin(admin.ModelAdmin):
    list_display = ['command', 'return_code', 'execution_time', 'executed_at']
    list_filter = ['return_code', 'executed_at']
    search_fields = ['command', 'output', 'error']
    readonly_fields = ['executed_at', 'return_code', 'output', 'error', 'execution_time']


@admin.register(ShellAlias)
class ShellAliasAdmin(admin.ModelAdmin):
    list_display = ['name', 'command', 'created_at']
    search_fields = ['name', 'command']
    readonly_fields = ['created_at', 'updated_at']
