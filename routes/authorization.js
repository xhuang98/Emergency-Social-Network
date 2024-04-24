import express from 'express';
import UserAuth from "../models/user_auth.js";
import User from "../models/user.js";
import passport from "passport";
const router = express.Router();

router.post('/validation', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const username = req.body.username.toLowerCase();
  const password = req.body.password;
  const lengthValidation = await UserAuth.validateUsernameAndPassword(username, password);
  const userValidation = await UserAuth.validateUserExists(username);
  
  if (lengthValidation.error && lengthValidation.error.length > 0) {
    return res.status(200).json({
      validation_success: false,
      message: lengthValidation.error
    });
  } 
  if (userValidation.user_exists) {
    const userIsActive = await User.validateUserIsActive(username);
    if (!userIsActive) {
      return res.status(200).json({
        validation_success: false,
        message: "Your account is inactive now, please contact the administrator."
      });
    }
  }
  return res.status(200).json({
    validation_success: true,
    user_exists: userValidation.user_exists,
    message: "Passed username and password validation."
  });
});

router.post('/registration', async function (req, res) {
  const username = req.body.username.toLowerCase();
  const password = req.body.password;
  // we sign up.
  try {
    const user = await UserAuth.signUpUser(username, password);

    if (user.error) return res.status(500).json({ message: user.error, signup_success: false });
    req.login(user, { session: false }, async function (err) {
      if (err) return res.status(500).json({ message: err, signup_success: false });
      const userData = await User.getUserByUsername(username);
      const token = userData.signJWT();
      return res.status(200).json({ user, signup_success: true, token });
    });
  } catch (err) {
    res.status(500).json({ message: err.message, signup_success: false });
  }
});

// login
router.post('/authentication', passport.authenticate('local', { session: false }), async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user;
  const token = user.signJWT();
  return res.status(200).json({ role: user.role, acknowledgedRules: user.acknowledgedRules, token });
});

router.post('/token-validation', passport.authenticate('jwt', { session: false }), async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user; // this assumes that the user has logged in.
  let response;
  if (user) {
    response = { valid: true, acknowledgedRules: user.acknowledgedRules, role: req.user.role };
  } else {
    response = { valid: false, acknowledgedRules: false };
  }
  return res.status(200).json(response);
});

router.get('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) { // eslint-disable-line no-unused-vars
  // return list of esn members sorted by activeness and alphabetically.
  try {
    const users = await User.getSortedUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user', passport.authenticate('jwt', { session: false }), async function (req, res, next) { // eslint-disable-line no-unused-vars
  // return list of esn members sorted by activeness and alphabetically.
  try {
    res.status(200).json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
