/* istanbul ignore file */
import { Server } from "socket.io";
import passport from "passport";
const wrapMiddlewareForSocketIo = middleware => (socket, next) => middleware(socket.request, {}, next);
export let io;
export function initializeIO (server) {
  io = new Server(server, {
    cors: true
  });
  io.use(wrapMiddlewareForSocketIo(passport.initialize()));
  io.use(wrapMiddlewareForSocketIo(passport.authenticate('jwt', { session: false })));

  io.on('connection', async (socket) => {
    const user = socket.request.user;
    await user.setActive(true);
    user.socket = socket;
    emitMessageToClients('user_connected', user.username);
    socket.on('disconnect', async (reason) => { // eslint-disable-line no-unused-vars
      await user.setActive(false);
      user.socket = null;
      emitMessageToClients('user_disconnected', user.username);
    });
  });
}

export function emitMessageToClients (topic, data) {
  if (!io) return;
  io.emit(topic, data);
}

export function sendMessageToClient (socket, topic, data) {
  if (!io) return;
  if (socket) {
    // console.log("+ sending message to client", topic, data);
    socket.emit(topic, data);
    return true;
  }
  // console.log("- not sending message to client", topic, data);
  return false;
}

export default { io, sendMessageToClient, emitMessageToClients };
