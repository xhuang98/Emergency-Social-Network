import express from 'express';
import Searcher from "../services/search.js";
import User from "../models/user.js";
const router = express.Router();

router.post('/', async (req, res, next) => {
  const searchText = req.body.searchText;
  const searchType = req.body.searchType;
  const currentUser = req.user;
  const otherCitizenInPrivateChat = req.body.otherCitizenUsername;
  const otherCitizen = await User.getUserByUsername(otherCitizenInPrivateChat);
  const medicalSuppliesExchangeType = req.body.exchangeType;

  const searcher = new Searcher(searchText, currentUser, otherCitizen, medicalSuppliesExchangeType);
  let searchResults = null;

  switch (searchType) {
    case "userByUsername":
      searchResults = await searcher.searchUserByUsername();
      break;
    case "firstAidByMedicalInjury":
      searchResults = await searcher.searchFirstAidByMedicalInjury();
      break;
    case "userByStatus":
      searchResults = await searcher.searchUserByStatus();
      break;
    case "announcementsByText":
      searchResults = await searcher.searchAnnouncementByText();
      break;
    case "publicByText":
      searchResults = await searcher.searchPublicChatByText();
      break;
    case "privateByText":
      searchResults = await searcher.searchPrivateChatByText();
      break;
    case "privateByStatus":
      searchResults = await searcher.searchPrivateChatCitizenStatusRecords();
      break;
    case "myMedicalSuppliesByText":
      searchResults = await searcher.searchMyMedicalSuppliesByText();
      break;
    case "medicalSuppliesExchangeByText":
      searchResults = await searcher.searchMedicalSuppliesExchangeByText();
      break;
    default:
      searchResults = await searcher.searchUserByUsername();
  }
  return res.status(200).json(searchResults);
});

export default router;
