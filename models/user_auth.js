import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from "fs";
import User from "./user.js";
import passport from "passport";
import LocalStrategy from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
const SALT_WORK_FACTOR = 10;

class UserAuthClass {

  static getUserByUsername (username) {
    return this.findOne({ username });
  }

  static async signUpUser (username, password) {
    const displayName = username;
    username = username.toLowerCase();
    const usernameExists = await this.validateUserExists(username);
    if (usernameExists.user_exists) {
      return { error: "Username already exists" };
    }
    const salt = await this.generateSalt();
    const hashedPassword = await this.hashPassword(password, salt);
    const userAuth = new this({ username, password: hashedPassword, salt });
    await userAuth.save();
    const user = new User({ username, displayName });
    const userSave = await user.save();

    return {
      id: userSave._id,
      username
    };
  }

  // Login security

  static async generateSalt () {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) reject(err);
        // hash the password using our new salt
        resolve(salt);
      });
    });
  }


  static hashPassword (password, salt) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, salt, function (err, hashedPassword) {
        if (err) reject(err);
        // return a user with hashed password and salt
        resolve(hashedPassword);
      });
    });
  }


  static async validateUserExists (username) {
    const user = await UserAuth.getUserByUsername(username);
    if (user) {
      return {
        user_exists: true,
        user
      };
    }
    return {
      user_exists: false
    };
  }

  // validation functions
  static async validateUsername(username) {
    let response = this.validateUsernameLength(username);
    if (response.error) return response;
    
    response = this.validateNonRestrictedUsername(username);
    if (response.error) return response;

    response = await this.validateUserExists(username);
    if (response.user_exists) return { error: 'Username already exists.' };
    return response;
  }

  static validateUsernameAndPassword(username, password) {
    let response = this.validateUsernameAndPasswordLength(username, password);
    if (response.error && response.error.length > 0) {
      return response;
    }
    response = this.validateNonRestrictedUsername(username);
    return response;
  }

  // Validation
  static validateUsernameLength(username) {
    const minUsernameLength = 3;

    if (username.length < minUsernameLength) {
      const errorMessage = 'Username needs to be at least 3 characters long.';
      return { error: errorMessage };
    }
    return {};
  }

  static validatePasswordLength(password) {
    const minPasswordLength = 4;

    if (password.length < minPasswordLength) {
      const errorMessage = 'Password needs to be at least 4 characters long.';
      return { error: errorMessage };
    }
    return {};
  }

  static validateUsernameAndPasswordLength(username, password) {
    let usernameError = this.validateUsernameLength(username);
    let passwordError = this.validatePasswordLength(password);
    let errorMessage = '';
    if (usernameError.error) errorMessage += usernameError.error;
    if (passwordError.error) errorMessage += passwordError.error;
    return { error: errorMessage };
  }


  static validateNonRestrictedUsername (username) {
    const filepath = './data/reserved_users.json';

    // maybe changing this to only reading the file once and storing it in memory is better.
    const reservedUsers = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    if (reservedUsers.includes(username)) {
      return { error: 'Entered username is not allowed.' };
    }
    return {};
  }

  static async changeUsername(username, newUsername) {
    const user = await this.findOne({username});
    user.username = newUsername.toLowerCase();
    user.save();
  }

  static async changePassword(username, newHashedPassword, salt) {
    const user = await this.findOne({username});
    user.password = newHashedPassword;
    user.salt = salt;
    await user.save();
    await User.emitUserAccountSettingsChangedMessage(user);
  }
}

const UserAuthSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
});

UserAuthSchema.loadClass(UserAuthClass);

const UserAuth = mongoose.model('UserAuth', UserAuthSchema);

passport.use(new LocalStrategy(async function verify (username, password, cb) {
  username = username.toLowerCase();
  const userExists = await UserAuth.validateUserExists(username);
  if (!userExists.user_exists) {
    return cb(null, false, { message: 'Incorrect username or password.' });
  }
  const userAuth = userExists.user;
  const hashedPasswordInput = await UserAuth.hashPassword(password, userAuth.salt);

  if (hashedPasswordInput !== userAuth.password) {
    return cb(null, false, { message: 'Incorrect username or password.' });
  }
  const userProfile = await User.getUserByUsername(username);
  return cb(null, userProfile);
}));

passport.use(new JWTStrategy({
  secretOrKey: 'keyboard cat',
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}, async (token, done) => {
  try {
    const user = await User.getUserByUsername(token.user.username);
    if (user != null) {
      return done(null, user);
    }
    done(new Error("couldnt find user."));
  } catch (error) {
    done(error);
  }
}
)
);

export default UserAuth;
