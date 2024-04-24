import mongoose, { Schema } from "mongoose";

class MedicalProviderClass {
  static async createEntry (name, capacity, introduction, longitude, latitude, address, phone, notes) {
    const editTime = Date.now();
    const newMedicalProvider = new this({ name, capacity, introduction, longitude, latitude, address, phone, notes, editTime });
    newMedicalProvider.save();
    return newMedicalProvider;
  }

  static async updateEntry (id, name, capacity, introduction, longitude, latitude, address, phone, notes) {
    const editTime = Date.now();
    const medicalProvider = await this.findOneAndUpdate(
      { _id: id },
      { name, capacity, introduction, longitude, latitude, address, phone, notes, editTime }
    );
    return medicalProvider;
  }

  static async deleteEntry (id) {
    return await this.deleteOne({ _id: id });
  }

  static async getAllMedicalProviders () {
    const allMedicalProviders = await this.find();
    return allMedicalProviders;
  }

  static async findByPartialName (partialText) {
    const medicalProviders = await this.find({ name: { $regex: partialText, $options: "i" } });
    return medicalProviders;
  }
}

const MedicalProviderSchema = Schema({
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: String,
    enum: ['green', 'yellow', 'orange', 'red'],
    required: true
  },
  introduction: {
    type: String
  },
  longitude: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: Number
  },
  notes: {
    type: String
  },
  editTime: {
    type: Date,
    default: Date.now
  }
});
MedicalProviderSchema.loadClass(MedicalProviderClass);

export default mongoose.model('MedicalProvider', MedicalProviderSchema);
