import express from 'express';
import TestStrategy from "../services/strategy/test_strategy.js";
import NormalStrategy from "../services/strategy/normal_strategy.js";
import PublicMessage from "../models/public_message/public_message.js";
const router = express.Router();

// Saves a message
router.post('/', async function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "not logged in." });
  }
  const user = req.user;
  const text = req.body.text;
  const strategy = req.query.test ? new TestStrategy() : new NormalStrategy();

  const publicMessage = await strategy.createPublicMessage(text, user);
  await publicMessage.saveMessage();
  return res.status(200).json(publicMessage);
});

// Gets the latest messages
router.get('/', async function (req, res) {
  const amount = req.query.amount;

  const strategy = req.query.test ? new TestStrategy() : new NormalStrategy();

  const messages = await strategy.getPublicMessages(amount);
  return res.status(200).json(messages);
});

router.delete('/', async function (req, res) {
  const id = req.query.id;
  const success = await PublicMessage.deleteMessage(req.user, id);
  return res.status(200).json({ success });
});

export default router;
