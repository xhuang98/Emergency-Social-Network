import mongoose, {Schema} from "mongoose";
import User from "./user.js";

class PrivateNotificationClass {
  // Either create a new entry for this private notification or update an existing entry
  static async savePrivateNotification(originUser, destinationUser, count = null) {
    let privateNotification = await this.getPrivateNotification(originUser, destinationUser);
    if (privateNotification === null) {
      // doesn't exist
      privateNotification = new this({
        originUser: originUser._id,
        destinationUser: destinationUser._id,
        unreadMessageCount: 1
      });
      console.log("==>> Doesn't exist, create an entry: ", originUser.username, destinationUser.username, privateNotification.unreadMessageCount);
    } else {
      // update existing notification
      if (typeof count === 'number') {
        privateNotification.unreadMessageCount = count;
      } else {
        privateNotification.unreadMessageCount++;
      }
      console.log("==>> Exists, updated entry: ", originUser.username, destinationUser.username, privateNotification.unreadMessageCount);
    }
    await privateNotification.save();
    return await privateNotification.populate(["destinationUser", "originUser"]);
  }

  static async getPrivateNotification(senderUser, destinationUser) {
    return await this.findOne({originUser: senderUser._id, destinationUser: destinationUser._id}).populate(["destinationUser", "originUser"]);
  }

  // get all entries match destinationUsername and have at least one unreadMessageCount
  static async getPrivateNotificationsWithMoreThanOneUnreadMessageCount(destinationUsername) {
    const destinationUser = await User.getUserByUsername(destinationUsername);
    return await this.find({
      destinationUser: destinationUser._id,
      unreadMessageCount: {$gt: 0}
    }).populate(["destinationUser", "originUser"]);
  }

  static async hasPrivateNotification(destinationUsername) {
    const destinationUser = await User.getUserByUsername(destinationUsername);
    const privateNotification = await this.findOne({
      destinationUser: destinationUser._id,
      unreadMessageCount: { $gt: 0 }
    });
    return privateNotification != null;
  }
}

const PrivateNotificationSchema = Schema({
  originUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinationUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unreadMessageCount: {
    type: Number,
    required: true,
    integer: true,
    get: v => Math.round(v),
    set: v => Math.round(v)
  }
});

PrivateNotificationSchema.loadClass(PrivateNotificationClass);

export default mongoose.model('PrivateNotification', PrivateNotificationSchema);
