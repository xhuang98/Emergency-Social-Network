import MedicalCertificate from "../medical_certificate.js";
import { jest } from "@jest/globals";

test('Cannot pass image upload rule for medical certificate', async () => {
  const newMedicalCertificateRecord = { username: 'test_user', displayName: 'test_user', medicalInjury: 'burn test', medicalCertificateImage: "232323", imageType: "image/jpeg", imageName: "test-image.jpeg", imageSize: 120000 };
  jest.spyOn(MedicalCertificate, 'addMedicalCertificate').mockImplementation(() => {});
  expect(() => MedicalCertificate.checkImageUploadRule(newMedicalCertificateRecord.imageType, newMedicalCertificateRecord.imageSize)).toThrow('Uploaded image is not in correct format');
  await MedicalCertificate.addMedicalCertificate(newMedicalCertificateRecord);
});

test('Can pass image upload rule for medical certificate', async () => {
  const newMedicalCertificateRecord = { username: 'test_user', displayName: 'test_user', medicalCertificateImage: "232323", imageType: "image/jpeg", imageName: "test-image.jpeg", imageSize: 50000 };
  jest.spyOn(MedicalCertificate, 'addMedicalCertificate').mockImplementation(() => {});
  await MedicalCertificate.addMedicalCertificate(newMedicalCertificateRecord);
  expect(MedicalCertificate.checkImageUploadRule(newMedicalCertificateRecord.imageType, newMedicalCertificateRecord.imageSize)).toBe('pass');
});
