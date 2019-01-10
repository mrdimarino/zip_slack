'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#slackApp');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('.message-box');
var messageInput = document.querySelector('#message-input');
var messageArea = document.querySelector('#messageDisplay');
var connectingElement = document.querySelector('.connecting');
var memberlist = document.querySelector('#members')

var stompClient = null;
var username = null;


function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {
    stompClient.subscribe('/topic/public', onMessageReceived);
    stompClient.subscribe('/topic/public', addMemberToList);
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');


}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type == 'CHAT') {
        messageElement.classList.add('chat-message');


        var usernameText = document.createTextNode(message.sender + ': ');
        messageElement.appendChild(usernameText);


        var messageText = document.createTextNode(message.content);
        messageElement.appendChild(messageText);

        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }
}

function addMemberToList(payload){
    var messageSender = JSON.parse(payload.body);

    if(messageSender.type == 'JOIN'){
        var memberListText = document.createElement('li');
        var memberName = document.createTextNode(messageSender.sender);
        memberListText.appendChild(memberName);
        memberlist.appendChild(memberListText);

    }
}



usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
