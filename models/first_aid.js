import mongoose, {Schema} from "mongoose";

class FirstAidClass {
  static async createFirstAidRecord (user, medicalInjury, instructions) {
    const timestamp = Date.now();
    const newFirstAidRecord = new this({ user: user._id, medicalInjury, timestamp, instructions });
    this.checkInstructionsRule(medicalInjury, instructions);
    const DuplicateEntryErrorCode = 11000;
    try {
      await newFirstAidRecord.save();
    } catch (error) {
      if (error.code === DuplicateEntryErrorCode) {
        throw new Error(DuplicateEntryErrorCode);
      } else {
        throw new Error(error);
      }
    }
    return newFirstAidRecord;
  }

  static checkInstructionsRule (medicalInjury, instructions) {
    const minMedicalInjuryLength = 2;
    const minInstructionsLength = 270;
    if (medicalInjury.trim().length <= minMedicalInjuryLength || instructions.trim().length <= minInstructionsLength) {
      throw new Error('Instructions length is not satisfied');
    }
    return 'pass';
  }

  static sortLatestFirstAidInstructions (firstAidList) {
    firstAidList.sort((a, b) => a.timestamp > b.timestamp ? -1 : (a.timestamp < b.timestamp) ? 1 : 0);
    return firstAidList;
  }

  static async updateFirstAidRecord (id, medicalInjury, instructions) {
    const timestamp = Date.now();
    this.checkInstructionsRule(medicalInjury, instructions);
    return await this.updateOne({_id: id.toString()}, {$set: {medicalInjury, instructions, timestamp}});
  }

  static async getAllFirstAidRecords () {
    const firstAidList = await this.find().populate("user");
    return this.sortLatestFirstAidInstructions(firstAidList);
  }

  static async getFirstAidRecord (id) {
    return await this.findById(id).populate("user");
  }

  static async deleteFirstAidRecord (id) {
    return await this.deleteOne({_id: id});
  }

  static async findByPartialMedicalInjury (partialMedicalInjury) {
    return await this.find({medicalInjury: {$regex: partialMedicalInjury, $options: "i"}}).populate("user");
  }
}

const FirstAidSchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicalInjury: {
    type: String,
    require: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  instructions: {
    type: String,
    require: true
  }
});

FirstAidSchema.loadClass(FirstAidClass);
export default mongoose.model('FirstAid', FirstAidSchema);
