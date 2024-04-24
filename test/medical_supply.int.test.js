import db from '../services/database.js';

// Initiate Server
import app from '../app';

import { HOST, PORT, registerUser, sendGet, sendPost, sendPut, sendDelete } from './test_util.js';

let server;
const dummy = { username: 'good-job', password: 'good-job' };
const user1 = { username: 'dominic', password: 'dominic' };
const user2 = { username: 'dom-test', password: 'dom-test-only' };

const sampleMedicalSupplyRequest = {
  supplyName: "Aspirin",
  supplyQuantity: "1",
  supplyType: "Medicine",
  exchangeType: "Request"
};

const sampleMedicalSupplyRequest1 = {
  supplyName: "Water",
  supplyQuantity: "5",
  supplyType: "Food",
  exchangeType: "Request"
};

const sampleMedicalSupplyOffer = {
  supplyName: "Bandage",
  supplyQuantity: "5",
  supplyType: "Accessories",
  exchangeType: "Offer"
};

const sampleMedicalSupplyOffer1 = {
  supplyName: "AED",
  supplyQuantity: "1",
  supplyType: "Equipment",
  exchangeType: "Offer"
};

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

/* Start Testing */
test('Can post a medical supply exchange request', async () => {
  // Register a dummy user
  const user1Token = await registerUser(user1);

  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const medicalSupply = res.body[0];
      expect(medicalSupply.user.username).toBe(user1.username);
      expect(medicalSupply.user.displayName).toBe(user1.username);
      expect(medicalSupply.supplyName).toBe(sampleMedicalSupplyRequest.supplyName);
      expect(medicalSupply.supplyQuantity).toBe(sampleMedicalSupplyRequest.supplyQuantity);
      expect(medicalSupply.supplyType).toBe(sampleMedicalSupplyRequest.supplyType);
      expect(medicalSupply.exchangeType).toBe(sampleMedicalSupplyRequest.exchangeType);
    });
});

test('Can post a medical supply exchange offer', async () => {
  // Register a dummy user
  const user2Token = await registerUser(user2);

  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const medicalSupply = res.body[0];
      expect(medicalSupply.user.username).toBe(user2.username);
      expect(medicalSupply.user.displayName).toBe(user2.username);
      expect(medicalSupply.supplyName).toBe(sampleMedicalSupplyOffer.supplyName);
      expect(medicalSupply.supplyQuantity).toBe(sampleMedicalSupplyOffer.supplyQuantity);
      expect(medicalSupply.supplyType).toBe(sampleMedicalSupplyOffer.supplyType);
      expect(medicalSupply.exchangeType).toBe(sampleMedicalSupplyOffer.exchangeType);
    });
});

test('Can get a medical supply by its id and timestamp', async () => {
  // Register a dummy user
  const user1Token = await registerUser(user1);

  let supplyID;
  let timestamp;
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      supplyID = res.body._id;
      timestamp = res.body.timestamp;
    });

  const params = `supplyID=${supplyID}&timestamp=${timestamp}`;
  await sendGet(HOST + '/medical-supplies', params, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      const medicalSupply = res.body;
      expect(medicalSupply.user.username).toBe(user1.username);
      expect(medicalSupply.user.displayName).toBe(user1.username);
      expect(medicalSupply.supplyName).toBe(sampleMedicalSupplyRequest.supplyName);
      expect(medicalSupply.supplyQuantity).toBe(sampleMedicalSupplyRequest.supplyQuantity);
      expect(medicalSupply.supplyType).toBe(sampleMedicalSupplyRequest.supplyType);
      expect(medicalSupply.exchangeType).toBe(sampleMedicalSupplyRequest.exchangeType);
    });
});

test('Can get all medical supplies from a user', async () => {
  // Register a dummy user
  const user1Token = await registerUser(user1);

  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const medicalSupplyRequest = res.body[0];
      expect(medicalSupplyRequest.user.username).toBe(user1.username);
      expect(medicalSupplyRequest.user.displayName).toBe(user1.username);
      expect(medicalSupplyRequest.supplyName).toBe(sampleMedicalSupplyRequest.supplyName);
      expect(medicalSupplyRequest.supplyQuantity).toBe(sampleMedicalSupplyRequest.supplyQuantity);
      expect(medicalSupplyRequest.supplyType).toBe(sampleMedicalSupplyRequest.supplyType);
      expect(medicalSupplyRequest.exchangeType).toBe(sampleMedicalSupplyRequest.exchangeType);
      const medicalSupplyOffer = res.body[1];
      expect(medicalSupplyOffer.user.username).toBe(user1.username);
      expect(medicalSupplyOffer.user.displayName).toBe(user1.username);
      expect(medicalSupplyOffer.supplyName).toBe(sampleMedicalSupplyOffer.supplyName);
      expect(medicalSupplyOffer.supplyQuantity).toBe(sampleMedicalSupplyOffer.supplyQuantity);
      expect(medicalSupplyOffer.supplyType).toBe(sampleMedicalSupplyOffer.supplyType);
      expect(medicalSupplyOffer.exchangeType).toBe(sampleMedicalSupplyOffer.exchangeType);
    });
});

test('Can get all medical supplies requests from users', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  const user2Token = await registerUser(user2);

  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest1, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer1, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  const queryString = 'exchangeType=Request';
  await sendGet(HOST + '/medical-supplies/supplies-by-exchange-type', queryString, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const medicalSupplyRequest = res.body[0];
      expect(medicalSupplyRequest.user.username).toBe(user1.username);
      expect(medicalSupplyRequest.user.displayName).toBe(user1.username);
      expect(medicalSupplyRequest.supplyName).toBe(sampleMedicalSupplyRequest.supplyName);
      expect(medicalSupplyRequest.supplyQuantity).toBe(sampleMedicalSupplyRequest.supplyQuantity);
      expect(medicalSupplyRequest.supplyType).toBe(sampleMedicalSupplyRequest.supplyType);
      expect(medicalSupplyRequest.exchangeType).toBe(sampleMedicalSupplyRequest.exchangeType);
      const medicalSupplyRequest1 = res.body[1];
      expect(medicalSupplyRequest1.user.username).toBe(user2.username);
      expect(medicalSupplyRequest1.user.displayName).toBe(user2.username);
      expect(medicalSupplyRequest1.supplyName).toBe(sampleMedicalSupplyRequest1.supplyName);
      expect(medicalSupplyRequest1.supplyQuantity).toBe(sampleMedicalSupplyRequest1.supplyQuantity);
      expect(medicalSupplyRequest1.supplyType).toBe(sampleMedicalSupplyRequest1.supplyType);
      expect(medicalSupplyRequest1.exchangeType).toBe(sampleMedicalSupplyRequest1.exchangeType);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-exchange-type', queryString, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const medicalSupplyRequest = res.body[0];
      expect(medicalSupplyRequest.user.username).toBe(user1.username);
      expect(medicalSupplyRequest.user.displayName).toBe(user1.username);
      expect(medicalSupplyRequest.supplyName).toBe(sampleMedicalSupplyRequest.supplyName);
      expect(medicalSupplyRequest.supplyQuantity).toBe(sampleMedicalSupplyRequest.supplyQuantity);
      expect(medicalSupplyRequest.supplyType).toBe(sampleMedicalSupplyRequest.supplyType);
      expect(medicalSupplyRequest.exchangeType).toBe(sampleMedicalSupplyRequest.exchangeType);
      const medicalSupplyRequest1 = res.body[1];
      expect(medicalSupplyRequest1.user.username).toBe(user2.username);
      expect(medicalSupplyRequest1.user.displayName).toBe(user2.username);
      expect(medicalSupplyRequest1.supplyName).toBe(sampleMedicalSupplyRequest1.supplyName);
      expect(medicalSupplyRequest1.supplyQuantity).toBe(sampleMedicalSupplyRequest1.supplyQuantity);
      expect(medicalSupplyRequest1.supplyType).toBe(sampleMedicalSupplyRequest1.supplyType);
      expect(medicalSupplyRequest1.exchangeType).toBe(sampleMedicalSupplyRequest1.exchangeType);
    });
});

test('Can get all medical supplies offers from users', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  const user2Token = await registerUser(user2);

  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest1, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer1, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  const queryString = 'exchangeType=Offer';
  await sendGet(HOST + '/medical-supplies/supplies-by-exchange-type', queryString, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const medicalSupplyOffer = res.body[0];
      expect(medicalSupplyOffer.user.username).toBe(user1.username);
      expect(medicalSupplyOffer.user.displayName).toBe(user1.username);
      expect(medicalSupplyOffer.supplyName).toBe(sampleMedicalSupplyOffer.supplyName);
      expect(medicalSupplyOffer.supplyQuantity).toBe(sampleMedicalSupplyOffer.supplyQuantity);
      expect(medicalSupplyOffer.supplyType).toBe(sampleMedicalSupplyOffer.supplyType);
      expect(medicalSupplyOffer.exchangeType).toBe(sampleMedicalSupplyOffer.exchangeType);
      const medicalSupplyOffer1 = res.body[1];
      expect(medicalSupplyOffer1.user.username).toBe(user2.username);
      expect(medicalSupplyOffer1.user.displayName).toBe(user2.username);
      expect(medicalSupplyOffer1.supplyName).toBe(sampleMedicalSupplyOffer1.supplyName);
      expect(medicalSupplyOffer1.supplyQuantity).toBe(sampleMedicalSupplyOffer1.supplyQuantity);
      expect(medicalSupplyOffer1.supplyType).toBe(sampleMedicalSupplyOffer1.supplyType);
      expect(medicalSupplyOffer1.exchangeType).toBe(sampleMedicalSupplyOffer1.exchangeType);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-exchange-type', queryString, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const medicalSupplyOffer = res.body[0];
      expect(medicalSupplyOffer.user.username).toBe(user1.username);
      expect(medicalSupplyOffer.user.displayName).toBe(user1.username);
      expect(medicalSupplyOffer.supplyName).toBe(sampleMedicalSupplyOffer.supplyName);
      expect(medicalSupplyOffer.supplyQuantity).toBe(sampleMedicalSupplyOffer.supplyQuantity);
      expect(medicalSupplyOffer.supplyType).toBe(sampleMedicalSupplyOffer.supplyType);
      expect(medicalSupplyOffer.exchangeType).toBe(sampleMedicalSupplyOffer.exchangeType);
      const medicalSupplyOffer1 = res.body[1];
      expect(medicalSupplyOffer1.user.username).toBe(user2.username);
      expect(medicalSupplyOffer1.user.displayName).toBe(user2.username);
      expect(medicalSupplyOffer1.supplyName).toBe(sampleMedicalSupplyOffer1.supplyName);
      expect(medicalSupplyOffer1.supplyQuantity).toBe(sampleMedicalSupplyOffer1.supplyQuantity);
      expect(medicalSupplyOffer1.supplyType).toBe(sampleMedicalSupplyOffer1.supplyType);
      expect(medicalSupplyOffer1.exchangeType).toBe(sampleMedicalSupplyOffer1.exchangeType);
    });
});

test('Can specify amount for getting medical supplies exchange', async () => {
  // Register two dummy users
  const user1Token = await registerUser(user1);
  const user2Token = await registerUser(user2);

  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest1, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer1, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  const queryStringRequest = 'exchangeType=Request&amount=1';
  await sendGet(HOST + '/medical-supplies/supplies-by-exchange-type', queryStringRequest, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const medicalSupplyRequest = res.body[0];
      expect(medicalSupplyRequest.user.username).toBe(user2.username);
      expect(medicalSupplyRequest.user.displayName).toBe(user2.username);
      expect(medicalSupplyRequest.supplyName).toBe(sampleMedicalSupplyRequest.supplyName);
      expect(medicalSupplyRequest.supplyQuantity).toBe(sampleMedicalSupplyRequest.supplyQuantity);
      expect(medicalSupplyRequest.supplyType).toBe(sampleMedicalSupplyRequest.supplyType);
      expect(medicalSupplyRequest.exchangeType).toBe(sampleMedicalSupplyRequest.exchangeType);
    });

  const queryStringOffer = 'exchangeType=Offer&amount=2';
  await sendGet(HOST + '/medical-supplies/supplies-by-exchange-type', queryStringOffer, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const medicalSupplyOffer = res.body[0];
      expect(medicalSupplyOffer.user.username).toBe(user2.username);
      expect(medicalSupplyOffer.user.displayName).toBe(user2.username);
      expect(medicalSupplyOffer.supplyName).toBe(sampleMedicalSupplyOffer.supplyName);
      expect(medicalSupplyOffer.supplyQuantity).toBe(sampleMedicalSupplyOffer.supplyQuantity);
      expect(medicalSupplyOffer.supplyType).toBe(sampleMedicalSupplyOffer.supplyType);
      expect(medicalSupplyOffer.exchangeType).toBe(sampleMedicalSupplyOffer.exchangeType);
      const medicalSupplyOffer1 = res.body[1];
      expect(medicalSupplyOffer1.user.username).toBe(user2.username);
      expect(medicalSupplyOffer1.user.displayName).toBe(user2.username);
      expect(medicalSupplyOffer1.supplyName).toBe(sampleMedicalSupplyOffer1.supplyName);
      expect(medicalSupplyOffer1.supplyQuantity).toBe(sampleMedicalSupplyOffer1.supplyQuantity);
      expect(medicalSupplyOffer1.supplyType).toBe(sampleMedicalSupplyOffer1.supplyType);
      expect(medicalSupplyOffer1.exchangeType).toBe(sampleMedicalSupplyOffer1.exchangeType);
    });
});

test('Can correct specified amount to default amout if parsing failed', async () => {
  // Register a dummy user
  const user2Token = await registerUser(user2);

  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  const queryStringRequest = 'exchangeType=Request&amount=aed';
  await sendGet(HOST + '/medical-supplies/supplies-by-exchange-type', queryStringRequest, user2Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const medicalSupplyRequest = res.body[0];
      expect(medicalSupplyRequest.user.username).toBe(user2.username);
      expect(medicalSupplyRequest.user.displayName).toBe(user2.username);
      expect(medicalSupplyRequest.supplyName).toBe(sampleMedicalSupplyRequest.supplyName);
      expect(medicalSupplyRequest.supplyQuantity).toBe(sampleMedicalSupplyRequest.supplyQuantity);
      expect(medicalSupplyRequest.supplyType).toBe(sampleMedicalSupplyRequest.supplyType);
      expect(medicalSupplyRequest.exchangeType).toBe(sampleMedicalSupplyRequest.exchangeType);
    });
});

test('Can update a medical supply by its id', async () => {
  // Register a dummy user
  const user1Token = await registerUser(user1);

  // Create a medical supply
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  let supplyID;
  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      supplyID = res.body[0]._id;
    });

  // Update a medical supply
  const newSupply = {
    supplyName: "AED",
    supplyQuantity: "10",
    supplyType: "Equipment",
    exchangeType: "Offer"
  };
  const data = { supplyID, newSupply };
  await sendPut(HOST + '/medical-supplies', data, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const medicalSupply = res.body[0];
      expect(medicalSupply.user.username).toBe(user1.username);
      expect(medicalSupply.user.displayName).toBe(user1.username);
      expect(medicalSupply.supplyName).toBe(newSupply.supplyName);
      expect(medicalSupply.supplyQuantity).toBe(newSupply.supplyQuantity);
      expect(medicalSupply.supplyType).toBe(newSupply.supplyType);
      expect(medicalSupply.exchangeType).toBe(newSupply.exchangeType);
    });
});

test('Cannot update a medical supply by a non-existing id', async () => {
  // Register a dummy user
  const user1Token = await registerUser(user1);

  // Create a medical supply
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyRequest, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });

  // Update a medical supply
  const supplyID = "randomID";
  const newSupply = {
    supplyName: "AED",
    supplyQuantity: "10",
    supplyType: "Equipment",
    exchangeType: "Offer"
  };
  const data = { supplyID, newSupply };
  await sendPut(HOST + '/medical-supplies', data, user1Token)
    .then((res, err) => {
      fail();
    }).catch((err) => {
      expect(err).not.toBe(undefined);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const medicalSupply = res.body[0];
      expect(medicalSupply.user.username).toBe(user1.username);
      expect(medicalSupply.user.displayName).toBe(user1.username);
      expect(medicalSupply.supplyName).toBe(sampleMedicalSupplyRequest.supplyName);
      expect(medicalSupply.supplyQuantity).toBe(sampleMedicalSupplyRequest.supplyQuantity);
      expect(medicalSupply.supplyType).toBe(sampleMedicalSupplyRequest.supplyType);
      expect(medicalSupply.exchangeType).toBe(sampleMedicalSupplyRequest.exchangeType);
    });
});

test('Can delete a medical supply by its id', async () => {
  // Register a dummy user
  const user1Token = await registerUser(user1);

  // Create a medical supply
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  let supplyID;
  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      supplyID = res.body[0]._id;
    });

  // Delete a medical supply
  await sendDelete(`${HOST}/medical-supplies?supplyID=${supplyID}`, null, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(0);
    });
});

test('Cannot delete a medical supply by a non-existing id', async () => {
  // Register a dummy user
  const user1Token = await registerUser(user1);

  // Create a medical supply
  await sendPost(HOST + '/medical-supplies', sampleMedicalSupplyOffer, user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
    });

  const supplyID = "randomID";
  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });

  // Delete a medical supply
  await sendDelete(`${HOST}/medical-supplies?supplyID=${supplyID}`, null, user1Token)
    .then((res, err) => {
      fail();
    }).catch((err) => {
      expect(err).not.toBe(undefined);
    });

  await sendGet(HOST + '/medical-supplies/supplies-by-creator', '', user1Token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      const medicalSupply = res.body[0];
      expect(medicalSupply.user.username).toBe(user1.username);
      expect(medicalSupply.user.displayName).toBe(user1.username);
      expect(medicalSupply.supplyName).toBe(sampleMedicalSupplyOffer.supplyName);
      expect(medicalSupply.supplyQuantity).toBe(sampleMedicalSupplyOffer.supplyQuantity);
      expect(medicalSupply.supplyType).toBe(sampleMedicalSupplyOffer.supplyType);
      expect(medicalSupply.exchangeType).toBe(sampleMedicalSupplyOffer.exchangeType);
    });
});

test('user can search for their own medical supplies', async () => {
  const token = await registerUser(dummy);
  const medicalSupply1 = {
    supplyName: "Aspirin",
    supplyQuantity: "1",
    supplyType: "Medicine",
    exchangeType: "Request"
  };

  const medicalSupply2 = {
    supplyName: "Water",
    supplyQuantity: "1",
    supplyType: "Food",
    exchangeType: "Offer"
  };

  for (let i = 0; i < 3; i++) {
    const data1 = medicalSupply1;
    data1.supplyName += "-" + i;
    const data2 = medicalSupply2;
    data2.supplyName += "-" + i;

    await sendPost(HOST + "/medical-supplies", data1, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
    await sendPost(HOST + "/medical-supplies", data2, token)
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
  }

  const data = { searchType: "myMedicalSuppliesByText", searchText: "Aspirin" };
  await sendPost(HOST + "/search", data, token)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      const supply1 = res.body[0];
      expect(supply1.user.username).toBe(dummy.username);
      expect(supply1.supplyName).toBe('Aspirin-0');
      expect(supply1.supplyQuantity).toBe(medicalSupply1.supplyQuantity);
      expect(supply1.supplyType).toBe(medicalSupply1.supplyType);
      expect(supply1.exchangeType).toBe(medicalSupply1.exchangeType);
      const supply2 = res.body[1];
      expect(supply2.user.username).toBe(dummy.username);
      expect(supply2.supplyName).toBe('Aspirin-0-1');
      expect(supply2.supplyQuantity).toBe(medicalSupply1.supplyQuantity);
      expect(supply2.supplyType).toBe(medicalSupply1.supplyType);
      expect(supply2.exchangeType).toBe(medicalSupply1.exchangeType);
      const supply3 = res.body[2];
      expect(supply3.user.username).toBe(dummy.username);
      expect(supply3.supplyName).toBe('Aspirin-0-1-2');
      expect(supply3.supplyQuantity).toBe(medicalSupply1.supplyQuantity);
      expect(supply3.supplyType).toBe(medicalSupply1.supplyType);
      expect(supply3.exchangeType).toBe(medicalSupply1.exchangeType);
    });
});

test('user can search for others medical supplies', async () => {
  const token1 = await registerUser(dummy);
  const token2 = await registerUser(user1);
  const token3 = await registerUser(user2);

  const medicalSupply1 = {
    supplyName: "Aspirin",
    supplyQuantity: "1",
    supplyType: "Medicine",
    exchangeType: "Offer"
  };

  const medicalSupply2 = {
    supplyName: "Water",
    supplyQuantity: "1",
    supplyType: "Food",
    exchangeType: "Offer"
  };

  const medicalSupply3 = {
    supplyName: "Bandage",
    supplyQuantity: "1",
    supplyType: "Accessories",
    exchangeType: "Offer"
  };

  const supplyList = [medicalSupply1, medicalSupply2, medicalSupply3];
  const tokenList = [token1, token2, token3];

  for (let i = 0; i < 3; i++) {
    const data = supplyList[i];

    await sendPost(HOST + "/medical-supplies", data, tokenList[i])
      .then((res, err) => {
        expect(err).toBe(undefined);
        expect(res.statusCode).toBe(200);
      });
  }

  const data = { searchType: "medicalSuppliesExchangeByText", searchText: "a", exchangeType: "Offer" };
  await sendPost(HOST + "/search", data, token1)
    .then((res, err) => {
      expect(err).toBe(undefined);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      const supply1 = res.body[0];
      expect(supply1.user.username).toBe(user1.username);
      expect(supply1.supplyName).toBe(medicalSupply2.supplyName);
      expect(supply1.supplyQuantity).toBe(medicalSupply2.supplyQuantity);
      expect(supply1.supplyType).toBe(medicalSupply2.supplyType);
      expect(supply1.exchangeType).toBe(medicalSupply2.exchangeType);
      const supply2 = res.body[1];
      expect(supply2.user.username).toBe(user2.username);
      expect(supply2.supplyName).toBe(medicalSupply3.supplyName);
      expect(supply2.supplyQuantity).toBe(medicalSupply3.supplyQuantity);
      expect(supply2.supplyType).toBe(medicalSupply3.supplyType);
      expect(supply2.exchangeType).toBe(medicalSupply3.exchangeType);
    });
});
