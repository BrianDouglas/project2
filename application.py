import os
from datetime import datetime

from flask import Flask, session, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {"home": ([],{datetime.now().strftime("%a, %H:%M:%S"): ["serverBot", "Server started. Home channel innitialized. WELCOME!"]})}
currentChannel = "home"

@app.route("/")
def index():
    return render_template("index.html", channels=channels, currentChannel=currentChannel)

@app.route("/get_channel", methods=["POST"])
def get_channel():
    return jsonify([*channels])

@app.route("/create_channel", methods=["POST"])
def create_channel():
    channelName = request.form['newChannel']
    print(channelName)
    if channelName in channels:
        return jsonify({"error": "Channel already exists. Try again."})
    elif channelName:
        channels[channelName] = ([],{datetime.now().strftime("%a, %H:%M:%S"): ["serverBot", "Channel has been created"]})
        socketio.emit('new channel created')
    return jsonify([*channels]) #*channels returns the iterables of the dictionary. Brackets for as a list

@app.route("/get_chat", methods=["Post"])
def get_chat():
    channelName = request.form['channelName']
    newMember = request.form['member']
    leavingChannel = request.form['leavingChannel']
    leavingMembers = []
    if leavingChannel and newMember:
        try:
            channels[leavingChannel][0].remove(newMember)
            leavingMembers = channels[leavingChannel][0]
        except:
            print(f"FAILED TO REMOVE {newMember} from {leavingChannel}.")
            return {"error":"Data incomplete"}
    if newMember not in channels[channelName][0]:
        channels[channelName][0].append(newMember)
    members, messages = channels[channelName]
    socketio.emit('members update', {"channel":channelName, "members":members, "previousChannel": leavingChannel, "previousMembers": leavingMembers})
    return jsonify(messages)

@socketio.on("chat sent")
def chatSent(data):
    newMsg = data['msg']
    channel = data['currentChannel']
    user = data['user']
    timestamp = datetime.now().strftime("%a, %H:%M:%S")
    channels[channel][1][timestamp] = [user, newMsg]
    emit("incoming msg", {channel: {timestamp: [user, newMsg]}}, broadcast=True)