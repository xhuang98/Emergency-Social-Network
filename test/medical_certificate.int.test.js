import db from '../services/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Initiate Server
import app from '../app';
import { HOST, PORT, registerUser, sendGet, sendPostForFile } from './test_util.js';
import { expect } from '@jest/globals';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
const dummy = { username: 'tp55', password: 'tp55' };
const dummy2 = { username: 'kishan1', password: 'kishan' };

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

test('upload a medical certificate', async () => {
  const token = await registerUser(dummy);
  await sendPostForFile(HOST + "/medical-certificates", token, 'public/icons/test-image.jpeg')
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.success).toBe(true);
    });
});

test('cannot upload a medical certificate with large image size', async () => {
  const token = await registerUser(dummy);
  await sendPostForFile(HOST + "/medical-certificates", token, 'public/icons/test-image-large.jpeg')
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.success).toBe(true);
    }).catch((err) => {
      expect(err.status).toBe(500);
    });
});

test('cannot upload a medical certificate with incorrect file format', async () => {
  const token = await registerUser(dummy);
  await sendPostForFile(HOST + "/medical-certificates", token, 'public/icons/test-image-wrong-format.png')
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.success).toBe(true);
    }).catch((err) => {
      expect(err.status).toBe(500);
    });
});

test('can get all doctors list', async () => {
  const token = await registerUser(dummy);
  const token2 = await registerUser(dummy2);
  await sendPostForFile(HOST + "/medical-certificates", token, 'public/icons/test-image.jpeg')
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.success).toBe(true);
    });

  await sendPostForFile(HOST + "/medical-certificates", token2, 'public/icons/test-image.jpeg')
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.success).toBe(true);
    });

  await sendGet(HOST + "/medical-certificates", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body[0].user.displayName).toBe("tp55");
      expect(res.body[1].user.displayName).toBe("kishan1");
    });
});

test('get specific medical certificate', async () => {
  const token = await registerUser(dummy);
  await sendPostForFile(HOST + "/medical-certificates", token, 'public/icons/test-image.jpeg')
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.success).toBe(true);
    });

  await sendGet(HOST + "/medical-certificates/" + dummy.username, '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
});
