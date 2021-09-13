import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { rooms, sids },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on('connection', socket => {
  socket['nickname'] = 'Anon';
  socket.onAny(event => {
    // console.log(io.sockets.adapter);
  });
  socket.on('room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    io.sockets.emit('room_change', publicRooms());
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach(room =>
      socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on('disconnect', () => {
    io.sockets.emit('room_change', publicRooms());
  });
  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done(msg);
  });
  socket.on('nickname', nickname => (socket['nickname'] = nickname));
});

/*
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on('connection', socket => {
  sockets.push(socket);
  socket['nickname'] = 'Anon';
  console.log('Connected to Brower ✅');
  socket.on('close', () => console.log('Disconnected from the Brower ❌'));
  socket.on('message', msg => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case 'new_message':
        sockets.forEach(aSocket =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
        break;
      case 'nickname':
        socket['nickname'] = message.payload;
        break;
    }
  });
});
*/

httpServer.listen(3000, handleListen);
