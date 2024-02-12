// src/utils/socket.js
import io from 'socket.io-client';

// Assuming your server is running on localhost:4000
const SERVER_URL = 'http://localhost:4000';

const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

export default socket;
