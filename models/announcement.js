import mongoose, { Schema } from "mongoose";
import Message from "./message.js";

class Announcement extends Message {

  static async createMessage (user, text) {
    const timestamp = Date.now();
    return new this({ user: user._id, timestamp, text });
  }

  async saveMessage () {
    await this.save();
    await this.emitNewAnnouncement();
  }


  async emitNewAnnouncement() {
    this.socketService.emitMessageToClients('announcement', await this.populate("user"));
  }

  static async getLatestAnnouncements (amount = 10) {
    try {
      amount = parseInt(amount);
    } catch (e) {
      amount = 10;
    }
    const originAnnouncements = await this.find().sort('-timestamp').limit(amount).populate("user");
    return this.sortLatestAnnouncements(originAnnouncements);
  }

  static async findByText (partialText) {
    const annoucements = await this.find({ text: { $regex: partialText, $options: "i" } }).populate("user");
    return this.sortLatestAnnouncementsInDecreasingTimestamp(annoucements);
  }

  static sortLatestAnnouncementsInDecreasingTimestamp (originAnnouncements) {
    originAnnouncements.sort((a, b) =>
      (a.timestamp > b.timestamp) ? -1 : (a.timestamp < b.timestamp) ? 1 : 0);
    return originAnnouncements;
  }

  static sortLatestAnnouncements (originAnnouncements) {
    originAnnouncements.sort((a, b) => a.timestamp < b.timestamp ? -1 : (a.timestamp > b.timestamp) ? 1 : 0);
    return originAnnouncements;
  }
}

const AnnouncementSchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  text: {
    type: String,
    require: true
  }
});

AnnouncementSchema.loadClass(Announcement);

export default mongoose.model('Announcement', AnnouncementSchema);