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

// Happy paths tests
test('Can update status', async () => {
  const token = await registerUser(dummy);
  const newStatus = 'help';
  const data = { status: newStatus };
  let res = await sendPost(HOST + "/users/status", data, token);

  expect(res.status).toBe(200);

  res = await sendGet(HOST + "/users/status", '', token);
  expect(res.status).toBe(200);
  expect(res.body.username).toBe(dummy.username);
  expect(res.body.status).toBe(newStatus);
});

test('Can search for status', async () => {
  const token = await registerUser(dummy);
  let data = { status: 'help' };
  await sendPost(HOST + "/users/status", data, token)
    .then((res, err) => {
      expect(res.status).toBe(200);
    });
  data = { status: 'ok' };
  await sendPost(HOST + "/users/status", data, token)
    .then((res, err) => {
      expect(res.status).toBe(200);
    });
  await sendPost(HOST + "/search", { searchType: 'privateByStatus', searchText: "", otherCitizenUsername: dummy.username }, token)
    .then((res, err) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].status).toBe('ok');
      expect(res.body[0].user.username).toBe('tp55');
      expect(res.body[1].status).toBe('help');
      expect(res.body[1].user.username).toBe('tp55');
    });
});
