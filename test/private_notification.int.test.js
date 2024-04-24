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

// Happy path tests for POST /private-notifications/:senderUsername
test('Logged in user can send a private message to another offline user which creates an unread notification', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  await registerUser(user2);

  // Unread message 1
  const senderUsername = user2.username;
  await sendPost(HOST + "/private-notifications/" + senderUsername, '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.destinationUser.username).toBe(user1.username);
      expect(res.body.unreadMessageCount).toBe(1);
    });

  // Check if we persist changes made by POST requests above
  await sendGet(HOST + "/private-notifications/unread-message-nonzero-counts", '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].originUser.username).toBe(senderUsername);
      expect(res.body[0].destinationUser.username).toBe(user1.username);
      expect(res.body[0].unreadMessageCount).toBe(1);
    });
});

test('Logged in user can send a private message to another offline user which adds one to current unread notification counts', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  await registerUser(user2);

  const senderUsername = user2.username;
  const data = { unreadMessageCount: 2 };

  // unread message 1
  await sendPost(HOST + "/private-notifications/" + senderUsername, '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.destinationUser.username).toBe(user1.username);
      expect(res.body.unreadMessageCount).toBe(1);
    });

  await sendPost(HOST + "/private-notifications/" + senderUsername, data, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.destinationUser.username).toBe(user1.username);
      expect(res.body.unreadMessageCount).toBe(2);
    });

  // Check if we persist changes made by POST requests above
  await sendGet(HOST + "/private-notifications/unread-message-nonzero-counts", '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].originUser.username).toBe(senderUsername);
      expect(res.body[0].destinationUser.username).toBe(user1.username);
      expect(res.body[0].unreadMessageCount).toBe(2);
    });
});

// Happy path tests for GET /private-notifications/unread-message-count/:senderUsername
test('Logged in user has no unread message from another user initially', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  await registerUser(user2);

  const senderUsername = user2.username;

  await sendGet(HOST + "/private-notifications/unread-message-count/" + senderUsername, '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBe(0);
    });
});

test('Logged in user has 1 unread message from another user', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  await registerUser(user2);

  const senderUsername = user2.username;

  // unread message 1
  await sendPost(HOST + "/private-notifications/" + senderUsername, '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.destinationUser.username).toBe(user1.username);
      expect(res.body.unreadMessageCount).toBe(1);
    });

  await sendGet(HOST + "/private-notifications/unread-message-count/" + senderUsername, '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBe(1);
    });
});

// Happy path tests for GET /private-notifications/unread-message-nonzero-counts
test('Logged in user has 1 unread message from another user in total', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  await registerUser(user2);

  const senderUsername = user2.username;

  // unread message 1
  await sendPost(HOST + "/private-notifications/" + senderUsername, '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.destinationUser.username).toBe(user1.username);
      expect(res.body.unreadMessageCount).toBe(1);
    });

  await sendGet(HOST + "/private-notifications/unread-message-nonzero-counts", '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].originUser.username).toBe(senderUsername);
      expect(res.body[0].destinationUser.username).toBe(user1.username);
    });
});

// Happy path tests for GET /private-notifications/unread-message-existence
test('Logged in user has no unread messages at the inital state', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);

  await sendGet(HOST + "/private-notifications/unread-message-existence", '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.unreadMessageExists).toBe(false);
    });
});
