document.addEventListener('DOMContentLoaded', () => {
    getChannelList()
    document.querySelector('#updateName').onclick = updateName;
    document.querySelector("#newChannelForm").onsubmit = getChannelList;

    if (!localStorage.getItem('displayName')){
        localStorage.setItem('displayName', prompt("give us a name"));
    };
    document.getElementById("nameTag").innerHTML = `Chatting as: ${localStorage.displayName}`;
    
});

function getChannelList(){
    const request = new XMLHttpRequest();
    const newChannel = document.querySelector("#newChannelName").value;

    request.open('POST', '/get_channel')

    //callback
    request.onload = () => {
        const channelsList = JSON.parse(request.responseText);
        console.log(channelsList.channels);

        document.querySelector("#channelList").querySelectorAll("*").forEach(n=>n.remove());
        
        for (i in channelsList.channels){
            const opt = document.createElement('option');
            opt.value = i;
            opt.innerHTML = channelsList.channels[i];
            document.querySelector("#channelList").append(opt);
        };
    };

    //send new channel
    const data = new FormData();
    data.append('newChannel', newChannel);
    request.send(data);
    return false;
};

function updateName(){
    
    localStorage.displayName = document.querySelector("#displayName").value;
    document.getElementById("nameTag").innerHTML = `Chatting as: ${localStorage.displayName}`;
    
};