// Saves a message
import express from 'express';
import Address from "../models/address.js";
const router = express.Router();

router.post('/', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user;
  const streetline1 = req.body.streetline1;
  const streetline2 = req.body.streetline2;
  const city = req.body.city;
  const zipcode = req.body.zipCode;
  const address = await Address.createAddress(user, streetline1, streetline2, city, zipcode);
  return res.status(200).json(address);
});

router.put('/', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user;
  const streetline1 = req.body.streetline1;
  const streetline2 = req.body.streetline2;
  const city = req.body.city;
  const zipcode = req.body.zipCode;
  const address = await Address.updateAddress(user, streetline1, streetline2, city, zipcode);
  return res.status(200).json(address);
});

router.get('/', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const username = req.query.username;
  const address = await Address.getAddress(username);
  return res.status(200).json(address);
});

router.delete('/', async function (req, res, next) { // eslint-disable-line no-unused-vars
  const user = req.user;
  await Address.deleteAddress(user);
  return res.status(200).json({ success: true });
});

export default router;
