import UserAuth from "../user_auth.js";

// validateUsernameAndPasswordLength() username >= 3, password >= 4
describe('validate username and password length', () => {
  test('valid username and password', () => {
    const username = 'sunny';
    const password = 'issuperficial';

    const error = UserAuth.validateUsernameAndPasswordLength(username, password).error;
    expect(error).toBe('');
  });
  test('invalid username', () => {
    const username = 'xi';
    const password = 'isalsosuperficial';

    const error = UserAuth.validateUsernameAndPasswordLength(username, password).error;
    expect(error).not.toBe(undefined);
    expect(error).not.toBe('');
  });
  test('invalid password', () => {
    const username = 'kishmar';
    const password = 'kum';

    const error = UserAuth.validateUsernameAndPasswordLength(username, password).error;
    expect(error).not.toBe(undefined);
    expect(error).not.toBe('');
  });
});

describe('validate username restriction', () => {
  test('valid username', () => {
    const username = 'sunny';

    const error = UserAuth.validateNonRestrictedUsername(username).error;
    expect(error).toBe(undefined);
  });
  test('invalid reserved username case 1', () => {
    const username = 'admin';

    const error = UserAuth.validateNonRestrictedUsername(username).error;
    expect(error).not.toBe(undefined);
    expect(error).not.toBe('');
  });
  test('invalid reserved username case 2', () => {
    const username = 'public';

    const error = UserAuth.validateNonRestrictedUsername(username).error;
    expect(error).not.toBe(undefined);
    expect(error).not.toBe('');
  });
});

describe('validate username password overall', () => {
  test('valid username and password', () => {
    const username = 'sunny';
    const password = 'password';

    const error = UserAuth.validateUsernameAndPassword(username, password).error;
    expect(error).toBe(undefined);
  });
});
