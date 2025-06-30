import subprocess
import sys
from pathlib import Path

def start_servers():
    # Get project root path
    root_dir = Path(__file__).parent
    
    try:
        # Start Flask backend
        flask_cmd = f"{root_dir}\\backend\\venv\\Scripts\\python.exe {root_dir}\\backend\\run.py"
        flask_process = subprocess.Popen(flask_cmd, shell=True)
        
        # Start React frontend
        react_cmd = "npm start"
        react_process = subprocess.Popen(react_cmd, shell=True, cwd=f"{root_dir}\\frontend")
        
        # Keep the script running
        flask_process.wait()
        react_process.wait()
        
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        flask_process.terminate()
        react_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    start_servers()