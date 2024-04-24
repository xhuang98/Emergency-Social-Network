import PublicMessage from '../public_message/public_message.js';
import { jest } from '@jest/globals';
import { createMessage } from "../../services/messages/message_creator.js";
import MessageType from "../../services/messages/message_type.js";

const message1 = {
  _id: "6333bcbab76bffde652d5114",
  username: "tp55",
  displayName: "tp55",
  timestamp: "2022-09-28T03:37:14.921Z",
  text: "This is a sample text 11",
  status: "undefined",
  __v: 0
};

const message2 = {
  _id: "6333bcbab76bffde652d5114",
  username: "sunnyisdope",
  displayName: "sunnyisdope",
  timestamp: "2022-09-28T03:27:14.921Z",
  text: "This is a sample text 11",
  status: "undefined",
  __v: 0
};

const message3 = {
  _id: "6333bcbab76bffde652d5114",
  username: "hakan",
  displayName: "hakan",
  timestamp: "2022-09-28T03:17:14.921Z",
  text: "This is a sample text 11",
  status: "undefined",
  __v: 0
};

const message4 = {
  _id: "6333bcbab76bffde652d5114",
  username: "hakan2",
  displayName: "hakan2",
  timestamp: "2022-09-28T03:17:14.921Z",
  text: "This is a sample text 13",
  status: "undefined",
  __v: 0
};

test('whether public message is sorted, newest at the bottom', () => {
  const originMessage = [message1, message2, message3, message4];
  const sortedMessage = [message3, message4, message2, message1];
  const lastestMessage = PublicMessage.sortLatestPublicMessages(originMessage);
  expect(lastestMessage).toEqual(sortedMessage);
});

test('can create a public message', async () => {
  const user = { _id: '6333bcbab76bffde652d5115', username: 'test_user', status: 'ok', displayName: 'test_user' };

  const message = await PublicMessage.createMessage(user, 'test');
  jest.spyOn(message, 'saveMessage').mockImplementation(() => {});

  await message.saveMessage();

  expect(message.user.toString()).toBe('6333bcbab76bffde652d5115');
  expect(message.text).toBe('test');
  expect(message.status).toBe('ok');
});

test('can create a public message with the factory', async () => {
  const user = { '_id': '6333bcbab76bffde652d5115', username: 'test_user', status: 'ok', displayName: 'test_user' };

  const message = await createMessage(MessageType.PublicMessage, user, 'test');
  jest.spyOn(message, 'saveMessage').mockImplementation(() => {});

  await message.saveMessage();

  expect(message.user.toString()).toBe('6333bcbab76bffde652d5115');
  expect(message.text).toBe('test');
  expect(message.status).toBe('ok');
});

test('whether public message is sorted in decreasing order', () => {
  const originMessage = [message2, message3, message1, message4];
  const sortedMessage = [message1, message2, message3, message4];
  const resultMessage = PublicMessage.sortLatestPublicMessagesInDecreasingTimestamp(originMessage);
  expect(resultMessage).toStrictEqual(sortedMessage);
});
