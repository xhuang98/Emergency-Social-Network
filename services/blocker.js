import PublicMessageTest from "../models/public_message/public_message_double.js";
import socketService from "../services/sockets.js";

class Blocker {
  constructor () {
    this.blocked = false;
  }

  blockWebsite (duration) {
    this.blocked = true;
    setTimeout(() => this.unblockWebsite(), duration);
    socketService.emitMessageToClients("website_block", { block: true });
  }

  unblockWebsite () {
    PublicMessageTest.deleteMany({}, () => {
      // everything removed.
    });
    this.blocked = false;
    socketService.emitMessageToClients("website_block", { block: false });
  }

  isBlocked () {
    return this.blocked;
  }
}
const blocker = new Blocker();

function blockedMiddleware (req, res, next) {
  if (req.query.admin) {
    return next();
  }
  if (blocker.isBlocked()) {
    return res.status(401).json({ blocked: true });
  }
  next();
}

export default { blocker, blockedMiddleware };
