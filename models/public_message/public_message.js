import mongoose from "mongoose";
import PublicMessageSchema from "./public_message_schema.js";

export default mongoose.model('PublicMessage', PublicMessageSchema);
