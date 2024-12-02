import json
import time
from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from dictionaryGlobal import dictionaryforEverything
from HandTracking.handTracking import main
import threading
import requests
from requests_oauthlib import OAuth1

auth = OAuth1("f5f392152e0e426fb0f48abf4a5303da", "ed08930afdd346c68cb5761162002b1f")


thread1 = threading.Thread(target=main, daemon = True)
thread1.start()
data_lock = threading.Lock()

app = Flask(__name__, static_folder='build')
CORS(app)


@app.route('/getImage', methods=['GET'])
def get_image():
    # Get the query parameter
    query = request.args.get('query', 'shark')  # Default query is 'shark' if not provided
    limit = request.args.get('limit', 1)  # Default limit is 1 if not provided
    
    # Define the endpoint
    endpoint = f"https://api.thenounproject.com/v2/icon?query={query}&limit={limit}"
    
    # Make the API request
    response = requests.get(endpoint, auth=auth)
    
    if response.status_code == 200:
        data = response.json()
        # Check if icons are present in the response
        if 'icons' in data and len(data['icons']) > 0:
            # Return the thumbnail URL of the first icon
            thumbnail_url = data['icons'][0].get("thumbnail_url")
            if thumbnail_url:
                return jsonify(thumbnail_url), 200
            else:
                return jsonify({"error": "Thumbnail URL not found"}), 404
        else:
            return jsonify({"error": "No icons found for the query"}), 404
    else:
        return jsonify({"error": "Failed to fetch icons", "details": response.text}), response.status_code


@app.route('/getCoords', methods=['GET'])
def getCoord():
    # with data_lock:
    dictionaryforEverything = {}
    try:
        with open('dictionaryGlobal.json', 'r') as f:
            dictionaryforEverything = json.load(f)
    except FileNotFoundError:
        print("File 'dictionaryGlobal.json' not found")
        return jsonify({"error": "File Not Found"}), 404

    print("got Coords", dictionaryforEverything)
    return jsonify(dictionaryforEverything), 200

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