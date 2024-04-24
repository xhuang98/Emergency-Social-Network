import mongoose, { Schema } from "mongoose";
import socketService from "../services/sockets.js";
import Status from "./status.js";
import jwt from "jsonwebtoken";

const socketsByUser = {};

class UserClass {

  get socket () {
    return socketsByUser[this.username];
  }

  set socket (socket) {
    socketsByUser[this.username] = socket;
  }

  updateAcknowledgedRules () {
    this.acknowledgedRules = true;
    this.save();
    return this;
  }

  async setActive (active) {
    this.active = active;
    this.save();
    return this;
  }

  signJWT () {
    const body = { _id: this._id, username: this.username, role: this.role };
    return jwt.sign({ user: body }, 'keyboard cat');
  }

  static getUserByUsername(username) {
    return this.findOne({ username });
  }

  static getAllUsers() {
    return this.find({});
  }

  get socketService() {
    if (this._socketService) return this._socketService;
    return socketService;
  }

  set socketService (socketService) {
    this._socketService = socketService;
  }

  // status getter and setter
  get userStatus () {
    return this.status;
  }

  set userStatus (status) {
    this.status = status;
    this.save();
    // we also set a new record for status
    Status.createStatusRecord(this, this.status);
    this.emitNewStatus(status);
  }

  emitNewStatus (status) {
    this.socketService.emitMessageToClients('user_status', status);
  }

  static async setAllUsersOffline () {
    const users = await this.getAllUsers();
    for (const user of users) {
      await user.setActive(false);
    }
  }

  static async getSortedUsers () {
    const users = await this.getAllUsers();
    return this.sortUsers(users);
  }

  static sortUsers (users) {
    const usersOnline = users.filter(user => user.active === true);
    const usersOffline = users.filter(user => user.active === false);
    usersOnline.sort((a, b) => a.displayName.localeCompare(b.displayName));
    usersOffline.sort((a, b) => a.displayName.localeCompare(b.displayName));
    return usersOnline.concat(usersOffline);
  }

  static createUser (displayName) {
    const username = displayName.toLowerCase();
    return new this({ username, displayName });
  }

  static async findByPartialUsername (partialUername) {
    const users = await this.find({ displayName: { $regex: partialUername, $options: "i" } });
    return this.sortUsers(users);
  }

  static async findByStatus (status) {
    const users = await this.find({ status });
    return this.sortUsers(users);
  }

  static async emitUserAccountSettingsChangedMessage(user) {
    socketService.sendMessageToClient(user.socket, 'account_settings_changed', null);
  }

  static async changeUserRole(username, role) {
    const user = await this.getUserByUsername(username);
    user.role = role;
    user.save();
    await this.emitUserAccountSettingsChangedMessage(user);
    return user;
  }

  static async changeUsername(username, newUsername) {
    const user = await this.findOne({username});
    user.displayName = newUsername;
    user.username = user.displayName.toLowerCase();
    user.save();
    await this.emitUserAccountSettingsChangedMessage(user);
    return user;
  }

  static async changeAccountStatus(username, accountStatus) {
    const user = await this.getUserByUsername(username);
    user.accountStatus = accountStatus;
    user.save();
    if (user.accountStatus === "inactive") {
      await this.emitUserAccountSettingsChangedMessage(user);
    }
    return user;
  }

  static async validateUserIsActive(username) {
    const user = await this.getUserByUsername(username);
    return user.accountStatus === "active";
  }
}

const UserSchema = Schema({
  username: {
    type: String,
    ref: 'UserAuth',
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ok', 'help', 'emergency', 'undefined'],
    default: 'undefined'
  },
  acknowledgedRules: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['citizen', 'coordinator', 'administrator'],
    default: 'citizen'
  }, 
  accountStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

UserSchema.loadClass(UserClass);

export default mongoose.model('User', UserSchema);