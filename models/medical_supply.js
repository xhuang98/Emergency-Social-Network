import mongoose, {Schema} from "mongoose";

class MedicalSupply {
  static async createMedicalSupply (user, supplyName, supplyQuantity, supplyType, exchangeType) {
    const timestamp = Date.now();
    return new this({
      user: user._id,
      timestamp,
      supplyName,
      supplyQuantity,
      supplyType,
      exchangeType
    });
  }

  static async saveMedicalSupply (supply) {
    try {
      await supply.save();
    } catch (saveError) {
      return { error: saveError };
    }
    return supply;
  }

  static async getLatestMedicalSuppliesByExchangeType (amount = 10, exchangeType) {
    try {
      amount = parseInt(amount);
      if (isNaN(amount)) throw 'amount is not a number';
    } catch (e) {
      amount = 10;
    }
    const originMedicalSupplies = await this.find({ exchangeType }).limit(amount).populate("user");
    return this.sortLatestMedicalSupplies(originMedicalSupplies);
  }

  static async getMedicalSuppliesByCreator (user) {
    const originMedicalSupplies = await this.find({ user: user._id}).populate("user");
    return this.sortLatestMedicalSupplies(originMedicalSupplies);
  }

  static async getMedicalSupplyByID (supplyID) {
    return await this.findOne({_id: supplyID}).populate("user");
  }

  static async getMedicalSupplyBySupplyInfo (supplyID, timestamp) {
    try {
      timestamp = new Date(timestamp);
    } catch (e) {
      return null;
    }
    return await this.findOne({_id: supplyID, timestamp}).populate("user");
  }

  static async updateMedicalSupplyByID (supplyID, newSupply) {
    const { supplyName, supplyQuantity, supplyType, exchangeType } = newSupply;

    let updateResult;
    try {
      updateResult = await this.updateOne(
        { _id: supplyID },
        { $set: { supplyName, supplyQuantity, supplyType, exchangeType, timestamp: Date.now() } });
    } catch (updateError) {
      return { error: "medical supply update failed" };
    }
    return updateResult;
  }

  static async deleteMedicalSupplyByID (supplyID) {
    let deleteResult;
    try {
      deleteResult = await this.deleteOne({ _id: supplyID });
    } catch (deleteError) {
      return { error: "medical supply deletion failed" };
    }

    // Deletion Success
    if (deleteResult.acknowledged && deleteResult.deletedCount === 1) {
      return { deletedCount: deleteResult.deletedCount };
    } else {
      return { error: "medical supply deletion failed" };
    }
  }

  static async findByTextAndUsername (partialText, user) {
    const supplies = await this.find({
      user: user._id,
      supplyName: { $regex: partialText, $options: "i" }
    }).populate("user");
    return this.sortLatestMedicalSupplies(supplies);
  }

  // Note: we exclude the medical supply created by the search initiator
  static async findByTextAndExchangeType (partialText, exchangeType, user) {
    const supplies = await this.find({
      user: { $ne: user._id },
      supplyName: { $regex: partialText, $options: "i" },
      exchangeType
    }).populate("user");
    return this.sortLatestMedicalSupplies(supplies);
  }

  static sortLatestMedicalSupplies (originMedicalSupplies) {
    originMedicalSupplies.sort((a, b) => a.timestamp < b.timestamp ? -1 : (a.timestamp > b.timestamp) ? 1 : 0);
    return originMedicalSupplies;
  }
}

const MedicalSupplySchema = Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  supplyName: {
    type: String,
    required: true
  },
  supplyQuantity: {
    type: String,
    required: true
  },
  supplyType: {
    type: String,
    enum: ['Medicine', 'Accessories', 'Equipment', 'Food'],
    required: true
  },
  exchangeType: {
    type: String,
    enum: ['Request', 'Offer'],
    required: true
  }
});

MedicalSupplySchema.loadClass(MedicalSupply);
// Make the combination of following fields uniquely identified
MedicalSupplySchema.index({ user: 1, supplyName: 1, supplyType: 1, exchangeType: 1 }, { unique: true });

export default mongoose.model('MedicalSupply', MedicalSupplySchema);
