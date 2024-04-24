import express from 'express';
import PrivateNotification from "../models/private_notification.js";
import User from "../models/user.js";
const router = express.Router();

// Creates or updates a message count from a sender to me (user)
router.post('/:senderUsername', async function (req, res, next) {
  const senderUsername = req.params.senderUsername;
  const sender = await User.getUserByUsername(senderUsername);
  if (sender === null) {
    return res.status(400).json({ error: `sender ${senderUsername} does not exist` });
  }
  const destinationUser = req.user;

  let privateNotification;
  const unreadMessageCount = req.body.unreadMessageCount;

  if (unreadMessageCount !== undefined) {
    privateNotification = await PrivateNotification.savePrivateNotification(sender, destinationUser, unreadMessageCount);
    return res.status(200).json(privateNotification);
  }

  privateNotification = await PrivateNotification.savePrivateNotification(sender, destinationUser);
  return res.status(200).json(privateNotification);
});

// Gets the unread private message count from a sender to me (user)
router.get('/unread-message-count/:senderUsername', async function (req, res) {
  const senderUsername = req.params.senderUsername;
  const sender = await User.getUserByUsername(senderUsername);
  if (sender === null) {
    return res.status(400).json({ error: `sender ${senderUsername} does not exist` });
  }

  const notification = await PrivateNotification.getPrivateNotification(sender, req.user);
  if (notification === null) {
    const unreadMessageCount = 0;
    return res.status(200).json(unreadMessageCount);
  }
  return res.status(200).json(notification.unreadMessageCount);
});

// Get all unread messages that is > 0 for a destinationUser with destinationUsername
router.get('/unread-message-nonzero-counts', async function (req, res) {

  const destinationUsername = req.user.username;

  const notifications = await PrivateNotification.getPrivateNotificationsWithMoreThanOneUnreadMessageCount(destinationUsername);
  return res.status(200).json(notifications);
});

// Checks if current user has unread messages
router.get('/unread-message-existence', async function (req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "not logged in." });
  }
  const destinationUsername = req.user.username;

  const unreadMessageExists = await PrivateNotification.hasPrivateNotification(destinationUsername);
  return res.status(200).json({
    unreadMessageExists
  });
});

export default router;
