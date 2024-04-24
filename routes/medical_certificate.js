import express from 'express';
import MedicalCertificate from "../models/medical_certificate.js";
const router = express.Router();
// save a medical certificate or a doctor record
router.post('/', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user;
  const medicalCertificateImage = new Buffer.from(req.files.file.data, 'base64');
  const imageType = req.files.file.mimetype;
  const imageName = req.files.file.name;
  const fileSize = req.files.file.size;
  try {
    await MedicalCertificate.addMedicalCertificate(user, medicalCertificateImage, imageType, imageName, fileSize);
  } catch (error) {
    return res.status(500).json({ success: false, errorMessage: error.message });
  }
  return res.status(200).json({ success: true });
});
// Gets specific doctor medical certificate
router.get('/:username', async function (req, res) {
  const username = req.params.username;
  const medicalCertificateImage = await MedicalCertificate.getMedicalCertificate(username);
  return res.status(200).json({ image: medicalCertificateImage });
});
// Gets all doctors list
router.get('/', async function (req, res) {
  const doctorsList = await MedicalCertificate.getAllDoctorsList();
  return res.status(200).json(doctorsList);
});
export default router;
