document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#newChannelForm").onsubmit = getChannelList;
    document.getElementById("channelList").onchange = loadChat;

    if (!localStorage.getItem('displayName')){
        localStorage.setItem('displayName', prompt("give us a name"));
    };
    document.getElementById("nameTag").innerHTML = `Chatting as: ${localStorage.displayName}`;
});

window.onload = getChannelList;

function getChannelList(){
    const request = new XMLHttpRequest();
    const newChannel = document.querySelector("#newChannelName").value;

    request.open('POST', '/get_channel')

    //callback
    request.onload = () => {
        const channelsList = JSON.parse(request.responseText);
        console.log(channelsList);

        document.querySelector("#channelList").querySelectorAll("*").forEach(n=>n.remove());
        
        for (i in channelsList){
            const opt = document.createElement('option');
            opt.value = channelsList[i];
            opt.innerHTML = channelsList[i];
            document.querySelector("#channelList").append(opt);
        };
        //default to home or set newchannel to active
        if (newChannel == ""){
            document.getElementById('channelList').value = "home";
        }else{
            document.getElementById('channelList').value = newChannel;
        }
        //clear text box and load chat channel contents from app
        document.getElementById('newChannelName').value = "";
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
    document.getElementById('channelTag').innerHTML = `Chatting in channel: ${channelName}`;
    
    const request = new XMLHttpRequest();
    request.open("POST", "/get_chat");

    request.onload = () =>{
        const chatLog = JSON.parse(request.responseText);
        document.querySelector("#msgBox").querySelectorAll("*").forEach(n=>n.remove());
        console.log(chatLog);
        for (msg in chatLog){
            const chatBox = document.createElement('div');
            if (chatLog[msg][0] == localStorage.displayName){
                chatBox.className = "mymsg";
            }else{
                chatBox.className = "chatmsg";
            };
            chatBox.innerHTML = `(${msg}) ${chatLog[msg][0]}: ${chatLog[msg][1]}`;
            document.getElementById("msgBox").append(chatBox);
        };
    };
    
    const data = new FormData();
    data.append('channelName', channelName);
    request.send(data);
    return false;
};

//this function isn't currently being used
function updateName(){
    
    localStorage.displayName = document.querySelector("#displayName").value;
    document.getElementById("nameTag").innerHTML = `Chatting as: ${localStorage.displayName}`;
    
};