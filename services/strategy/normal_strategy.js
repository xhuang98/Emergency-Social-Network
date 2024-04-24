import { createMessage } from "../messages/message_creator.js";
import MessageType from "../messages/message_type.js";
import PublicMessage from "../../models/public_message/public_message.js";
import PublicMessageStrategy from "./public_message_strategy.js";

export default class NormalStrategy extends PublicMessageStrategy {
  async createPublicMessage (text, user) {
    return await createMessage(MessageType.PublicMessage, user, text);
  }

  async getPublicMessages (amount) {
    if (amount) {
      try {
        amount = parseInt(amount);
      } catch (err) {
        amount = 10;
      }
    }
    return await PublicMessage.getLatestPublicMessages(amount);
  }

  async createMedicalAlert (user) {
    return await createMessage(MessageType.MedicalAlert, user);
  }
}
