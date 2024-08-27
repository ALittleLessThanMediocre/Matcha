const socket = io();

const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chatBox');
const sender1 = document.getElementById('sender1').textContent.toLowerCase();
const session = document.getElementById('sender1').textContent;
const receiver1 = document.getElementById('receiver1').textContent.toLowerCase();;

socket.on('connect', function() {
  
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.emit('joinRoom', {sender1, receiver1});

socket.on('message', message => {

  outputMessage(message);

  chatBox.scrollTop = chatBox.scrollHeight;
})

//Message submit
chatForm.addEventListener('submit', (e) => {

  e.preventDefault();

  const message = e.target.elements.message.value;
  const sender = e.target.elements.sender.value.toLowerCase();
  const receiver = e.target.elements.receiver.value.toLowerCase();

  if(message.length < 10000){

    socket.emit('chatMessage', {sender, receiver, message});

  }

  e.target.elements.message.value = '';
  e.target.elements.message.focus;

})

function sanitizeHTML(text) {

  var element = document.createElement('span');

  element.innerText = text;
  return element.innerHTML;
}

function outputMessage(message){

  let txt = sanitizeHTML(message.message);

  const div = document.createElement('div');

  div.classList.add("alert");
  div.classList.add("alert-secondary");
  div.innerHTML = `<p><strong>${message.sender}</strong> <small><span>${message.date}</span></small></p>
  <p >
    ${txt}
  </p>`;
  document.querySelector('#chatMessage').appendChild(div);
}