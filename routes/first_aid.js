
import express from 'express';
import FirstAid from "../models/first_aid.js";
const router = express.Router();

// save a first aid intructions
router.post('/', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user;
  const medicalInjury = req.body.medical_injury;
  const description = req.body.description;
  const DuplicateEntryErrorCode = '11000';
  try {
    const firstAidRecord = await FirstAid.createFirstAidRecord(user, medicalInjury, description);
    return res.status(200).json(firstAidRecord);
  } catch (error) {
    if (error.message === DuplicateEntryErrorCode) {
      return res.status(500).json({ error: "Medical injury already exists!" });
    } else {
      return res.status(500).json({ error: "Instructions length is not satisfied" });
    }
  }
});

// update a first aid intructions
router.post('/:id', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const medicalInjury = req.body.medical_injury;
  const description = req.body.description;
  const id = req.params.id;
  let updatedFirstAidRecord;
  try {
    updatedFirstAidRecord = await FirstAid.updateFirstAidRecord(id, medicalInjury, description);
  } catch (error) {
    return res.status(500).json({ error: "Instructions length is not satisfied" });
  }
  return res.status(200).json(updatedFirstAidRecord);
});

// Delete specific first aid intructions
router.delete('/:id', async function (req, res) {
  const id = req.params.id;
  const firstAidItemDeleted = await FirstAid.deleteFirstAidRecord(id);
  return res.status(200).json(firstAidItemDeleted);
});

// Gets all the first aid list
router.get('/', async function (req, res) {
  const firstAidList = await FirstAid.getAllFirstAidRecords();
  return res.status(200).json(firstAidList);
});

// Gets specific first aid intructions
router.get('/:id', async function (req, res) {
  const id = req.params.id;
  const firstAidItem = await FirstAid.getFirstAidRecord(id);
  return res.status(200).json(firstAidItem);
});

export default router;
