from flask import Flask, render_template, jsonify, request
import socket
from http.server import HTTPServer, CGIHTTPRequestHandler
import os

app = Flask(__name__, static_folder='public/')
server_object = HTTPServer(server_address=('', 8000), RequestHandlerClass=CGIHTTPRequestHandler)

@app.route('/')
def serve():
  return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
  if request.method == 'POST':
    filename = request.files['files'].filename
    
    if filename == '':
      return jsonify('err')
    if request.files['files']: 
      request.files['files'].save(os.getcwd() + '/' + filename)
      return jsonify('ok')

@app.route('/getIP')
def getIP():
  hostname = socket.gethostname()
  local_ip = socket.gethostbyname(hostname)

  return jsonify(local_ip)

@app.route('/start')
def run():
  server_object.serve_forever()
  return jsonify('started')

@app.route('/stop')
def stop():
  server_object.shutdown()
  return jsonify('stopped')

if __name__ == "__main__":
  app.run('127.0.0.1', port=5000, debug=True)