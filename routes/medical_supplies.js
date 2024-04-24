import express from 'express';
import MedicalSupply from "../models/medical_supply.js";

const router = express.Router();

// Saves a medical supply
router.post('/', async (req, res, next) => {
  const supply = req.body;
  const medicalSupply = await MedicalSupply.createMedicalSupply(req.user, supply.supplyName, supply.supplyQuantity, supply.supplyType, supply.exchangeType);
  const saveResult = await MedicalSupply.saveMedicalSupply(medicalSupply);
  if (saveResult.error) return res.status(400).json({ error: saveResult.error });
  return res.status(200).json(medicalSupply);
});

// Gets a medical supply
router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "not logged in." });
  const medicalSupply = await MedicalSupply.getMedicalSupplyBySupplyInfo(req.query.supplyID, req.query.timestamp);
  return res.status(200).json(medicalSupply);
});

// Gets medical supplies by a specific user
router.get('/supplies-by-creator', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "not logged in." });
  const medicalSupplies = await MedicalSupply.getMedicalSuppliesByCreator(req.user);
  return res.status(200).json(medicalSupplies);
});

// Gets medical supplies by the exchange type
router.get('/supplies-by-exchange-type', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "not logged in." });
  const medicalSupplies = await MedicalSupply.getLatestMedicalSuppliesByExchangeType(req.query.amount, req.query.exchangeType);
  return res.status(200).json(medicalSupplies);
});

// Updates a medical supply
router.put('/', async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "not logged in." });
  const updateResult = await MedicalSupply.updateMedicalSupplyByID(req.body.supplyID, req.body.newSupply);
  if (updateResult.error) return res.status(400).json(updateResult);
  return res.status(200).json(updateResult);
});

// Deletes a medical supply
router.delete('/', async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "not logged in." });
  const deleteResult = await MedicalSupply.deleteMedicalSupplyByID(req.query.supplyID);
  if (deleteResult.error) return res.status(400).json(deleteResult);
  return res.status(200).json(deleteResult);
});

export default router;
