import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet } from './test_util.js';

let server;
const dummy = { username: 'tp55', password: 'tp55' };

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

// Happy paths tests
test('Can get login page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get login page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get dashboard page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/dashboard", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get esn-list page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/esn-list", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get public-wall page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/public-wall", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get announcements-view page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/announcements-view", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get chats page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/chats", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get private-chat page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/private-chat", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get healthcheck page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/healthcheck", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get map page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/map", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});

test('Can get address profile page', async () => {
  const token = await registerUser(dummy);

  await sendGet(HOST + "/address-profile", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.status).toBe(200);
    });
});
