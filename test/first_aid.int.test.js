import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost, sendDelete } from './test_util.js';
import { expect } from '@jest/globals';

let server;
const dummy = { username: 'tp55', password: 'tp55' };
const dummy2 = { username: 'kishan', password: 'kishan' };

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

const text = "et porttitor eget dolor morbi non arcu risus quis varius quam quisque id diam vel quam elementum pulvinar etiam non quam lacus suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit duis tristique sollicitudin nibh sit amet commodo nulla facilisi nullam vehicula ipsum a arcu cursus vitae congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas maecenas pharetra convallis posuere morbi leo urna molestie at elementum eu facilisis sed odio morbi quis commodo odio aenean sed adipiscing diam donec adipiscing tristique risus nec feugiat in fermentum posuere urna nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus";

const shortText = "et porttitor eget dolor morbi";

test('Can get all first aid instructions', async () => {
  const token = await registerUser(dummy);
  const data1 = { username: "tp55", displayName: "tp55", medical_injury: "burn", description: text };
  const data2 = { username: "tp55", displayName: "tp55", medical_injury: "cut", description: text };

  await sendPost(HOST + "/first-aid-instructions", data1, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendPost(HOST + "/first-aid-instructions", data2, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/first-aid-instructions", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(2);
      const message1 = res.body[0];
      expect(message1.instructions).toBe(data2.description);
      expect(message1.medicalInjury).toBe(data2.medical_injury);
      const message2 = res.body[1];
      expect(message2.instructions).toBe(data1.description);
      expect(message2.medicalInjury).toBe(data1.medical_injury);
    });
});

test('Cannot post same medical injury', async () => {
  const token = await registerUser(dummy);
  const token2 = await registerUser(dummy2);
  const data1 = { username: "tp55", displayName: "tp55", medical_injury: "burn", description: text };
  const data2 = { username: "kishan", displayName: "kishan", medical_injury: "burn", description: text };

  await sendPost(HOST + "/first-aid-instructions", data1, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendPost(HOST + "/first-aid-instructions", data2, token2)
    .then((res, err) => {
      expect(res).toBe(undefined);
    }).catch((err) => {
      expect(err.status).toBe(500);
    });

  await sendGet(HOST + "/first-aid-instructions", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(1);
      const message1 = res.body[0];
      expect(message1.instructions).toBe(data1.description);
      expect(message1.medicalInjury).toBe(data1.medical_injury);
    });
});

test('Cannot post shorter first aid instructions', async () => {
  const token = await registerUser(dummy);
  const data1 = { username: "tp55", displayName: "tp55", medical_injury: "burn", description: shortText };

  await sendPost(HOST + "/first-aid-instructions", data1, token)
    .then((res, err) => {
      expect(res).toBe(undefined);
    }).catch((err) => {
      expect(err.status).toBe(500);
    });

  await sendGet(HOST + "/first-aid-instructions", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(0);
    });
});

test('Can get a specific first aid instructions', async () => {
  let id;
  const token = await registerUser(dummy);
  const data = { username: "tp55", displayName: "tp55", medical_injury: "burn", description: text };
  await sendPost(HOST + "/first-aid-instructions", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      id = res._body._id;
    });
  await sendGet(HOST + "/first-aid-instructions/" + id, '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body;
      expect(message.instructions).toBe(data.description);
      expect(message.medicalInjury).toBe(data.medical_injury);
    });
});

test('Can update a specific first aid instructions', async () => {
  let id;
  const token = await registerUser(dummy);
  const data = { username: "tp55", displayName: "tp55", medical_injury: "burn", description: text };
  const updatedData = { medical_injury: "burn updated", description: text };
  await sendPost(HOST + "/first-aid-instructions", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      id = res._body._id;
    });
  await sendPost(HOST + "/first-aid-instructions/" + id, updatedData, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  await sendGet(HOST + "/first-aid-instructions/" + id, '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body;
      expect(message.medicalInjury).toBe(updatedData.medical_injury);
      expect(message.instructions).toBe(updatedData.description);
    });
});

test('Cannot update a specific first aid instructions with shorter instructions or shorter medical injury name', async () => {
  let id;
  const token = await registerUser(dummy);
  const data = { username: "tp55", displayName: "tp55", medical_injury: "burn", description: text };
  const updatedData1 = { medical_injury: "burn2", description: shortText };
  const updatedData2 = { medical_injury: "b", description: shortText };
  await sendPost(HOST + "/first-aid-instructions", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      id = res._body._id;
    });
  await sendPost(HOST + "/first-aid-instructions/" + id, updatedData2, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    }).catch((err) => {
      expect(err.status).toBe(500);
    });
  await sendPost(HOST + "/first-aid-instructions/" + id, updatedData1, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    }).catch((err) => {
      expect(err.status).toBe(500);
    });
});

test('Can delete a specific first aid instructions', async () => {
  let id;
  const token = await registerUser(dummy);
  const data = { username: "tp55", displayName: "tp55", medical_injury: "burn", description: text };
  await sendPost(HOST + "/first-aid-instructions", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      id = res._body._id;
    });
  await sendDelete(HOST + "/first-aid-instructions/" + id, '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  await sendGet(HOST + "/first-aid-instructions", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(0);
    });
});
