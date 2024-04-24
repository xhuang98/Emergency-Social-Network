import { createMessage } from "../messages/message_creator.js";
import MessageType from "../messages/message_type.js";
import TestPublicMessage from "../../models/public_message/public_message_double.js";
import PublicMessageStrategy from "./public_message_strategy.js";

export default class TestStrategy extends PublicMessageStrategy {
  async createPublicMessage (text, user) {
    return await createMessage(MessageType.TestPublicMessage, user, text);
  }

  async getPublicMessages (amount) {
    if (amount) {
      try {
        amount = parseInt(amount);
      } catch (err) {
        amount = 10;
      }
    }
    return await TestPublicMessage.getLatestPublicMessages(amount);
  }
}
