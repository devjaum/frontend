import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // endereço do backend

export default socket;
