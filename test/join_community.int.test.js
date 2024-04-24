import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost } from './test_util.js';

let server;
const dummy = { username: 'dominic', password: 'dominic' };
const user1 = { username: 'dominichu', password: 'domdomdomdom' };
const user2 = { username: 'abc55', password: 'abc55' };

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

// Tests for POST /users/validation
test('User cannot join community with a username less than 3 characters long', async () => {
  const data = { username: "do", password: "dominic" };
  await sendPost(HOST + "/users/validation", data, null)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.validation_success).toBe(false);
      expect(res.body.message).toBe("Username needs to be at least 3 characters long.");
    });
});

test('User cannot join community with a password less than 4 characters long', async () => {
  const data = { username: "dominic", password: "dom" };
  await sendPost(HOST + "/users/validation", data, null)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.validation_success).toBe(false);
      expect(res.body.message).toBe("Password needs to be at least 4 characters long.");
    });
});

test('User cannot join community with a restricted username', async () => {
  const data = { username: "admin", password: "dominic" };
  await sendPost(HOST + "/users/validation", data, null)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.validation_success).toBe(false);
      expect(res.body.message).toBe("Entered username is not allowed.");
    });
});

test('User can join community with a valid username and password', async () => {
  const data = { username: "dominic", password: "dominic" };
  await sendPost(HOST + "/users/validation", data, null)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.validation_success).toBe(true);
      expect(res.body.user_exists).toBe(false);
      expect(res.body.message).toBe("Passed username and password validation.");
    });
});

test('User cannot re-join community with an existing username', async () => {
  await registerUser(dummy);
  const data = { username: "dominic", password: "domdomdomdom" };
  await sendPost(HOST + "/users/validation", data, null)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.validation_success).toBe(true);
      expect(res.body.user_exists).toBe(true);
      expect(res.body.message).toBe("Passed username and password validation.");
    });
});

// Tests for POST /users/registration
test('Can register a user account', async () => {
  const userToken = await registerUser(user1);

  // Check if we persist the registered account info
  await sendGet(HOST + "/users", '', userToken)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe(user1.username.toLowerCase());
      expect(res.body[0].displayName).toBe(user1.username);
      expect(res.body[0].acknowledgedRules).toBe(false);
      expect(res.body[0].active).toBe(false);
    });
});

// Tests for POST /users/login
test('Can login a user account', async () => {
  await registerUser(user1);

  await sendPost(HOST + "/users/authentication", user1, null)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.acknowledgedRules).toBe(false);
      // expect(res.body.token).toBe(userToken);
    });
});

// Tests for POST /users/token-validation
test('Can validate a loggedin user token', async () => {
  const userToken = await registerUser(user1);

  await sendPost(HOST + "/users/token-validation", null, userToken)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.acknowledgedRules).toBe(false);
    });
});

// Tests for GET /users
test('Can get sorted users', async () => {
  const userToken = await registerUser(user1);
  await registerUser(dummy);
  await registerUser(user2);

  await sendGet(HOST + "/users", '', userToken)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      const firstSortedUser = res.body[0];
      expect(firstSortedUser.username).toBe(user2.username.toLowerCase());
      expect(firstSortedUser.displayName).toBe(user2.username);
      expect(firstSortedUser.acknowledgedRules).toBe(false);
      expect(firstSortedUser.active).toBe(false);
      const secondSortedUser = res.body[1];
      expect(secondSortedUser.username).toBe(dummy.username.toLowerCase());
      expect(secondSortedUser.displayName).toBe(dummy.username);
      expect(secondSortedUser.acknowledgedRules).toBe(false);
      expect(secondSortedUser.active).toBe(false);
      const thirdSortedUser = res.body[2];
      expect(thirdSortedUser.username).toBe(user1.username.toLowerCase());
      expect(thirdSortedUser.displayName).toBe(user1.username);
      expect(thirdSortedUser.acknowledgedRules).toBe(false);
      expect(thirdSortedUser.active).toBe(false);
    });
});
