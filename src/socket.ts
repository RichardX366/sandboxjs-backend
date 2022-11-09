import { io } from '.';

type Users = {
  [id: string]: {
    name: string;
    code: string;
  };
};

const users: Users = {};

const sendUsers = () => {
  io.to('admin').emit(
    'users',
    Object.entries(users).map(([id, user]) => ({ id, ...user })),
  );
};

io.on('connection', async (socket) => {
  socket.join('global');
  const user = {
    name: socket.handshake.auth.name,
    code: socket.handshake.auth.code,
  };
  if (user.name === process.env.PASSWORD) await socket.join('admin');
  users[socket.id] = user;
  sendUsers();

  socket.on('code', ({ id, code }) => {
    try {
      users[id].code = code;
      sendUsers();
      if (id !== socket.id && code !== users[id].code) {
        socket.to(id).emit('code', code);
      }
    } catch {}
  });

  socket.on('name', ({ name, id }) => {
    try {
      users[id].name = name;
      if (name === process.env.PASSWORD) {
        socket.join('admin');
        socket.emit('becomeAdmin');
      } else {
        socket.leave('admin');
        socket.emit('removeAdmin');
      }
      sendUsers();
    } catch {}
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    sendUsers();
  });
});
