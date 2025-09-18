import subprocess
import shlex
import os

class Shell:
    def __init__(self):
        self.history = []
        self.current_dir = "/"

    def execute_command(self, command):
        """
        Execute a shell command and return the output.
        """
        try:
            # Use shlex to split the command safely
            args = shlex.split(command)
            if not args:
                return ""
            # Run the command
            result = subprocess.run(args, capture_output=True, text=True, cwd=self.current_dir)
            output = result.stdout
            error = result.stderr
            if error:
                output += f"\nError: {error}"
            self.history.append(command)
            return output.strip()
        except Exception as e:
            return f"Error executing command: {str(e)}"

    def change_directory(self, path):
        """
        Change the current directory.
        """
        try:
            if path.startswith("/"):
                self.current_dir = path
            else:
                self.current_dir = os.path.join(self.current_dir, path)
            self.current_dir = os.path.abspath(self.current_dir)
            return f"Changed directory to {self.current_dir}"
        except Exception as e:
            return f"Error changing directory: {str(e)}"

    def get_history(self):
        """
        Get command history.
        """
        return "\n".join(self.history)

# Instantiate the shell
shell = Shell()
