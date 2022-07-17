import subprocess
import webbrowser

def start_server():
    subprocess.run(["npm", "start"], cwd="backend")
    subprocess.run(["npm", "run", "dev"], cwd="frontend")
    webbrowser.open("http://127.0.0.1:5173/")
    
if __name__ == "__main__":
    start_server()
