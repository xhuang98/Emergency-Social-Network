import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost } from './test_util.js';

let server;
const user1 = { username: 'dominic', password: 'dominic' };
const user2 = { username: 'dom-test', password: 'dom-test-only' };

beforeAll(async () => {
  app.set('testing', true);
  await db.connectionFactory(true);
  server = await app.listen(PORT);
});

afterEach(async () => await db.clearDatabase());

afterAll(async () => {
  if (server) { await server.close(); }
  if (db) { await db.closeTestingDatabase(); }
});

/* Start Testing */

// Happy path test 1
test('Logged in user can post a private message to another user', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  await registerUser(user2);

  const data = { text: "test private message" };
  const destinationUsername = user2.username;
  await sendPost(HOST + "/private-messages/" + destinationUsername, data, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + "/private-messages/" + destinationUsername, '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      const message = res.body[0];
      expect(message.originUser.username).toBe(user1.username);
      expect(message.text).toBe(data.text);
    });
});

// Happy path test 2
test('Logged in user can get a specific amount of private messages', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  const user2Token = await registerUser(user2);

  const privateMessageData1 = { text: "test private message 1" };
  const privateMessageData2 = { text: "test private message 2" };
  await sendPost(HOST + "/private-messages/" + user2.username, privateMessageData1, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + "/private-messages/" + user1.username, privateMessageData2, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + "/private-messages/" + user2.username, "amount=2", user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const message1 = res.body[0];
      expect(message1.originUser.username).toBe(user1.username);
      expect(message1.destinationUser.username).toBe(user2.username);
      expect(message1.text).toBe(privateMessageData1.text);
      const message2 = res.body[1];
      expect(message2.originUser.username).toBe(user2.username);
      expect(message2.destinationUser.username).toBe(user1.username);
      expect(message2.text).toBe(privateMessageData2.text);
    });
});

