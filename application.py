import os
from datetime import datetime

from flask import Flask, session, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

#max number of messages in a given channel
MAX_LENGTH = 100

#initial channel
channels = {"home": ([],{datetime.now().strftime("%a, %H:%M:%S"): ["serverBot", "Server started. Home channel innitialized. WELCOME!"]})}
#test channel
channels["longChannel"] = ([],{datetime.now().strftime("%a, %H:%M:%S"): ["serverBot", "Channel has been created"]})
for i in range(99):
    channels["longChannel"][1][datetime.now().strftime("%a, %H:%M:%S "+ str(i))] = ["serverBot", f"This is msg number {str(i)}"]

currentChannel = "home"

#landing page
@app.route("/")
def index():
    return render_template("index.html", channels=channels, currentChannel=currentChannel)

#send list of channels to client
@app.route("/get_channel", methods=["POST"])
def get_channel():
    return jsonify([*channels])

#create a new channel and send the updated channel list to client
@app.route("/create_channel", methods=["POST"])
def create_channel():
    channelName = request.form['newChannel']
    print(channelName)
    #check if it already exists and return an error if it does
    if channelName in channels:
        return jsonify({"error": "Channel already exists. Try again."})
    #check if not blank
    elif channelName:
        #add the channel and inform connected clients
        channels[channelName] = ([],{datetime.now().strftime("%a, %H:%M:%S"): ["serverBot", "Channel has been created"]})
        socketio.emit('new channel created')
    #return the updated list of channels
    return jsonify([*channels])

#return messages to the client when they join a channel
@app.route("/get_chat", methods=["Post"])
def get_chat():
    #get data from the form
    channelName = request.form['channelName']
    newMember = request.form['member']
    leavingChannel = request.form['leavingChannel']
    leavingMembers = []

    #check for missing info
    if leavingChannel and newMember:
        try:
            channels[leavingChannel][0].remove(newMember)
            leavingMembers = channels[leavingChannel][0]
        except:
            print(f"FAILED TO REMOVE {newMember} from {leavingChannel}.")
            #return {"error":"Data incomplete"}

    #add the newMember to the channel if they aren't already
    if newMember not in channels[channelName][0]:
        channels[channelName][0].append(newMember)

    #unpack the channel
    members, messages = channels[channelName]
    
    #send to clients to update the members currently in their channel
    socketio.emit('members update', {"channel":channelName, "members":members, "previousChannel": leavingChannel, "previousMembers": leavingMembers})
    #return the messages
    return jsonify(messages)

#when any user enters a msg
@socketio.on("chat sent")
def chatSent(data):
    #prepare the data
    newMsg = data['msg']
    channel = data['currentChannel']
    user = data['user']
    timestamp = datetime.now().strftime("%a, %H:%M:%S")

    #check for MAX_LENGTH and remove oldest message if exceeded
    if len(channels[channel][1]) >= MAX_LENGTH:
        msgKey = next(iter(channels[channel][1]))
        del channels[channel][1][msgKey]

    #add the new msg
    channels[channel][1][timestamp] = [user, newMsg]
    #server terminal output to check max length isn't being exceeded
    print("\n Number of messages in " + channel +" is currently " + str(len(channels[channel][1])) + "\n")
    #send the new message out to clients to add if they are in that channel
    emit("incoming msg", {channel: {timestamp: [user, newMsg]}}, broadcast=True)