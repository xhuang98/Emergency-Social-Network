import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost } from './test_util.js';

let server;
const dummy = { username: 'tp55', password: 'tp55' };

beforeAll(async () => {
  await db.connectionFactory(true);
  server = await app.listen(PORT);
});

afterEach(async () => await db.clearDatabase());

afterAll(async () => {
  if (server) { await server.close(); }
  if (db) { await db.closeTestingDatabase(); }
});

test('Can send a test for Measure Performance', async () => {
  const token = await registerUser(dummy);
  const data = { text: "test" };
  await sendPost(HOST + "/public-messages?test=true", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + "/public-messages", 'test=true', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      const message = res.body[0];
      expect(message.user.username).toBe(dummy.username);
      expect(message.text).toBe("test");
    });
});

test('can block website for a specific amount of time', async () => {
  const token = await registerUser(dummy);
  await sendPost(HOST + "/block?set=true", {}, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendGet(HOST + "/public-messages", '', token)
    .then((res, err) => {
      expect(err).not.toBe(undefined);
      expect(res.statusCode).toBe(404);
    }).catch((err) => {
      expect(err.message).toBe("Unauthorized");
    });

  await sendPost(HOST + "/block?set=false", {}, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendGet(HOST + "/public-messages", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
});
