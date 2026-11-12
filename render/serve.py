"""Tiny local HTTP server for the studio root (pages use fetch(), which file:// URLs do not allow)."""
import threading, functools, http.server, socketserver, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
class _Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
def start(root=ROOT):
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(_Q, directory=root)); srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return f'http://127.0.0.1:{srv.server_address[1]}/'
