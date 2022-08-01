import subprocess
from multiprocessing import Process
import webbrowser

def start_client():
    subprocess.run(["npm", "run", "dev"], cwd="frontend")
    webbrowser.open("http://127.0.0.1:5173/")

def start_server():
    subprocess.run(["npm", "start"], cwd="backend")
   
def main():
    server = Process(target=start_server)
    client = Process(target=start_client)
    server.start()
    client.start()
    server.join()
    client.join()

if __name__ == "__main__":
    main()
