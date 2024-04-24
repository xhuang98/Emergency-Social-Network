import block from "../blocker.js";
import { jest } from "@jest/globals";

test('block website and check for normal user', () => {
  jest.useFakeTimers();
  block.blocker.blockWebsite(50);
  const res = {
    status (number) {
      expect(number).toBe(401);
      return this;
    },
    json (value) {
      expect(value).toStrictEqual({ blocked: true });
    }
  };
  const req = {
    query: {}
  };
  block.blockedMiddleware(req, res, null);
});

test('block website and check for admin user', () => {
  jest.useFakeTimers();
  block.blocker.blockWebsite(50);
  const res = {
    status (number) {
      expect(number).toBe(200);
      return this;
    },
    json (value) {
      expect(value).not.toStrictEqual({ blocked: true });
    }
  };
  function next () {

  }
  const req = {
    query: {
      admin: true
    }
  };

  block.blockedMiddleware(req, res, next);
});
