import os

from flask import Flask, session, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {"home": {"12:00:00":["rick","msg"], "1:00:00":["Brian","antoher msg"], "2:00:00":["Brian","more messge"]}}
currentChannel = "home"

@app.route("/")
def index():
    return render_template("index.html", channels=channels, currentChannel=currentChannel)

@app.route("/get_channel", methods=["POST"])
def get_channel():
    channelName = request.form['newChannel']
    print(channelName)
    if channelName:
        channels[channelName] = {}
    return jsonify([*channels]) #*channels returns the iterables of the dictionary. Brackets for as a list

@app.route("/get_chat", methods=["Post"])
def get_chat():
    channelName = request.form['channelName']
    messages = channels[channelName]
    return jsonify(messages)