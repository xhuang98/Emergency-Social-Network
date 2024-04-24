import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost, sendPut } from './test_util.js';

let server;
let token;
const dummy = { username: 'tp55', password: 'tp55' };

beforeAll(async () => {
  app.set('testing', true);
  await db.connectionFactory(true);
  server = await app.listen(PORT);
  await sendPost(HOST + "/users/authentication", {username: "esnadmin", password: "admin"}, null)
          .then((res, err) => {
              expect(err).toBe(undefined);
              expect(res.statusCode).toBe(200);
              token = res.body.token;
          });

});

afterEach(async () => {
    await db.clearDatabase();
    await db.seedDatabase();
});

afterAll(async () => {
  if (server) { await server.close(); }
  if (db) { await db.closeTestingDatabase(); }
});



test('Can update a password', async () => {
    await registerUser(dummy);
    await sendPut(HOST + "/profile/password", {username: "tp55", newPassword: "sunnydope"}, token)
        .then((res, err) => {
            expect(err).toBe(undefined);
        });


    await sendPost(HOST + "/users/authentication", {username: "tp55", password: "sunnydope"}, null)
        .then((res, err) => {
            expect(err).toBe(undefined);
            expect(res.statusCode).toBe(200);
        });
});
// Happy paths tests

test('Can update a username', async () => {
  await registerUser(dummy);

  await sendPut(HOST + "/profile/username", {username: "tp55", newUsername: "sunnydope"}, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
    });

    await sendPost(HOST + "/users/validation", {username: "sunnydope", password: "tp55"}, null)
        .then((res, err) => {
          expect(err).toBe(undefined);
          expect(res.statusCode).toBe(200);
          expect(res.body.validation_success).toBe(true);
          expect(res.body.user_exists).toBe(true);
          expect(res.body.message).toBe("Passed username and password validation.");
        });
});


test('Can update a role', async () => {
    const usertoken = await registerUser(dummy);

    await sendPut(HOST + "/profile/role", {username: "tp55", newRole: "administrator"}, token)
        .then((res, err) => {
            expect(err).toBe(undefined);
            expect(res.body.changed).toBe(true);
        });
    await sendGet(HOST + "/users/user", '',usertoken)
        .then((res, err) => {
            const user = res.body;
            expect(err).toBe(undefined);
            expect(user.role).toBe('administrator');
            expect(user.username).toBe('tp55');
        });

});

test('Can update user status', async () => {
    const usertoken = await registerUser(dummy);

    await sendPut(HOST + "/profile/active", {username: "tp55", newAccountStatus: "inactive"}, token)
        .then((res, err) => {
            expect(err).toBe(undefined);
            expect(res.body.changed).toBe(true);
        });
    await sendGet(HOST + "/users/user", '',usertoken)
        .then((res, err) => {
            const user = res.body;
            expect(err).toBe(undefined);
            expect(user.accountStatus).toBe('inactive');
            expect(user.username).toBe('tp55');
        });

});
