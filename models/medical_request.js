import mongoose, { Schema } from "mongoose";
import Message from "./message.js";

class MedicalRequest extends Message {
  static async createMessage (user, description, helpersRequired) {
    const timestamp = Date.now();
    return new this({ user: user._id, timestamp, description, helpersRequired }).populate("user");
  }

  async saveMessage () {
    await this.save();
    await this.emitNewMedicalRequest();
  }

  static async getByID (id) {
    return await this.findById(id).populate("user");
  }

  static async getAndPopulate(id){
    return await this.findById(id).populate("user").populate("helperList");
  }

  async emitNewMedicalRequest() {
    this.socketService.emitMessageToClients('medical-request', await this.populate("user"));
  }

  static async getLatestMedicalRequests (amount = 5) {
    try {
      amount = parseInt(amount);
    } catch (e) {
      amount = 5;
    }
    const originMedicalRequest = await this.find().sort('-timestamp').limit(amount).populate("user").populate("helperList");

    return this.sortLatestMedicalRequests(originMedicalRequest);
  }

  static async deleteMedicalRequest (id) {
    return await this.deleteOne({ _id: id });
  }

  // test
  async addHelper (user) {
    if (this.status === "Closed") {
      return this;
    }
    this.helperList.push(user._id);
    this.checkStatus();
    await this.save();
    return this;
  }

  // test
  checkStatus () {
    if (this.helperList.length === this.helpersRequired) {
      this.status = "Closed";
    } else {
      this.status = "Active";
    }
  }

  // test
  async removeHelper (user) {
    this.helperList.remove(user._id);
    this.checkStatus();
    this.save();
    return this;
  }

  static findByText (partialText) {
    return this.find({ text: { $regex: partialText, $options: "i" } });
  }

  // test done
  static sortLatestMedicalRequests (originMedicalRequests) {
    originMedicalRequests.sort((a, b) => a.timestamp < b.timestamp ? -1 : (a.timestamp > b.timestamp) ? 1 : 0);
    return originMedicalRequests;
  }
}

const MedicalRequestSchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  helpersRequired: {
    type: Number,
    required: true,
    integer: true
  },
  helperList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
});

MedicalRequestSchema.loadClass(MedicalRequest);

export default mongoose.model('MedicalRequest', MedicalRequestSchema);
