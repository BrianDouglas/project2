import os
from datetime import datetime

from flask import Flask, session, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {"home": {datetime.now().strftime("%a, %H:%M:%S"): ["serverBot", "Server started. Home channel innitialized. WELCOME!"]}}
currentChannel = "home"

@app.route("/")
def index():
    return render_template("index.html", channels=channels, currentChannel=currentChannel)

@app.route("/get_channel", methods=["POST"])
def get_channel():
    channelName = request.form['newChannel']
    print(channelName)
    if channelName in channels:
        return jsonify({"error": "Channel already exists. Try again."})
    elif channelName:
        channels[channelName] = {datetime.now().strftime("%a, %H:%M:%S"): ["serverBot", "Channel has been created"]}
    return jsonify([*channels]) #*channels returns the iterables of the dictionary. Brackets for as a list

@app.route("/get_chat", methods=["Post"])
def get_chat():
    channelName = request.form['channelName']
    messages = channels[channelName]
    return jsonify(messages)

@socketio.on("chat sent")
def chatSent(data):
    newMsg = data['msg']
    channel = data['currentChannel']
    user = data['user']
    timestamp = datetime.now().strftime("%a, %H:%M:%S")
    channels[channel][timestamp] = [user, newMsg]
    emit("incoming msg", {channel: {timestamp: [user, newMsg]}}, broadcast=True)