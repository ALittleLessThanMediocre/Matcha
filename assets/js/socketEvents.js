var socket = io();

var session = document.getElementById('session');
if(session !== null){
  session = session.textContent.toLowerCase() 
}

socket.on('connect', () => {
  var id = socket.id;

  socket.emit('userJoin', {id, session});
})

socket.on('notification', notif => {
  outputNotification(notif);
})

function outputNotification(notif){
  const div = document.createElement('div');
  div.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                    <span>${notif}</span >
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>`;
  document.querySelector('#notification').appendChild(div);
}