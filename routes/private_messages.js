import express from 'express';
import PrivateMessage from "../models/private_message.js";
import User from "../models/user.js";
import MessageType from "../services/messages/message_type.js";
import { createMessage } from "../services/messages/message_creator.js";
const router = express.Router();

// Saves a message.
router.post('/:destinationUsername', async function (req, res) {
  const user = req.user;
  const text = req.body.text;
  const destination = req.params.destinationUsername;

  const userDestination = await User.getUserByUsername(destination);
  if (!userDestination) {
    return res.status(400).json({ error: "that destination username does not exist" });
  }

  const privateMessage = await createMessage(MessageType.PrivateMessage, user, text, userDestination);
  await privateMessage.saveMessage();
  return res.status(200).json(privateMessage);
});

// Gets the latest messages
router.get('/:destinationUsername', async function (req, res) {
  const destination = req.params.destinationUsername;
  const userDestination = await User.getUserByUsername(destination);
  if (!userDestination) {
    return res.status(400).json({ error: "that destination username does not exist" });
  }
  let amount = req.query.amount;
  const user = req.user;
  let messages;

  if (amount) {
    try {
      amount = parseInt(amount);
      messages = await PrivateMessage.getLatestPrivateMessages(user, userDestination, amount);
      return res.status(200).json(messages);
    } catch (err) {
      return res.status(400).json({ error: "invalid amount" });
    }
  }
  messages = await PrivateMessage.getLatestPrivateMessages(user, userDestination);
  return res.status(200).json(messages);
});

export default router;
