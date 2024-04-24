import express from 'express';
import Announcement from "../models/announcement.js";
import { createMessage } from "../services/messages/message_creator.js";
import MessageType from "../services/messages/message_type.js";
const router = express.Router();

// Saves an announcement
router.post('/', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user;
  const text = req.body.text;

  const announcement = await createMessage(MessageType.Announcement, user, text);
  await announcement.saveMessage();
  return res.status(200).json(announcement);
});

// Gets the latest annoucements (default to 10)
router.get('/', async function (req, res) {
  const amount = req.query.amount;
  const announcements = await Announcement.getLatestAnnouncements(amount);
  return res.status(200).json(announcements);
});

export default router;
