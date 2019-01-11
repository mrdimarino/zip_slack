//code should be executed in strict mode (makes bad syntax throw an error)
'use strict';

//setting local variables equal to corresponding html ids/classes
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
  //collects username from html id
    username = document.querySelector('#name').value.trim();

    if(username) {
      //hides username page and displays chatpage
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
      //creates STOMP client corresponding to the server's websocket endpoint
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
      //opens a connection using a websocket, runs onError and onConnected methods.
        stompClient.connect({}, onConnected, onError);
    }
    //if event is not handled, default action should be taken
    event.preventDefault();
}


function onConnected() {
  // subscribes to topic/public in order to recieve messages
    stompClient.subscribe('/topic/public', onMessageReceived);
  //subscribes to topic/public in order to add members to the memberlist
    stompClient.subscribe('/topic/public', addMemberToList);
    // sends username to the server
    //destination, header, string object (created by JSON.stringify method)
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
    //hides html connecting element
    connectingElement.classList.add('hidden');


}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

//called by eventlistener on messageform
function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    //creates chat message
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        //destination, header, string object (created by JSON.stringify method)
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    //if event is not handled, default action should be taken
    event.preventDefault();

}


function onMessageReceived(payload) {
  //parses JSON chat message
    var message = JSON.parse(payload.body);
  //creates <li> element to be appended to message display
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
  //parses the JSON message
    var messageSender = JSON.parse(payload.body);
//creates <li> element to be added to memberlist
    if(messageSender.type == 'JOIN'){
        var memberListText = document.createElement('li');
        var memberName = document.createTextNode(messageSender.sender);
        memberListText.appendChild(memberName);
        memberlist.appendChild(memberListText);

    }
}


/*called when message is submitted. Boolean indicates events of this type
will be dispatched to the registered listener before being dispatched */
usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
