
import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost } from './test_util.js';
import { expect } from '@jest/globals';

let server;
const dummy = { username: 'kishan', password: 'kishanK' };
const user1 = { username: 'dell', password: 'demoPerson' };
const user2 = { username: 'emo', password: 'demoPerson2' };

beforeAll(async () => {
  await db.connectionFactory(true);
  server = await app.listen(PORT);
});

afterEach(async () => await db.clearDatabase());

afterAll(async () => {
  await db.closeTestingDatabase();
  await server.close();
});

test('User exist in the database with a valid username and password', async () => {
  await registerUser(dummy);
  await sendPost(HOST + "/users/validation", dummy, null)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.validation_success).toBe(true);
      expect(res.body.user_exists).toBe(true);
      expect(res.body.message).toBe("Passed username and password validation.");
    });
});

test('User can acknowledge the rules', async () => {
  const userToken = await registerUser(user1);
  await sendPost(HOST + "/users/acknowledgment", '', userToken)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe(user1.username);
      expect(res.body.acknowledgedRules).toBe(true);
    });
});

test('User login with correct username and password', async () => {
  await registerUser(dummy);
  await sendPost(HOST + "/users/authentication", dummy, null)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.acknowledgedRules).toBe(false);
      // expect(res.body.token).toBe(userToken);
    });
});

// Tests for GET /users
test('User can see his name on ESN List', async () => {
  const userToken = await registerUser(dummy);
  await registerUser(user1);
  await registerUser(user2);

  await sendGet(HOST + "/users", '', userToken)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      const firstSortedUser = res.body[0];
      expect(firstSortedUser.username).toBe(user1.username.toLowerCase());
      expect(firstSortedUser.displayName).toBe(user1.username);
      expect(firstSortedUser.acknowledgedRules).toBe(false);
      expect(firstSortedUser.active).toBe(false);
      const secondSortedUser = res.body[1];
      expect(secondSortedUser.username).toBe(user2.username.toLowerCase());
      expect(secondSortedUser.displayName).toBe(user2.username);
      expect(secondSortedUser.acknowledgedRules).toBe(false);
      expect(secondSortedUser.active).toBe(false);
      const thirdSortedUser = res.body[2];
      expect(thirdSortedUser.username).toBe(dummy.username.toLowerCase());
      expect(thirdSortedUser.displayName).toBe(dummy.username);
      expect(thirdSortedUser.acknowledgedRules).toBe(false);
      expect(thirdSortedUser.active).toBe(false);
    });
});

// Tests for GET /users
test('non logged in users will not be able to access acknowledgement', async () => {
  await sendPost(HOST + "/users/acknowledgement", '', null)
    .then((res, err) => {
      fail();
    }).catch((err) => {
      expect(err).not.toBe(undefined);
    });
});

test('non logged in users will not be able to post status', async () => {
  await sendPost(HOST + "/users/status", '', null)
    .then((res, err) => {
      fail();
    }).catch((err) => {
      expect(err).not.toBe(undefined);
    });
});

test('non logged in users will not be able to get status', async () => {
  await sendGet(HOST + "/users/status", '', null)
    .then((res, err) => {
      fail();
    }).catch((err) => {
      expect(err).not.toBe(undefined);
    });
});
