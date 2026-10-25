import { io, Socket } from 'socket.io-client';
import authAxios from 'src/modules/shared/axios/authAxios';

let socket: Socket | null = null;

function getSocketUrl() {
  const baseURL = (authAxios.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return baseURL || undefined; // "" -> connect to the page's own origin
}

export function getSocket(userId: string, isAdmin: boolean = false): Socket | null {
  if (!userId) return null;

  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit('register', { userId, isAdmin });

  return socket;
}
