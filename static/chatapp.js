//init socket
var socket = io()
var scrolled = false;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#newChannelForm").onsubmit = createChannel;
    document.querySelector("#channelList").onchange = loadChat;
    document.querySelector('#msgBox').onscroll = () => {
        //sets the scrolled boolean to false if we are at the bottom of the div. True otherwise.
        box = document.getElementById('msgBox');
        scrolled = box.scrollTop + box.offsetHeight <= box.scrollHeight - 1;;
    };
    document.getElementById("msgToSend").onkeyup = () => {
        //allows us to use the enter key to send msgs
        if (event.keyCode == 13){
            document.getElementById('chatSend').click();
        };
    };

    //SOCKETS
    socket.on('connect', () => {
        document.querySelector('#chatSend').onclick = sendChat;
    });

    socket.on('incoming msg', data => {
        //checks if we're in the channel that a new msg was added to. Adds it if true.
        const thisChannel = localStorage.getItem("currentChannel");
        if ( thisChannel in data){
            addToChat(data[thisChannel]);
        };
    });

    socket.on('new channel created', () =>{
        getChannelList();
    });

    socket.on('members update', data => {
        //checks to see if the person who moved channels requires the client to update their own channel member list
        if (localStorage.getItem("currentChannel") == data.channel){
            repopMemberList(data.members);
        }else if(localStorage.getItem("currentChannel") == data.previousChannel){
            repopMemberList(data.previousMembers)
        };
    });

    //if the user is new, get a display name from them.
    if (!localStorage.getItem('displayName')){
        localStorage.setItem('displayName', prompt("give us a name"));
    };
    //same for the channel. default to home
    if (!localStorage.getItem('currentChannel')){
        localStorage.setItem('currentChannel', "home");
    }
    document.getElementById("nameTag").innerHTML = `Chatting as: ${localStorage.displayName}`;
    loadChat();
});

window.onload = getChannelList;

function getChannelList(){
    const request = new XMLHttpRequest();

    request.open('POST', '/get_channel')

    //callback
    request.onload = () => {
        //clear input box
        const channelsList = JSON.parse(request.responseText);

        repopChannelList(channelsList);
        //ensure currentChannel is still set correctly
        document.getElementById('channelList').value = localStorage.getItem('currentChannel');

    };

    //send request for list of channels
    request.send();
    return false;
};

function createChannel(){
    const request = new XMLHttpRequest();
    const newChannel = document.querySelector("#newChannelName").value;

    request.open('POST', '/create_channel')

    //callback
    request.onload = () => {
        //clear input box
        document.getElementById('newChannelName').value = "";
        const channelsList = JSON.parse(request.responseText);
        //check if the server returned an error
        if ("error" in channelsList){
            var oldMsg = document.getElementById('channelCreationError')
            var replaceMsg = oldMsg.cloneNode(true);
            replaceMsg.innerHTML = channelsList["error"];
            oldMsg.parentNode.replaceChild(replaceMsg, oldMsg)
            return;
        };
        //clear error if success
        document.getElementById('channelCreationError').innerHTML = "";
        
        repopChannelList(channelsList);

        //set newchannel to active
        document.getElementById('channelList').value = newChannel;
        //load chat channel contents from app
        loadChat();
    };

    //data to send to server
    const data = new FormData();
    data.append('newChannel', newChannel);
    request.send(data);
    return false;
};

function repopChannelList(channelsList){
    document.querySelector("#channelList").querySelectorAll("*").forEach(n=>n.remove());
        
    for (i in channelsList){
        const opt = document.createElement('option');
        opt.value = channelsList[i];
        opt.innerHTML = channelsList[i];
        document.querySelector("#channelList").append(opt);
    };
    return
};

function repopMemberList(members){
    document.getElementById('chatMembers').querySelectorAll("*").forEach(n=>n.remove());

    for (i in members){
        const item = document.createElement('li');
        item.innerHTML = members[i];
        document.getElementById('chatMembers').append(item);
    };
    return
}

function loadChat(){

    var channelName = document.getElementById('channelList').value;
    const leavingChannel = localStorage.getItem('currentChannel');
    if (!channelName){channelName = localStorage.getItem('currentChannel')};
    localStorage.setItem("currentChannel", channelName);
    document.getElementById('channelTag').innerHTML = `Channel: ${channelName}`;
    
    const request = new XMLHttpRequest();
    request.open("POST", "/get_chat");

    request.onload = () =>{
        const chatLog = JSON.parse(request.responseText);
        //check if server returned an error. Log it.
        if (chatLog.error){
            console.log(chatLog.error);
            return
        }
        //clear msgs from previous channel
        document.querySelector("#msgBox").querySelectorAll("*").forEach(n=>n.remove());
        addToChat(chatLog);
    };
    //data to send to server
    const data = new FormData();
    data.append('channelName', channelName);
    data.append('leavingChannel', leavingChannel)
    data.append('member', localStorage.getItem('displayName'))
    request.send(data);
    return false;
};

function addToChat(chatLog){
    for (msg in chatLog){
        const chatBox = document.createElement('div');
        //style new chatbox differently if it's from the current user
        if (chatLog[msg][0] == localStorage.displayName){
            chatBox.className = "mymsg";
        }else{
            chatBox.className = "chatmsg";
        };
        //add info to the msg
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
    updateScroll();
}

function sendChat(){
    const msg = document.getElementById('msgToSend').value;
    document.getElementById('msgToSend').value = "";
    socket.emit('chat sent', {'user': localStorage.getItem('displayName'), 'currentChannel': localStorage.getItem('currentChannel'), 'msg': msg})
}

function updateScroll(){
    //if we are not scrolled up, reset the scroll to the new bottom of the box
    const box = document.getElementById('msgBox');
    if (!scrolled){
        box.scrollTop = box.scrollHeight;
    };
}
