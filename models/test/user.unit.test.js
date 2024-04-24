import User from "../user.js";
import testUtil from "./test_util.js";
import { jest } from '@jest/globals';

test('whether user list is sorted', () => {
  const unsortedUserArray = [{ username: 'xihuang', displayName: 'XiHuang', active: false },
    { username: 'sunny', displayName: 'Sunny', active: false },
    { username: 'kishan', displayName: 'Kishan', active: true },
    { username: 'chris', displayName: 'Chris', active: true },
    { username: 'dom', displayName: 'Dom', active: false }];

  const targetUserArray = [{ username: 'chris', displayName: 'Chris', active: true },
    { username: 'kishan', displayName: 'Kishan', active: true },
    { username: 'dom', displayName: 'Dom', active: false },
    { username: 'sunny', displayName: 'Sunny', active: false },
    { username: 'xihuang', displayName: 'XiHuang', active: false }];

  const sortedUserArray = User.sortUsers(unsortedUserArray);

  expect(sortedUserArray).toEqual(targetUserArray);
});

test('user can be set to active', async () => {
  const user = testUtil.getTestUser();
  jest.spyOn(user, 'save').mockImplementation(() => {});
  user.setActive(true);
  expect(user.active).toEqual(true);
});

test('user can acknowledge rules', async () => {
  const user = testUtil.getTestUser();
  jest.spyOn(user, 'save').mockImplementation(() => {});
  user.updateAcknowledgedRules();
  expect(user.acknowledgedRules).toEqual(true);
});

test('all users can be set to offline', async () => {
  const users = [
    User.createUser('chris'),
    User.createUser('xi'),
    User.createUser('sunny')
  ];

  jest.spyOn(User, 'getAllUsers').mockImplementation(() => users);

  for (const user of users) {
    jest.spyOn(user, 'save').mockImplementation(() => {});
    user.active = true;
    expect(user.active).toEqual(true);
  }

  await User.setAllUsersOffline();
  for (const user of users) {
    expect(user.active).toEqual(false);
  }  
});