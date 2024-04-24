import mongoose, { Schema } from "mongoose";
import User from "./user.js";

class AddressClass {
  static async createAddress (user, streetline1, streetline2, city, zipcode) {
    // we need to create only if it doesn't exist, else update.
    const address = new this({ user: user._id, streetline1, streetline2, city, zipcode });
    await address.save();
    return address;
  }

  static async deleteAddress (user) {
    return new Promise((resolve, reject) => {
      this.deleteOne({ user: user._id }, function (err) {
        if (err) return reject(err);
        // deleted at most one tank document
        resolve();
      });
    });
  }

  static async getAddress (username) {
    const user = await User.getUserByUsername(username);
    return await this.findOne({ user: user._id }).populate("user");
  }

  static async updateAddress (user, streetline1, streetline2, city, zipcode) {
    const query = { user: user._id };
    const update = { streetline1, streetline2, city, zipcode };
    return new Promise((resolve, reject) => {
      this.findOneAndUpdate(query, update, {}, function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
    });
  }
}

const AddressSchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  streetline1: {
    type: String,
    ref: 'UserAuth',
    required: true
  },
  streetline2: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  zipcode: {
    type: String,
    required: true
  }
});
AddressSchema.loadClass(AddressClass);

export default mongoose.model('Address', AddressSchema);
