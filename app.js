import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import blocker from "./services/blocker.js";

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import medicalSuppliesRouter from './routes/medical_supplies.js';
import announcementRouter from './routes/announcements.js';
import authorizationRouter from './routes/authorization.js';
import publicMessagesRouter from './routes/public_messages.js';
import privateMessagesRouter from './routes/private_messages.js';
import privateNotificationsRouter from './routes/private_notification.js';
import medicalRequestsRouter from './routes/medical_requests.js';
import firstAidRouter from './routes/first_aid.js';
import medicalCertificateRouter from './routes/medical_certificate.js';
import blockRouter from './routes/block.js';
import searchRouter from './routes/search.js';
import medicalProviderRouter from './routes/medical_providers.js';
import addressRouter from './routes/address.js';
import medicalRouter from './routes/medical_alerts.js';
import profileRouter from './routes/profile.js';
import passport from "passport";
import fileUpload from 'express-fileupload';

const app = express();

const __filename = fileURLToPath(import.meta.url);
// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap-icons/font")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));
app.use("/js", express.static(path.join(__dirname, "node_modules/blueimp-md5/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/moment/min")));

app.use(passport.initialize());

app.use('/users', blocker.blockedMiddleware, usersRouter, authorizationRouter);
app.use('/medical-supplies', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), medicalSuppliesRouter);
app.use('/announcements', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), announcementRouter);
app.use('/first-aid-instructions', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), firstAidRouter);
app.use('/medical-certificates', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), medicalCertificateRouter);
app.use('/public-messages', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), publicMessagesRouter);
app.use('/medical-requests', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), medicalRequestsRouter);
app.use('/private-messages', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), privateMessagesRouter);
app.use('/search', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), searchRouter);
app.use('/block', passport.authenticate('jwt', { session: false }), blockRouter);
app.use('/', blocker.blockedMiddleware, indexRouter);
app.use('/private-notifications', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), privateNotificationsRouter);
app.use('/medical-providers', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), medicalProviderRouter);
app.use('/address', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), addressRouter);
app.use('/medical-alerts', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), medicalRouter);
app.use('/profile', blocker.blockedMiddleware, passport.authenticate('jwt', { session: false }), profileRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler for dev environment
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
