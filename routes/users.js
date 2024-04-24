import express from 'express';
import passport from "passport";
import User from "../models/user.js";

const router = express.Router();

router.post('/acknowledgment', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  const user = req.user; // this assumes that the user has logged in.
  if (user) {
    try {
      await user.updateAcknowledgedRules();
      const response = { username: user.username, acknowledgedRules: true };
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: "There was an error while acknowledging the rules.", err });
    }
  } else {
    const response = { err: 'User not logged in' };
    res.status(401).json(response);
  }
});

router.get('/acknowledgment', async function (req, res, next) {
  const username = req.params.username;
  const user = await User.getUserByUsername(username);
  if (user) {
    const acknowledgedRules = user.acknowledgedRules;
    const response = { username, acknowledgedRules };
    res.status(200).json(response);
  } else {
    const response = { err: 'User not found' };
    res.status(400).json(response);
  }
});

// shares a status
router.post('/status', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "not logged in." });
  }
  const user = req.user;
  try {
    user.userStatus = req.body.status;
  } catch (e) {
    return res.status(401).json({ error: e, message: "invalid user status" });
  }
  return res.status(200).json({ status: user.userStatus });
});

// gets the latest status
router.get('/status', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "not logged in." });
    }
    const status = await req.user.userStatus;
    return res.status(200).json({ username: req.user.username, status });
  } catch (err) {
    return res.status(500).json({ error: "failed to get status" });
  }
});

export default router;
