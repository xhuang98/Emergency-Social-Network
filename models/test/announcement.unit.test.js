import Announcement from "../announcement.js";
import { jest } from "@jest/globals";
import { createMessage } from "../../services/messages/message_creator.js";
import MessageType from "../../services/messages/message_type.js";

const announcement1 = {
  _id: "6333bcbab76bffde652d5114",
  username: "dominic",
  displayName: "Dominic",
  timestamp: "2022-11-04T22:33:47.579Z",
  text: "This is a sample announcement from Dominic",
  __v: 0
};

const announcement2 = {
  _id: "6333bcbab76bffde652d5115",
  username: "sunnyisdope",
  displayName: "sunnyisdope",
  timestamp: "2022-09-28T03:27:14.921Z",
  text: "This is a sample announcement from sunnyisdope",
  __v: 0
};

const announcement3 = {
  _id: "6333bcbab76bffde652d5116",
  username: "tp55",
  displayName: "tp55",
  timestamp: "2022-09-29T03:17:14.921Z",
  text: "This is a sample announcement from tp55",
  __v: 0
};

const announcement4 = {
  _id: "6333bcbab76bffde652d5117",
  username: "tp55",
  displayName: "tp55",
  timestamp: "2022-09-29T03:17:14.921Z",
  text: "This is a sample announcement from tp55 - same timestamp as announcement3",
  __v: 0
};
const announcement5 = {
  _id: "6333bcbab76bffde652d5117",
  username: "tp55",
  displayName: "tp55",
  timestamp: "2021-09-29T03:17:14.921Z",
  text: "This is a sample announcement from tp55 2",
  __v: 0
};

test('whether announcements are sorted, newest at the bottom', () => {
  const originAnnouncement = [announcement1, announcement2, announcement3, announcement4, announcement5];
  const sortedAnnouncement = [announcement5, announcement2, announcement3, announcement4, announcement1];
  const lastestAnnouncement = Announcement.sortLatestAnnouncements(originAnnouncement);
  expect(lastestAnnouncement).toEqual(sortedAnnouncement);
});

test('whether announcements are sorted, random', () => {
  const originAnnouncement = [announcement4, announcement3, announcement1, announcement2];
  const sortedAnnouncement = [announcement1, announcement4, announcement3, announcement2];
  const latestAnnouncement = Announcement.sortLatestAnnouncementsInDecreasingTimestamp(originAnnouncement);
  expect(latestAnnouncement).toEqual(sortedAnnouncement);
});

test('can create an announcement', async () => {
  const user = { _id: '6333bcbab76bffde652d5115', username: 'test_user', status: 'ok', displayName: 'test_user' };

  const announcement = await Announcement.createMessage(user, 'test');
  jest.spyOn(announcement, 'saveMessage').mockImplementation(() => {});

  await announcement.saveMessage();
  expect(announcement.user.toString()).toBe('6333bcbab76bffde652d5115');
  expect(announcement.text).toBe('test');
});

test('can create an announcement with the factory method', async () => {
  const user = { _id: '6333bcbab76bffde652d5115', username: 'test_user', status: 'ok', displayName: 'test_user' };

  const announcement = await createMessage(MessageType.Announcement, user, 'test');
  jest.spyOn(announcement, 'saveMessage').mockImplementation(() => {});

  await announcement.saveMessage();
  expect(announcement.user.toString()).toBe('6333bcbab76bffde652d5115');
  expect(announcement.text).toBe('test');
});
