import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost } from './test_util.js';

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
test('Can post an announcement', async () => {
  const token = await registerUser(dummy);
  const data = { text: "test" };
  await sendPost(HOST + "/announcements", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/announcements", '', token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      const message = res.body[0];
      expect(message.user.username).toBe(dummy.username);
      expect(message.text).toBe("test");
    });
});

test('Can get latest announcements with amount specified', async () => {
  const token = await registerUser(dummy);
  const announcementData1 = { text: "test text 1" };
  const announcementData2 = { text: "test text 2" };
  await sendPost(HOST + "/announcements", announcementData1, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });
  await sendPost(HOST + "/announcements", announcementData2, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

  await sendGet(HOST + "/announcements", "amount=2", token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.body.length).toBe(2);
      const message1 = res.body[0];
      expect(message1.user.username).toBe(dummy.username);
      expect(message1.text).toBe(announcementData1.text);
      const message2 = res.body[1];
      expect(message2.user.username).toBe(dummy.username);
      expect(message2.text).toBe(announcementData2.text);
    });
});
