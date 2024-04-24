
import mongoose, { Schema } from "mongoose";
import PrivateNotification from "./private_notification.js";
import Message from "./message.js";

class PrivateMessageClass extends Message {
  static async createMessage(user, text, destinationUser) {
    const status = user.status;
    const displayName = user.displayName;
    const timestamp = Date.now();
    return new this({
      originUser: user._id,
      displayName,
      destinationUser: destinationUser._id,
      timestamp,
      text,
      status
    });
  }

  async saveMessage() {
    await this.save();
    await this.emitNewPrivateMessage();
  }

  async emitNewPrivateMessage() {
    const message = await this.populate(["originUser", "destinationUser"]);
    
    this.socketService.sendMessageToClient(message.originUser.socket, 'private_message', message);
    this.socketService.sendMessageToClient(message.destinationUser.socket, 'private_message', message);
    await this.generatePrivateNotification(message.destinationUser, message.originUser);
  }

  async generatePrivateNotification(destinationUser, originUser) {
    // Emit new private notification only when the destinationUser is active
    if (destinationUser.active) {
      console.log(`===>> ${originUser.username} tried to send message to ${destinationUser.username}, they are online!`);
      await this.emitPrivateNotification(destinationUser.socket, originUser.username);
    } else {
      // destination user is currently offline, then we update unreadMessageCount (+1) for the user pair {originUsername, destinationUsername}
      console.log(`===>> ${originUser.username} tried to send message to ${destinationUser.username}, but ${destinationUser.username} is offline...`);
      await PrivateNotification.savePrivateNotification(originUser, destinationUser);
    }
  }

  async emitPrivateNotification(socket, originUsername) {
    this.socketService.sendMessageToClient(socket, 'notification_private', originUsername);
  }


  static async getLatestPrivateMessages(user, destination, amount = 10) {
    const originMessages = await this.find({
      $or: [{ originUser: destination._id, destinationUser: user._id },
        { originUser: user._id, destinationUser: destination._id }]
    })
      .sort('-timestamp').limit(amount).populate(["originUser", "destinationUser"]);
    return this.sortLatestPrivateMessages(originMessages);
  }

  static sortLatestPrivateMessages(originMessages) {
    originMessages.sort((a, b) => a.timestamp < b.timestamp ? -1 : (a.timestamp > b.timestamp) ? 1 : 0);
    return originMessages;
  }

  static async findByText(partialText, user, destination) {
    const privateMessages = await this.find(
      {
        $and:
                    [
                      {
                        $or: [{ originUser: destination._id, destinationUser: user._id },
                          { originUser: user._id, destinationUser: destination._id }]
                      },

                      { text: { $regex: partialText, $options: "i" } }
                    ]
      }).populate("originUser").populate("destinationUser");
    return this.sortLatestPrivateMessagesInDecreasingTimestamp(privateMessages);
  }

  static sortLatestPrivateMessagesInDecreasingTimestamp(originMessages) {
    originMessages.sort((a, b) => a.timestamp > b.timestamp ? -1 : (a.timestamp < b.timestamp) ? 1 : 0);
    return originMessages;
  }
}

const PrivateMessageSchema = Schema({
  originUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinationUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  text: {
    type: String,
    require: true
  },
  status: {
    type: String,
    enum: ['ok', 'help', 'emergency', 'undefined'],
    default: 'undefined'
  }
});

PrivateMessageSchema.loadClass(PrivateMessageClass);

export default mongoose.model('PrivateMessage', PrivateMessageSchema);
