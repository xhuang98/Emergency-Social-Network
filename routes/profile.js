import express from 'express';
import UserAuth from "../models/user_auth.js";
import User from "../models/user.js";

const router = express.Router();

router.put('/active', isAdmin, async function (req, res, next) {
    const username = req.body.username;
    const accountStatus = req.body.newAccountStatus;
    await User.changeAccountStatus(username, accountStatus);
    return res.status(200).json({ changed: true });
});

router.put('/role', isAdmin, async function (req, res, next) {
    const username = req.body.username;
    const role = req.body.newRole;
    await User.changeUserRole(username, role);
    return res.status(200).json({ changed: true });
});

router.put('/username', isAdmin, async function (req, res, next) {
    const username = req.body.username;
    const newUsername = req.body.newUsername;

    const validationResult = await UserAuth.validateUsername(newUsername);
    if (validationResult && validationResult.error) {
        return res.status(500).json({ error: validationResult.error });
    }

    await UserAuth.changeUsername(username, newUsername);
    await User.changeUsername(username, newUsername);
    return res.status(200).json({ changed: true });
});

router.put('/password', isAdmin, async function (req, res, next) {
    const username = req.body.username;
    const newPassword = req.body.newPassword;

    const validationResult = await UserAuth.validatePasswordLength(newPassword);
    if (validationResult && validationResult.error) {
        return res.status(500).json({ error: validationResult.error });
    }

    const salt = await UserAuth.generateSalt();
    const hashedPassword = await UserAuth.hashPassword(newPassword, salt);
    await UserAuth.changePassword(username, hashedPassword, salt);
    return res.status(200).json({ changed: true});
});

const ADMINISTRATOR = 'administrator';
function isAdmin(req, res, next) {
    const user = req.user;
    if(user.role === ADMINISTRATOR) return next();
    return res.status(403).json({ admin: true });
}

export default router;