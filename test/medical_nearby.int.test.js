import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendPut, sendPost, sendDelete } from './test_util.js';
import { expect, test } from '@jest/globals';

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

test('Can create medical provider entries and search by name', async () => {
  const token = await registerUser(dummy);
  const entry1 = {
    name: "New entry",
    address: "123 Real Road",
    longitude: 0,
    latitude: 0
  };
  await sendPost(HOST + "/medical-providers", entry1, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  const entry2 = {
    name: "Another entry",
    address: "111 Real Road",
    longitude: 1,
    latitude: 1
  };
  await sendPost(HOST + "/medical-providers", entry2, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  const search = {
    searchType: 'name',
    query: 'new'
  };
  await sendPost(HOST + "/medical-providers/search", search, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(1);
      const mp1 = res.body[0];
      expect(mp1.name).toBe(entry1.name);
      expect(mp1.address).toBe(entry1.address);
      expect(mp1.longitude).toBe(entry1.longitude);
      expect(mp1.latitude).toBe(entry1.latitude);
      expect(mp1.distance).toBe(undefined);
    });
});

test('Can create medical provider entries and search by location', async () => {
  const token = await registerUser(dummy);
  const entry1 = {
    name: "New entry",
    address: "123 Real Road",
    longitude: 0,
    latitude: 0
  };
  await sendPost(HOST + "/medical-providers", entry1, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  const entry2 = {
    name: "Another entry",
    address: "111 Real Road",
    longitude: 0,
    latitude: 1
  };
  await sendPost(HOST + "/medical-providers", entry2, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  const search = {
    searchType: 'location',
    query: [0, 0]
  };
  await sendPost(HOST + "/medical-providers/search", search, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(2);
      const mp1 = res.body[0];
      expect(mp1.name).toBe(entry1.name);
      expect(mp1.address).toBe(entry1.address);
      expect(mp1.longitude).toBe(entry1.longitude);
      expect(mp1.latitude).toBe(entry1.latitude);
      expect(mp1.distance).toBe(0);
      const mp2 = res.body[1];
      expect(mp2.name).toBe(entry2.name);
      expect(mp2.address).toBe(entry2.address);
      expect(mp2.longitude).toBe(entry2.longitude);
      expect(mp2.latitude).toBe(entry2.latitude);
      // 1 degree latitude is roughly 110.567km
      expect(mp2.distance).toBeGreaterThan(110);
      expect(mp2.distance).toBeLessThan(112);
    });
});

test('Can edit a medical providers entry', async () => {
  const token = await registerUser(dummy);
  const entry1 = {
    name: "New entry",
    address: "123 Real Road",
    longitude: 0,
    latitude: 0
  };
  let id1;
  await sendPost(HOST + "/medical-providers", entry1, token)
    .then((res, err) => {
      id1 = res.body._id;
      expect(err).toBe(undefined);
    });
  const edit1 = {
    name: "Edited entry",
    address: "123 Real Road",
    longitude: 0,
    latitude: 0
  };
  await sendPut(HOST + "/medical-providers/" + id1, edit1, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  const search1 = {
    searchType: 'name',
    query: 'new'
  };
  await sendPost(HOST + "/medical-providers/search", search1, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(0);
    });
  const search2 = {
    searchType: 'name',
    query: 'edited'
  };
  await sendPost(HOST + "/medical-providers/search", search2, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe(edit1.name);
    });
});

test('Can delete a medical providers entry', async () => {
  const token = await registerUser(dummy);
  const entry1 = {
    name: "New entry",
    address: "123 Real Road",
    longitude: 0,
    latitude: 0
  };
  let id1;
  await sendPost(HOST + "/medical-providers", entry1, token)
    .then((res, err) => {
      id1 = res.body._id;
      expect(err).toBe(undefined);
    });
  await sendDelete(HOST + "/medical-providers/" + id1, '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  const search = {
    searchType: 'name',
    query: 'new'
  };
  await sendPost(HOST + "/medical-providers/search", search, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(0);
    });
});

test('Cannot create medical provider entries with invalid values', async () => {
  const token = await registerUser(dummy);
  const entry1 = {
    address: "123 Real Road",
    longitude: 0,
    latitude: 0
  };
  try {
    await sendPost(HOST + "/medical-providers", entry1, token)
      .then((res, err) => {});
  } catch (e) {
    expect(e.status).toBe(400);
  }
  const entry2 = {
    name: "Another entry"
  };
  try {
    await sendPost(HOST + "/medical-providers", entry2, token)
      .then((res, err) => {});
  } catch (e) {
    expect(e.status).toBe(400);
  }
});

test('Cannot edit medical provider entries with invalid values', async () => {
  const token = await registerUser(dummy);
  const entry1 = {
    name: "New entry",
    address: "123 Real Road",
    longitude: 0,
    latitude: 0
  };
  let id1;
  await sendPost(HOST + "/medical-providers", entry1, token)
    .then((res, err) => {
      id1 = res.body._id;
      expect(err).toBe(undefined);
    });

  const edit1 = {
    name: "Edited entry"
  };
  try {
    await sendPut(HOST + "/medical-providers/" + id1, edit1, token)
      .then((res, err) => {});
  } catch (e) {
    expect(e.status).toBe(400);
  }
  const edit2 = {
    address: "123 Real Road",
    longitude: 0,
    latitude: 0
  };
  try {
    await sendPut(HOST + "/medical-providers/" + id1, edit2, token)
      .then((res, err) => {});
  } catch (e) {
    expect(e.status).toBe(400);
  }
});

test('Cannot search with empty query', async () => {
  const token = await registerUser(dummy);
  const search = {
    searchType: 'name',
    query: ''
  };
  try {
    await sendPost(HOST + "/medical-providers/search", search, token)
      .then((res, err) => {});
  } catch (e) {
    expect(e.status).toBe(400);
  }
});
