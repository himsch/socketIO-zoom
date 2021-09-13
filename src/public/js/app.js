const socket = io();

const welcome = document.querySelector('#welcome');
const form = welcome.querySelector('form');

const room = document.querySelector('#room');

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.textContent = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  socket.emit('new_message', input.value, roomName, msg => {
    addMessage(`You: ${msg}`);
  });
  input.value = '';
}

function handleNameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#name input');
  socket.emit('nickname', input.value, roomName);
  input.value = '';
}

function showRoom() {
  room.hidden = false;
  welcome.hidden = true;
  const h3 = room.querySelector('h3');
  h3.textContent = `Room: ${roomName}`;
  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', handleMessageSubmit);
  nameForm.addEventListener('submit', handleNameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector('input');
  socket.emit('room', input.value, showRoom);
  roomName = input.value;
  input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user, newCount) => {
  const h3 = room.querySelector('h3');
  h3.textContent = `Room: ${roomName} (${newCount})`;
  addMessage(`${user} arrived!!`);
});

socket.on('bye', (left, newCount) => {
  const h3 = room.querySelector('h3');
  h3.textContent = `Room: ${roomName} (${newCount})`;
  addMessage(`${left} left :(`);
});

socket.on('new_message', addMessage);

socket.on('room_change', rooms => {
  const roomsList = welcome.querySelector('ul');
  roomsList.textContent = '';
  if (rooms.length === 0) return;
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.textContent = room;
    roomsList.appendChild(li);
  });
});
