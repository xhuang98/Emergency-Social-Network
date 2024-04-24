import PrivateMessage from "../private_message.js";
import { jest } from "@jest/globals";
import { createMessage } from "../../services/messages/message_creator.js";
import MessageType from "../../services/messages/message_type";

const message1 = {
  _id: "6333bcbab76bffde652d5114",
  originUsername: "tp55",
  displayName: "tp55",
  timestamp: "2022-09-28T03:17:14.921Z",
  text: "This is a sample text 12",
  status: "undefined",
  destinationUsername: "hakan",
  __v: 0
};
const message2 = {
  _id: "63316e2d7af1e05ac332739b",
  originUsername: "tp55",
  displayName: "tp55",
  timestamp: "2022-09-26T09:17:33.608Z",
  text: "This is a sample text 11",
  status: "undefined",
  destinationUsername: "hakan",
  __v: 0
};
const message3 = {
  _id: "63316be3532898a5ae0f0174",
  originUsername: "tp55",
  displayName: "tp55",
  timestamp: "2022-09-26T09:07:47.416Z",
  text: "This is a sample text 10",
  status: "undefined",
  destinationUsername: "hakan",
  __v: 0
};

const message4 = {
  _id: "63316be3532898a5ae0f0174",
  originUsername: "tp55",
  displayName: "tp55",
  timestamp: "2022-09-26T09:07:47.416Z",
  text: "This is a sample text 13",
  status: "undefined",
  destinationUsername: "hakan2",
  __v: 0
};

test('whether private message is sorted, newest at the bottom', () => {
  // Query by reverse timestamp order
  const queriedMessages = [
    message1, message2, message3, message4
  ];
    // Sort by newest message last
  const sortedMessages = [
    message3, message4, message2, message1
  ];
  const latestMessages = PrivateMessage.sortLatestPrivateMessages(queriedMessages);
  expect(latestMessages).toEqual(sortedMessages);
});

test('whether private message is sorted in reverse order', () => {
  // Query by reverse timestamp order
  const queriedMessages = [
    message1, message2, message3, message4
  ];
    // Sort by newest message last
  const sortedMessages = [
    message1, message2, message3, message4
  ];
  const latestMessages = PrivateMessage.sortLatestPrivateMessagesInDecreasingTimestamp(queriedMessages);
  expect(latestMessages).toEqual(sortedMessages);
});

test('can create a private message', async () => {
  const user = { _id: '6333bcbab76bffde652d5115', username: 'test_user', status: 'ok', displayName: 'test_user' };
  const destinationUser = { _id: '6333bcbab76bffde652d5115', username: 'test_user', status: 'ok', displayName: 'test_user' };

  const privateMessage = await PrivateMessage.createMessage(user, 'test', destinationUser);
  jest.spyOn(privateMessage, 'saveMessage').mockImplementation(() => {});

  await privateMessage.saveMessage();

  expect(privateMessage.originUser.toString()).toBe('6333bcbab76bffde652d5115');
  expect(privateMessage.text).toBe('test');
  expect(privateMessage.status).toBe('ok');
});

test('can create a private message with factory method', async () => {
  const user = { _id: '6333bcbab76bffde652d5115', username: 'test_user', status: 'ok', displayName: 'test_user' };
  const destinationUser = { _id: '6333bcbab76bffde652d5115', username: 'test_user', status: 'ok', displayName: 'test_user' };

  const privateMessage = await createMessage(MessageType.PrivateMessage, user, 'test', destinationUser);
  jest.spyOn(privateMessage, 'saveMessage').mockImplementation(() => {});

  await privateMessage.saveMessage();

  expect(privateMessage.originUser.toString()).toBe('6333bcbab76bffde652d5115');
  expect(privateMessage.text).toBe('test');
  expect(privateMessage.status).toBe('ok');
});
