import { io, Socket } from "socket.io-client";
import config from "src/config";

let socket: Socket | null = null;
let registration: { userId: string; isAdmin: boolean } | null = null;

// The socket server runs on the API host, without the /api path.
// A relative backendUrl leaves "", so return undefined to make socket.io use the page's own origin.
function getSocketUrl() {
  return config.backendUrl.replace(/\/api\/?$/, "") || undefined;
}

export function getSocket(userId: string, isAdmin = false): Socket | null {
  if (!userId) return null;
  registration = { userId, isAdmin };

  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    // The server forgets which user a socket belongs to when it reconnects, so register on every connect.
    socket.on("connect", () => {
      if (registration) socket?.emit("register", registration);
    });
  } else if (socket.connected) {
    socket.emit("register", registration);
  } else {
    socket.connect();
  }

  return socket;
}

// Called on sign-out so the next user doesn't receive the previous user's messages.
export function closeSocket() {
  registration = null;
  socket?.disconnect();
  socket = null;
}
