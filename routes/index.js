import express from 'express';
import passport from "passport";
import Address from "../models/address.js";
const router = express.Router();
// everything under /
/* eslint-disable */

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login_page', { title: 'ESN Join' });
});

router.get('/dashboard', function (req, res, next) {
  res.render('home_page_container', { title: 'ESN Dashboard' });
});

router.get('/my-medical-supplies', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('my_medical_supplies', { title: 'ESN' });
});

router.get('/medical-supplies-exchange', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('medical_supplies_exchange', { title: 'ESN' });
});

router.get('/esn-list', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('esn_list', { title: 'ESN' });
});

router.get('/public-wall', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('public_wall', { title: 'ESN', curr_user: req.user.username });
});

router.get('/announcements-view', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('announcements', { title: 'FSE SB5 Project Announcement Wall' });
});

router.get('/medical-wall-view', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('medical_wall', { user_id: req.user._id, curr_user: req.user.username });
});

router.get('/chats', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('chats', { title: 'ESN' });
});

router.get('/search', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('search_page', { title: 'FSE SB5 Project Chat List' });
});

router.get('/private-chat', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('private_chat', { title: 'ESN' });
});

router.get('/first-aid', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('first_aid', { title: 'ESN' });
});


router.get('/users-profile-settings', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  res.render('users_profile_settings', { title: 'ESN' });
});

router.get('/healthcheck', function (req, res, next) {
  return res.status(200).json({ service: "fse-dashboard", status: "ok" });
}); 

router.get('/map', function (req, res, next) {
  res.render('map', { SERVER_LAT: 40, SERVER_LON: 50 });
});

router.get('/address-profile', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
  const user = req.user;

  const address = await Address.getAddress(user.username);
  let addressFound = false; let zipCode = ""; let streetline1 = ""; let streetline2 = ""; let city = "";
  if (address) {
    addressFound = true; zipCode = address.zipcode; city = address.city; streetline1 = address.streetline1; streetline2 = address.streetline2;
  }
  res.render('address_profile', { addressFound, zipCode, streetline1, streetline2, city });
});

export default router;
