//init socket
var socket = io()
var scrolled = false;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#newChannelForm").onsubmit = createChannel;
    document.querySelector("#channelList").onchange = loadChat;
    document.querySelector('#msgBox').onscroll = () => {
        box = document.getElementById('msgBox');
        scrolled = box.scrollTop + box.offsetHeight <= box.scrollHeight - 1;;
    };
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

    socket.on('new channel created', () =>{
        getChannelList();
    });

    socket.on('members update', data => {
        if (localStorage.getItem("currentChannel") == data.channel){
            repopMemberList(data.members);
        }else if(localStorage.getItem("currentChannel") == data.previousChannel){
            repopMemberList(data.previousMembers)
        };
    });

    if (!localStorage.getItem('displayName')){
        localStorage.setItem('displayName', prompt("give us a name"));
    };
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
        //ensure currentChannel is still set
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
            if ("error" in channelsList){
                document.getElementById('channelCreationError').innerHTML = channelsList["error"];
                return;
            };
        
        repopChannelList(channelsList);

        //set newchannel to active
        document.getElementById('channelList').value = newChannel;
        //load chat channel contents from app
        loadChat();
    };

    //send new channel
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
<<<<<<< HEAD
    //if one wasn't selected(as on initial page load) get it from local storage
    if (!channelName){channelName = localStorage.getItem('currentChannel')};
=======
    //if (!channelName){channelName = localStorage.getItem('currentChannel')};
>>>>>>> parent of f218f49... house keeping for project turn in
    localStorage.setItem("currentChannel", channelName);
    document.getElementById('channelTag').innerHTML = `Channel: ${channelName}`;
    
    const request = new XMLHttpRequest();
    request.open("POST", "/get_chat");

    request.onload = () =>{
        const chatLog = JSON.parse(request.responseText);
        if (chatLog.error){
            console.log(chatLog.error);
            return
        }
        document.querySelector("#msgBox").querySelectorAll("*").forEach(n=>n.remove());
        addToChat(chatLog);
    };
    
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
    updateScroll();
}

function sendChat(){
    const msg = document.getElementById('msgToSend').value;
    document.getElementById('msgToSend').value = "";
    socket.emit('chat sent', {'user': localStorage.getItem('displayName'), 'currentChannel': localStorage.getItem('currentChannel'), 'msg': msg})
}

function updateScroll(){
    const box = document.getElementById('msgBox');
    if (!scrolled){
        box.scrollTop = box.scrollHeight;
    };
}

//this function isn't currently being used
function updateName(){
    
    localStorage.displayName = document.querySelector("#displayName").value;
    document.getElementById("nameTag").innerHTML = `Chatting as: ${localStorage.displayName}`;
    
};