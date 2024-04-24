import socketService from "../services/sockets.js";

class Message {

  get socketService () {
    if (this._socketService) return this._socketService;
    return socketService;
  }

  // socket service injection.

  set socketService (socketService) {
    this._socketService = socketService;
  }

  static async save () {
    throw new Error("You must implement this method");
  }
}

export default Message;
