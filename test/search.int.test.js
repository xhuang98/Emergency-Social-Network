import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendPost } from './test_util.js';

let server;
const dummy = { username: 'tp55', password: 'tp55' };
const user1 = { username: 'dell', password: 'demoPerson' };
const user2 = { username: 'emo', password: 'demoPerson2' };

beforeAll(async () => {
  await db.connectionFactory(true);
  server = await app.listen(PORT);
});

afterEach(async () => await db.clearDatabase());

afterAll(async () => {
  if (server) { await server.close(); }
  if (db) { await db.closeTestingDatabase(); }
});

test('user can search for public messages correctly', async () => {
  const token = await registerUser(dummy);
  for (let i = 0; i < 3; i++) {
    const data = { text: "test" + i };
    const data2 = { text: "hello" + i };
    await sendPost(HOST + "/public-messages", data, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
    await sendPost(HOST + "/public-messages", data2, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
  }
  const data = { searchType: "publicByText", searchText: "test" };
  await sendPost(HOST + "/search", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      const messages = res.body;
      expect(messages.length).toBe(3);
      expect(messages[0].user.username).toBe(dummy.username);
      expect(messages[0].text).toBe('test2');

      expect(messages[1].user.username).toBe(dummy.username);
      expect(messages[1].text).toBe('test1');

      expect(messages[2].user.username).toBe(dummy.username);
      expect(messages[2].text).toBe('test0');
    });
});

test('user can search for announcements correctly', async () => {
  const token = await registerUser(dummy);
  for (let i = 0; i < 3; i++) {
    const data = { text: "test" + i };
    const data2 = { text: "hello" + i };
    await sendPost(HOST + "/announcements", data, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
    await sendPost(HOST + "/announcements", data2, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
  }
  const data = { searchType: "announcementsByText", searchText: "test" };
  await sendPost(HOST + "/search", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      const messages = res.body;
      expect(messages.length).toBe(3);
      expect(messages[0].user.username).toBe(dummy.username);
      expect(messages[0].text).toBe('test2');

      expect(messages[1].user.username).toBe(dummy.username);
      expect(messages[1].text).toBe('test1');

      expect(messages[2].user.username).toBe(dummy.username);
      expect(messages[2].text).toBe('test0');
    });
});

test('user can search for private chats correctly', async () => {
  const token = await registerUser(dummy);
  await registerUser(user2);

  for (let i = 0; i < 3; i++) {
    const data = { text: "test" + i };
    const data2 = { text: "hello" + i };
    const destinationUsername = user2.username;
    await sendPost(HOST + "/private-messages/" + destinationUsername, data, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
    await sendPost(HOST + "/private-messages/" + destinationUsername, data2, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
  }
  const data = { searchType: "privateByText", searchText: "test", otherCitizenUsername: user2.username };
  await sendPost(HOST + "/search", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      const messages = res.body;
      expect(messages.length).toBe(3);
      expect(messages[0].originUser.username).toBe(dummy.username);
      expect(messages[0].destinationUser.username).toBe(user2.username);
      expect(messages[0].text).toBe('test2');

      expect(messages[1].originUser.username).toBe(dummy.username);
      expect(messages[0].destinationUser.username).toBe(user2.username);
      expect(messages[1].text).toBe('test1');

      expect(messages[2].originUser.username).toBe(dummy.username);
      expect(messages[0].destinationUser.username).toBe(user2.username);
      expect(messages[2].text).toBe('test0');
    });
});

test('user can search for users by username correctly', async () => {
  const token = await registerUser(dummy);
  await registerUser(user1);
  await registerUser(user2);

  const data = { searchType: "userByUsername", searchText: "e" };
  await sendPost(HOST + "/search", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      const users = res.body;

      expect(users.length).toBe(2);
      expect(users[0].username).toBe(user1.username);
      expect(users[1].username).toBe(user2.username);
    });
});

test('user can search for users by status correctly', async () => {
  const token = await registerUser(dummy);
  const token2 = await registerUser(user1);
  await registerUser(user2);

  const newStatus = 'help';
  const statusData = { status: newStatus };
  await sendPost(HOST + "/users/status", statusData, token)
    .then((res, err) => {
      expect(res.status).toBe(200);
    });

  await sendPost(HOST + "/users/status", statusData, token2)
    .then((res, err) => {
      expect(res.status).toBe(200);
    });

  const data = { searchType: "userByStatus", searchText: "Help" };
  await sendPost(HOST + "/search", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      const users = res.body;

      expect(users.length).toBe(2);
      expect(users[0].username).toBe(user1.username);
      expect(users[1].username).toBe(dummy.username);
    });
});
