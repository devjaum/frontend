import { io } from 'socket.io-client';

const socket = io('https://backend-04cn.onrender.com/'); // endereço do backend

export default socket;
