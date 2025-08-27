import { io, Socket } from "socket.io-client";

import { getWebsocketUrl } from "./config";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getWebsocketUrl(), {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}
