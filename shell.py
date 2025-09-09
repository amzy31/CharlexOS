"""
Shell module for executing commands and managing directory.
Provides a simple shell interface with history.
"""

import subprocess
import shlex
import os

class Shell:
    """Simple shell emulator for command execution."""

    def __init__(self):
        self.history = []
        self.current_dir = "/"

    def execute_command(self, command):
        """
        Execute a shell command and return the output.

        Args:
            command (str): The command to execute.

        Returns:
            str: Command output or error message.
        """
        try:
            args = shlex.split(command)
            if not args:
                return "No command provided."
            result = subprocess.run(
                args,
                capture_output=True,
                text=True,
                cwd=self.current_dir,
                timeout=30  # Prevent hanging
            )
            output = result.stdout
            if result.stderr:
                output += f"\nError: {result.stderr}"
            self.history.append(command)
            return output.strip()
        except subprocess.TimeoutExpired:
            return "Command timed out."
        except Exception as e:
            return f"Error executing command: {str(e)}"

    def change_directory(self, path):
        """
        Change the current working directory.

        Args:
            path (str): Path to change to.

        Returns:
            str: Success or error message.
        """
        try:
            if path.startswith("/"):
                new_dir = path
            else:
                new_dir = os.path.join(self.current_dir, path)
            new_dir = os.path.abspath(new_dir)
            if os.path.isdir(new_dir):
                self.current_dir = new_dir
                return f"Changed directory to {self.current_dir}"
            else:
                return f"Directory does not exist: {new_dir}"
        except Exception as e:
            return f"Error changing directory: {str(e)}"

    def get_history(self):
        """
        Get the command history.

        Returns:
            str: Joined history lines.
        """
        return "\n".join(self.history)

# Global shell instance
shell = Shell()
