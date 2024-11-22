import json
from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS


app = Flask(__name__, static_folder='build')
CORS(app)


@app.route('/getImage', methods=['GET'])
def getImage():
    print("got image")
    return jsonify('https://static.scientificamerican.com/sciam/cache/file/2AE14CDD-1265-470C-9B15F49024186C10_source.jpg?w=1200'), 200

# Serve the React app's index.html
@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

# Serve other static files (JS, CSS, etc.)
@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)