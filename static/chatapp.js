//init socket
var socket = io()

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#newChannelForm").onsubmit = getChannelList;
    document.querySelector("#channelList").onchange = loadChat;
    document.querySelector("#channelList").onclick = getChannelList;
    document.getElementById("msgToSend").onkeyup = () => {
        if (event.keyCode == 13){
            document.getElementById('chatSend').click();
        };
    };

    //configure send button
    socket.on('connect', () => {
        document.querySelector('#chatSend').onclick = sendChat;
    });

    socket.on('incoming msg', data => {
        const thisChannel = localStorage.getItem("currentChannel");
        if ( thisChannel in data){
            addToChat(data[thisChannel]);
        };
    });

    if (!localStorage.getItem('displayName')){
        localStorage.setItem('displayName', prompt("give us a name"));
    };
    if (!localStorage.getItem('currentChannel')){
        localStorage.setItem('currentChannel', "home")
    }
    document.getElementById("nameTag").innerHTML = `Chatting as: ${localStorage.displayName}`;
});

window.onload = getChannelList;

function getChannelList(){
    const request = new XMLHttpRequest();
    const newChannel = document.querySelector("#newChannelName").value;

    request.open('POST', '/get_channel')

    //callback
    request.onload = () => {
        //clear input box
        document.getElementById('newChannelName').value = "";
        const channelsList = JSON.parse(request.responseText);
            if ("error" in channelsList){
                document.getElementById('channelCreationError').innerHTML = channelsList["error"];
                return;
            };
        document.querySelector("#channelList").querySelectorAll("*").forEach(n=>n.remove());
        
        for (i in channelsList){
            const opt = document.createElement('option');
            opt.value = channelsList[i];
            opt.innerHTML = channelsList[i];
            document.querySelector("#channelList").append(opt);
        };
        //default to home or set newchannel to active
        if (newChannel == ""){
            document.getElementById('channelList').value = localStorage.getItem('currentChannel');
        }else{
            document.getElementById('channelList').value = newChannel;
        }
        //load chat channel contents from app
        loadChat();
    };

    //send new channel
    const data = new FormData();
    data.append('newChannel', newChannel);
    request.send(data);
    return false;
};

function loadChat(){
    const channelName = document.getElementById('channelList').value;
    localStorage.setItem("currentChannel", channelName);
    document.getElementById('channelTag').innerHTML = `Channel: ${channelName}`;
    
    const request = new XMLHttpRequest();
    request.open("POST", "/get_chat");

    request.onload = () =>{
        const chatLog = JSON.parse(request.responseText);
        document.querySelector("#msgBox").querySelectorAll("*").forEach(n=>n.remove());
        addToChat(chatLog);
    };
    
    const data = new FormData();
    data.append('channelName', channelName);
    request.send(data);
    return false;
};

function addToChat(chatLog){
    for (msg in chatLog){
        const chatBox = document.createElement('div');
        if (chatLog[msg][0] == localStorage.displayName){
            chatBox.className = "mymsg";
        }else{
            chatBox.className = "chatmsg";
        };
        const timestamp = document.createElement('span');
        const text = document.createElement("p");
        timestamp.className = "timestamp";
        text.className = "chatText";
        timestamp.innerHTML = `(${msg}) ${chatLog[msg][0]}: `;
        text.innerHTML = `${chatLog[msg][1]}`;
        chatBox.appendChild(timestamp);
        chatBox.appendChild(text);
        document.getElementById("msgBox").append(chatBox);
    };
}

function sendChat(){
    const msg = document.getElementById('msgToSend').value;
    document.getElementById('msgToSend').value = "";
    socket.emit('chat sent', {'user': localStorage.getItem('displayName'), 'currentChannel': localStorage.getItem('currentChannel'), 'msg': msg})
}

//this function isn't currently being used
function updateName(){
    
    localStorage.displayName = document.querySelector("#displayName").value;
    document.getElementById("nameTag").innerHTML = `Chatting as: ${localStorage.displayName}`;
    
};