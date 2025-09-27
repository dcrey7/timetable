import http.server
import socketserver
import webbrowser
import threading
import time
import os
import socket
import sys

def kill_port(port):
    """Kill any process using the specified port"""
    try:
        import subprocess
        subprocess.run(['fuser', '-k', f'{port}/tcp'],
                      capture_output=True, check=False)
    except:
        pass

def find_available_port(start_port=8000):
    """Find an available port starting from start_port"""
    port = start_port
    while port < start_port + 10:  # Try 10 ports
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            port += 1
    return None

def start_server():
    global browser_port
    PORT = 8000
    Handler = http.server.SimpleHTTPRequestHandler

    # Try to kill any existing process on the port
    kill_port(PORT)

    # Wait a moment for the port to be released
    time.sleep(1)

    # Find an available port
    available_port = find_available_port(PORT)
    if available_port is None:
        print("Error: Could not find an available port")
        sys.exit(1)

    if available_port != PORT:
        print(f"Port {PORT} is busy, using port {available_port} instead")
        PORT = available_port

    # Update the browser port
    browser_port = PORT

    class ReuseTCPServer(socketserver.TCPServer):
        allow_reuse_address = True

    try:
        with ReuseTCPServer(("", PORT), Handler) as httpd:
            print(f"Timetable app running at http://localhost:{PORT}")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"Port {PORT} is still in use. Trying to find another port...")
            alternative_port = find_available_port(PORT + 1)
            if alternative_port:
                print(f"Using port {alternative_port} instead")
                browser_port = alternative_port
                with ReuseTCPServer(("", alternative_port), Handler) as httpd:
                    print(f"Timetable app running at http://localhost:{alternative_port}")
                    print("Press Ctrl+C to stop the server")
                    httpd.serve_forever()
            else:
                print("Could not find any available port")
                sys.exit(1)
        else:
            raise

browser_port = 8000  # Global variable to track the port

def open_browser():
    time.sleep(2)  # Wait for server to start and port to be determined
    webbrowser.open(f'http://localhost:{browser_port}')

def main():
    # Check if we're in the right directory
    if not os.path.exists('index.html'):
        print("Error: index.html not found. Make sure you're running this from the timetable directory.")
        return

    # Start browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()

    # Start the server
    try:
        start_server()
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    main()
