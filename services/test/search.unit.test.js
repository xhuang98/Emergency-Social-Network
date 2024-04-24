import Searcher from "../search.js";
import Status from "../../models/status.js";
import { jest } from "@jest/globals";

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

test('stop words removal: no stop words', () => {
  const str = "hey dom";
  const target = "hey dom";
  const partial = Searcher.removeFromString(stopWords, str);
  expect(partial).toEqual(target);
});

test('stop words removal: one stop word', () => {
  const str = "hey you";
  const target = "hey";
  const partial = Searcher.removeFromString(stopWords, str);
  expect(partial).toEqual(target);
});

test('stop words removal: multiple stop words', () => {
  const str = "hey it is you";
  const target = "hey";
  const partial = Searcher.removeFromString(stopWords, str);
  expect(partial).toEqual(target);
});

test('searching private chat with no destination username returns empty', async () => {
  const searcher = new Searcher();
  const response = await searcher.searchPrivateChatCitizenStatusRecords();
  expect(response).toStrictEqual([]);
});

test('searching private chat with destination username returns correctly', async () => {
  const partial = "test"; const currentUsername = ""; const destinationUsername = "test_username";
  jest.spyOn(Status, 'getLatestStatusRecords').mockImplementation(() => {});
  const searcher = new Searcher(partial, currentUsername, destinationUsername);
  const response = await searcher.searchPrivateChatCitizenStatusRecords();
  let allCorrect = true;
  for (message in response) {
    if (message.destinationUsername !== destinationUsername) {
      allCorrect = false;
      break;
    }
  }
  expect(allCorrect).toBe(true);
});

test('searching user by empty username', async () => {
  const partial = ""; const currentUsername = ""; const destinationUsername = "test";
  const searcher = new Searcher(partial, currentUsername, destinationUsername);
  const response = await searcher.searchUserByUsername();
  expect(response).toStrictEqual([]);
});

test('searching user by empty status', async () => {
  const partial = ""; const currentUsername = ""; const destinationUsername = "test";
  const searcher = new Searcher(partial, currentUsername, destinationUsername);
  const response = await searcher.searchUserByStatus();
  expect(response).toStrictEqual([]);
});

test('searching announcement by empty text', async () => {
  const partial = ""; const currentUsername = ""; const destinationUsername = "test";
  const searcher = new Searcher(partial, currentUsername, destinationUsername);
  const response = await searcher.searchAnnouncementByText();
  expect(response).toStrictEqual([]);
});

test('searching public chat by empty text', async () => {
  const data = "";
  const searcher = new Searcher(data);
  const response = await searcher.searchPublicChatByText();
  expect(response).toStrictEqual([]);
});

test('searching private chat chat by empty text', async () => {
  const partial = ""; const currentUsername = ""; const destinationUsername = "test";
  const searcher = new Searcher(partial, currentUsername, destinationUsername);
  const response = await searcher.searchPrivateChatByText();
  expect(response).toStrictEqual([]);
});
