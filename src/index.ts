import { config as initEnv } from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
initEnv();
const server = createServer();
export const io = new Server(server, { cors: { allowedHeaders: '*' } });

import './socket';

server.listen(3005, () => console.log('Listening on port 3005'));
