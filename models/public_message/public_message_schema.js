import mongoose, { Schema } from "mongoose";
import Message from "../message.js";

class PublicMessage extends Message {

  static async createMessage (user, text) {
    const status = user.status;
    const timestamp = Date.now();
    return new this({ user: user._id, timestamp, text, status, type: 'normal' });
  }

  static async createMedicalAlert (user) {
    const status = user.status;
    const timestamp = Date.now();
    const displayName = user.displayName;
    const text = `User ${displayName} is in danger!`;
    return new this({ user: user._id, timestamp, text, status, type: 'medical_alert' });
  }

  static async deleteMessage (user, messageId) {
    return await this.deleteOne({ _id: messageId, user: user._id });
  }

  async saveMessage () {
    await this.save();
    await this.emitNewPublicMessage();
  }


  async emitNewPublicMessage() {
    this.socketService.emitMessageToClients('public_message', await this.populate("user"));
  }


  static async getLatestPublicMessages (amount = 10) {
    const originMessages = await this.find().sort('-timestamp').limit(amount).populate("user");
    return this.sortLatestPublicMessages(originMessages);
  }

  static sortLatestPublicMessages (originMessages) {
    originMessages.sort((a, b) => a.timestamp < b.timestamp ? -1 : (a.timestamp > b.timestamp) ? 1 : 0);
    return originMessages;
  }

  static async findByText (partialText) {
    const publicMessages = await this.find({ text: { $regex: partialText, $options: "i" } }).populate("user");
    return this.sortLatestPublicMessagesInDecreasingTimestamp(publicMessages);
  }

  static sortLatestPublicMessagesInDecreasingTimestamp (originMessages) {
    originMessages.sort((a, b) => a.timestamp > b.timestamp ? -1 : (a.timestamp < b.timestamp) ? 1 : 0);
    return originMessages;
  }
}

const PublicMessageSchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  text: {
    type: String,
    require: true
  },
  status: {
    type: String,
    enum: ['ok', 'help', 'emergency', 'undefined'],
    default: 'undefined'
  },
  type: {
    type: String,
    enum: ['normal', 'medical_alert'],
    default: 'normal'
  }
});

PublicMessageSchema.loadClass(PublicMessage);

export default PublicMessageSchema;
