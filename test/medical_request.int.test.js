import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost, sendPut, sendDelete } from './test_util.js';
import { expect } from '@jest/globals';

let server;
const dummy = { username: 'tp55', password: 'tp55' };
const dummy2 = { username: 'sunny', password: 'tp55' };

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
test('Can post a medical request', async () => {
  const token = await registerUser(dummy);
  const data = { description: "test", helpersRequired: 3 };
  await sendPost(HOST + "/medical-requests", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/medical-requests", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body[0];
      expect(message.user.username).toBe(dummy.username);
      expect(message.description).toBe("test");
    });
});

// Happy paths tests - put
test('Can add a user to the medical request', async () => {
  const token = await registerUser(dummy);
  await registerUser(dummy2);
  const data = { description: "test", helpersRequired: 3 };
  await sendPost(HOST + "/medical-requests", data, token).then(async (res) => {
    const medicalRequest = res.body;
    await sendPut(HOST + "/medical-requests", { id: medicalRequest._id, joined: true }, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        const message = res.body;
        expect(message.helperList.length).toBe(1);
        expect(message.helperList[0].username).toBe('tp55');
      });
  });
});

// Happy paths tests - delete
test('Can remove medical request', async () => {
  const token = await registerUser(dummy);
  const data = { description: "test", helpersRequired: 3 };
  let medicalRequest;
  await sendPost(HOST + "/medical-requests", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/medical-requests", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body;
      expect(message.length).toBe(1);
      medicalRequest = message[0];
    });
  await sendDelete(HOST + "/medical-requests", null, token, 'medicalId=' + medicalRequest._id)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/medical-requests", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body;
      expect(message.length).toBe(0);
    });
});
