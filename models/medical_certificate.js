import mongoose, {Schema} from "mongoose";
import User from "./user.js";

class MedicalCertificateClass {
  static async addMedicalCertificate (user, medicalCertificateImage, imageType, imageName, fileSize) {
    const timestamp = Date.now();
    const newMedicalCertificateRecord = new this({ user: user._id, timestamp, medicalCertificateImage, imageType, imageName });
    this.checkImageUploadRule(imageType, fileSize);
    try {
      await newMedicalCertificateRecord.save();
    } catch (error) {
      throw new Error(error);
    }
    return newMedicalCertificateRecord;
  }

  static checkImageUploadRule (imageType, fileSize) {
    const maximumFileSizeLimit = 110000;
    if (fileSize >= maximumFileSizeLimit || imageType !== 'image/jpeg') {
      throw new Error('Uploaded image is not in correct format');
    }
    return 'pass';
  }

  static async getMedicalCertificate (username) {
    const user = await User.getUserByUsername(username);
    const medicalCertificateImageObject = await this.findOne({ user: user._id.toString() }).populate("user");
    let image = medicalCertificateImageObject;
    if (medicalCertificateImageObject) {
      image = medicalCertificateImageObject.imgSrc;
    }
    return image;
  }

  static async getAllDoctorsList () {
    return await this.find({}, {displayName: 1}).populate("user");
  }
}
const MedicalCertificateSchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  medicalCertificateImage: {
    type: Buffer,
    required: true
  },
  imageType: {
    type: String,
    default: 'image/jpeg'
  },
  imageName: {
    type: String,
    default: 'certificate'
  }
});
/* istanbul ignore next */
MedicalCertificateSchema.virtual('imgSrc').get(function () {
  return `data:${this.imageType};charset=utf-8;base64,${this.medicalCertificateImage.toString('base64')}`;
});
MedicalCertificateSchema.loadClass(MedicalCertificateClass);
export default mongoose.model('MedicalCertificate', MedicalCertificateSchema);
