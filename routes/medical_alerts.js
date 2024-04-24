import express from 'express';

import { createMessage } from "../services/messages/message_creator.js";
import MessageType from "../services/messages/message_type.js";
const router = express.Router();

router.post('/', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user;
  const publicMessage = await createMessage(MessageType.MedicalAlert, user);
  await publicMessage.saveMessage();
  return res.status(200).json(publicMessage);
});

export default router;
