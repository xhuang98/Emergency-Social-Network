import express from 'express';
import MedicalProvider from "../models/medical_provider.js";
import MPSearcher from "../services/medical_provider_searcher.js";
const router = express.Router();

router.post('/search', async (req, res, next) => {
  if (!req.body.query) {
    return res.status(400).json("empty query");
  }
  const searcher = new MPSearcher(req.body.query);
  try {
    if (req.body.searchType === 'location') {
      return res.status(200).json(await searcher.searchByCoordinates());
    } else {
      return res.status(200).json(await searcher.searchByName());
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.post('/', async (req, res, next) => {
  let capacity = req.body.capacity;
  if (!req.body.name) {
    return res.status(400).json({ error: "name empty" });
  }
  if (!capacity) {
    capacity = 'green';
  }
  if (!req.body.address) {
    return res.status(400).json({ error: "address empty" });
  }
  try {
    return res.status(200).json(await MedicalProvider.createEntry(req.body.name, capacity, req.body.introduction, req.body.longitude, req.body.latitude, req.body.address, req.body.phone, req.body.notes));
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.put('/:id', async (req, res, next) => {
  let capacity = req.body.capacity;
  if (!req.body.name) {
    return res.status(400).json({ error: "name empty" });
  }
  if (!capacity) {
    capacity = 'green';
  }
  if (!req.body.address) {
    return res.status(400).json({ error: "address empty" });
  }
  try {
    return res.status(200).json(await MedicalProvider.updateEntry(req.params.id, req.body.name, capacity, req.body.introduction, req.body.longitude, req.body.latitude, req.body.address, req.body.phone, req.body.notes));
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    return res.status(200).json(await MedicalProvider.deleteEntry(req.params.id));
  } catch (e) {
    return res.status(500).json(e);
  }
});

export default router;
