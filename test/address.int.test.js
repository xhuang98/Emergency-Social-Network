import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendDelete, sendGet, sendPost, sendPut } from './test_util.js';

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
test('Can create a new address', async () => {
  const token = await registerUser(dummy);
  const data = { streetline1: "Test street", streetline2: "123", city: "Arkansas", zipCode: "90302" };
  await sendPost(HOST + "/address", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/address", 'username=' + dummy.username, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body;
      expect(message.user.username).toBe(dummy.username);
      expect(message.streetline1).toBe(data.streetline1);
      expect(message.streetline2).toBe(data.streetline2);
      expect(message.city).toBe(data.city);
      expect(message.zipcode).toBe(data.zipCode);
    });
});

test('Can update an address', async () => {
  const token = await registerUser(dummy);
  const data = { streetline1: "Test street", streetline2: "123", city: "Arkansas", zipCode: "90302" };
  await sendPost(HOST + "/address", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  const data2 = { streetline1: "Test" };
  await sendPut(HOST + "/address", data2, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/address", 'username=' + dummy.username, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body;
      expect(message.user.username).toBe(dummy.username);
      expect(message.streetline1).toBe("Test");
      expect(message.streetline2).toBe("123");
      expect(message.city).toBe("Arkansas");
      expect(message.zipcode).toBe("90302");
    });
});

test('Can delete an address', async () => {
  const token = await registerUser(dummy);
  const data = { streetline1: "Test street", streetline2: "123", city: "Arkansas", zipCode: "90302" };
  await sendPost(HOST + "/address", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/address", 'username=' + dummy.username, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body;
      expect(message.user.username).toBe(dummy.username);
      expect(message.streetline1).toBe("Test street");
      expect(message.streetline2).toBe("123");
      expect(message.city).toBe("Arkansas");
      expect(message.zipcode).toBe("90302");
    });

  await sendDelete(HOST + "/address", {}, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/address", 'username=' + dummy.username, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body).toBe(null);
    });
});
