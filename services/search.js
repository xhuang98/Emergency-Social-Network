import PublicMessage from "../models/public_message/public_message.js";
import PrivateMessage from "../models/private_message.js";
import Announcement from "../models/announcement.js";
import User from "../models/user.js";
import Status from "../models/status.js";
import FirstAid from '../models/first_aid.js';
import MedicalSupply from "../models/medical_supply.js";

const stopWords = ["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "us",
  "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot",
  "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get",
  "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if",
  "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might",
  "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or",
  "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some",
  "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to",
  "too", "twas", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who",
  "whom", "why", "will", "with", "would", "yet", "you", "your"];

class Searcher {
  constructor (partial, currentUser, destinationUser, medicalSuppliesExchangeType) {
    this.partial = partial;
    this.currentUser = currentUser;
    this.destinationUser = destinationUser;
    this.medicalSuppliesExchangeType = medicalSuppliesExchangeType;
  }

  addPartial (extraPartial) {
    this.partial += extraPartial;
  }

  setPartial (partial) {
    this.partial = partial;
  }

  reset () {
    this.partial = "";
  }

  async searchUserByUsername () {
    this.partial = Searcher.removeFromString(stopWords, this.partial);
    let usersFound = [];
    if (this.partial !== "") {
      usersFound = await User.findByPartialUsername(this.partial);
    }
    return usersFound;
  }

  async searchFirstAidByMedicalInjury () {
    let firstAidFound = [];
    if (this.partial !== "") {
      firstAidFound = await FirstAid.findByPartialMedicalInjury(this.partial);
    }
    return firstAidFound;
  }

  async searchUserByStatus () {
    let usersFound = [];
    if (['OK', 'Help', 'Emergency'].indexOf(this.partial) > -1) {
      usersFound = await User.findByStatus(this.partial.toLowerCase());
    }
    return usersFound;
  }

  async searchAnnouncementByText () {
    this.partial = Searcher.removeFromString(stopWords, this.partial);
    let announcementsFound = [];
    if (this.partial !== "") {
      announcementsFound = await Announcement.findByText(this.partial);
    }
    return announcementsFound;
  }

  async searchPublicChatByText () {
    this.partial = Searcher.removeFromString(stopWords, this.partial);
    let publicChatsFound = [];
    if (this.partial !== "") {
      publicChatsFound = await PublicMessage.findByText(this.partial);
    }
    return publicChatsFound;
  }

  async searchPrivateChatByText () {
    this.partial = Searcher.removeFromString(stopWords, this.partial);
    let privateChatsFound = [];
    if (this.partial !== "") {
      privateChatsFound = await PrivateMessage.findByText(this.partial, this.currentUser, this.destinationUser);
    }
    return privateChatsFound;
  }

  async searchPrivateChatCitizenStatusRecords () {
    let statusRecordsFound = [];
    if (this.destinationUser) {
      statusRecordsFound = await Status.getLatestStatusRecords(this.destinationUser);
    }
    return statusRecordsFound;
  }

  async searchMyMedicalSuppliesByText () {
    return await MedicalSupply.findByTextAndUsername(this.partial, this.currentUser);
  }

  async searchMedicalSuppliesExchangeByText () {
    let medicalSuppliesFound = [];
    if (this.medicalSuppliesExchangeType && this.medicalSuppliesExchangeType !== "") {
      medicalSuppliesFound = await MedicalSupply.findByTextAndExchangeType(this.partial, this.medicalSuppliesExchangeType, this.currentUser);
    }
    return medicalSuppliesFound;
  }

  static removeFromString (arr, str) {
    if (!str) return str;
    const words = str.split(" ");
    arr.forEach(w => {
      let index = words.indexOf(w);
      while (index > -1) {
        words.splice(index, 1);
        index = words.indexOf(w);
      }
    });

    return words.join(" ");
  }
}

export default Searcher;
