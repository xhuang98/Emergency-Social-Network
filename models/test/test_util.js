import User from "../user.js";
import { jest } from '@jest/globals';

export function getTestUser (displayName = 'TestKishan') {
  jest.spyOn(User, 'getUserByUsername').mockImplementation(() => {
    return User.createUser(displayName);
  });
  return User.getUserByUsername(displayName.toLowerCase());
}

export default { getTestUser };
