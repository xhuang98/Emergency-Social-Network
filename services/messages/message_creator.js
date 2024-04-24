import MessageType from "./message_type.js";
import PrivateMessage from "../../models/private_message.js";
import PublicMessage from "../../models/public_message/public_message.js";
import Announcement from "../../models/announcement.js";
import TestPublicMessage from "../../models/public_message/public_message_double.js";
import MedicalRequest from "../../models/medical_request.js";

export async function createMessage (messageType, origin, text, destinationUser) {
  let message;
  switch (messageType) {
    case MessageType.Announcement:
      message = await Announcement.createMessage(origin, text);
      break;
    case MessageType.PrivateMessage:
      message = await PrivateMessage.createMessage(origin, text, destinationUser);
      break;
    case MessageType.PublicMessage:
      message = await PublicMessage.createMessage(origin, text);
      break;
    case MessageType.TestPublicMessage:
      message = await TestPublicMessage.createMessage(origin, text);
      break;
    case MessageType.MedicalRequest:
      message = await MedicalRequest.createMessage(origin, text, destinationUser);
      break;
    case MessageType.MedicalAlert:
      message = await PublicMessage.createMedicalAlert(origin);
      break;
  }
  return message;
}
