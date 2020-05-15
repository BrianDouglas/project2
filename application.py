import os

from flask import Flask, session, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = ["home"]
currentChannel = 0

@app.route("/")
def index():
    return render_template("index.html", channels=channels, currentChannel=currentChannel)

@app.route("/get_channel", methods=["POST"])
def get_channel():
    channelName = request.form['newChannel']
    print(channelName)
    if channelName:
        channels.append(channelName)
    return jsonify({"channels":channels})