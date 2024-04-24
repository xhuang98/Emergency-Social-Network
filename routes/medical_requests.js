import express from 'express';
import MedicalRequest from "../models/medical_request.js";
import { createMessage } from "../services/messages/message_creator.js";
import MessageType from "../services/messages/message_type.js";
const router = express.Router();

// Saves a medical request
router.post('/', async function (req, res) {
  const user = req.user;
  const description = req.body.description;
  const helpersRequired = req.body.helpersRequired;

  const medicalRequest = await createMessage(MessageType.MedicalRequest, user, description, helpersRequired);
  await medicalRequest.saveMessage();
  return res.status(200).json(medicalRequest);
});

// Gets the latest medical requests (default to 5)
router.get('/', async function (req, res) {
  const amount = req.query.amount;
  const medicalRequests = await MedicalRequest.getLatestMedicalRequests(amount);
  const response = [];
  for (const request of medicalRequests) {
    request.populate("helperList");
    response.push(request);
  }
  return res.status(200).json(response);
});

// Deletes a medical request
router.delete('/', async function (req, res) {
  const id = req.query.medicalId;
  const deleted = await MedicalRequest.deleteMedicalRequest(id);
  return res.status(200).json({ deleted: true, deletedValue: deleted });
});

// Drops a helper
router.put('/', async function (req, res) {
  const user = req.user;
  const id = req.body.id;
  let medicalRequest = await MedicalRequest.getByID(id);
  if (!medicalRequest) {
    return res.status(404).json({ error: "not found" });
  }
  if (req.body.joined) {
    medicalRequest = await medicalRequest.addHelper(user);
  } else {
    medicalRequest = await medicalRequest.removeHelper(user);
  }
  medicalRequest = await MedicalRequest.getAndPopulate(medicalRequest._id);
  return res.status(200).json(medicalRequest);
});

export default router;
