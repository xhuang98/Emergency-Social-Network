import mongoose, { Schema } from "mongoose";

class StatusClass {
  static createStatusRecord (user, status) {
    const newStatusRecord = new this({ user: user._id, status });
    newStatusRecord.save();
  }

  static sortLatestStatusRecordsInDecreasingTimestamp (originStatusRecords) {
    originStatusRecords.sort((a, b) => a.timestamp > b.timestamp ? -1 : (a.timestamp < b.timestamp) ? 1 : 0);
    return originStatusRecords;
  }

  static async getLatestStatusRecords (user, amount = 10) {
    const originStatusRecords = await this.find({ user: user._id }).sort('-timestamp').limit(amount).populate("user");
    return this.sortLatestStatusRecordsInDecreasingTimestamp(originStatusRecords);
  }
}

const StatusSchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['ok', 'help', 'emergency', 'undefined'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});
StatusSchema.loadClass(StatusClass);

export default mongoose.model('Status', StatusSchema);
