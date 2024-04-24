import MedicalRequest from "../medical_request.js";
import { expect, jest, test } from "@jest/globals";
import testUtil from "./test_util.js";

const medicalRequest1 = {
  _id: "6333bcbab76bffde652d5114",
  username: "sunny",
  timestamp: "2022-11-04T22:42:47.579Z",
  description: "This is a sample medical help request.",
  helpersRequired: 5,
  helperList: [],
  __v: 0
};

const medicalRequest2 = {
  _id: "6333bcbab76bffde652d5114",
  username: "dominic",
  timestamp: "2022-11-04T22:44:47.579Z",
  description: "This is a sample medical help request.",
  helpersRequired: 5,
  helperList: ["hakan", "cecile", "karen"],
  __v: 0
};

const medicalRequest3 = {
  _id: "6333bcbab76bffde652d5114",
  username: "xi",
  timestamp: "2022-11-04T22:46:47.579Z",
  description: "This is a sample medical help request.",
  helpersRequired: 5,
  helperList: ["hakan", "cecile", "karen"],
  __v: 0
};

const medicalRequest4 = {
  _id: "6333bcbab76bffde652d5114",
  username: "kishan",
  timestamp: "2022-11-04T22:48:47.579Z",
  description: "This is a sample medical help request.",
  helpersRequired: 5,
  helperList: ["hakan", "cecile", "karen"],
  __v: 0
};

const medicalRequest5 = {
  _id: "6333bcbab76bffde652d5114",
  username: "chris",
  timestamp: "2022-11-04T22:50:47.579Z",
  description: "This is a sample medical help request.",
  helpersRequired: 5,
  helperList: ["hakan", "cecile", "karen"],
  __v: 0
};

test('whether medical requests are sorted, newest at the bottom', () => {
  const originMedicalRequest = [medicalRequest5, medicalRequest4, medicalRequest3, medicalRequest2, medicalRequest1];
  const sortedMedicalRequest = [medicalRequest1, medicalRequest2, medicalRequest3, medicalRequest4, medicalRequest5];
  const lastestMedicalRequest = MedicalRequest.sortLatestMedicalRequests(originMedicalRequest);
  expect(lastestMedicalRequest).toEqual(sortedMedicalRequest);
});

test('can add a helper', async () => {
  const user = testUtil.getTestUser();
  jest.spyOn(user, 'save').mockImplementation(() => {});
  const medicalRequest = await MedicalRequest.createMessage({ username: "hakan" }, "nice", 3);
  jest.spyOn(medicalRequest, 'save').mockImplementation(() => {});
  medicalRequest.addHelper(user);
  expect(medicalRequest.helperList.length).toBe(1);
  expect(medicalRequest.helperList[0]).toBe(user._id);
});

test('can not add a helper when the status is closed', async () => {
  const user = testUtil.getTestUser();
  jest.spyOn(user, 'save').mockImplementation(() => {});
  const medicalRequest = await MedicalRequest.createMessage({ username: "hakan" }, "nice", 3);
  jest.spyOn(medicalRequest, 'save').mockImplementation(() => {});
  medicalRequest.status = "Closed";
  medicalRequest.addHelper(user);
  expect(medicalRequest.helperList.length).toBe(0);
});

test('can remove a helper', async () => {
  const user = testUtil.getTestUser();
  jest.spyOn(user, 'save').mockImplementation(() => {});
  const medicalRequest = await MedicalRequest.createMessage({ username: "hakan" }, "nice", 3);

  jest.spyOn(medicalRequest, 'save').mockImplementation(() => {});
  medicalRequest.addHelper(user);
  expect(medicalRequest.helperList.length).toBe(1);
  expect(medicalRequest.helperList[0]).toBe(user._id);
  medicalRequest.removeHelper(user);
  expect(medicalRequest.helperList.length).toBe(0);
});

test('status can be closed', async () => {
  const user = testUtil.getTestUser();
  jest.spyOn(user, 'save').mockImplementation(() => {});
  const medicalRequest = await MedicalRequest.createMessage({ username: "hakan" }, "nice", 1);
  jest.spyOn(medicalRequest, 'save').mockImplementation(() => {});
  medicalRequest.addHelper(user);
  expect(medicalRequest.helperList.length).toBe(1);
  expect(medicalRequest.helperList[0]).toBe(user._id);
  expect(medicalRequest.status).toBe("Closed");
});

test('status can be turn active again', async () => {
  const user = testUtil.getTestUser();
  jest.spyOn(user, 'save').mockImplementation(() => {});
  const medicalRequest = await MedicalRequest.createMessage({ username: "hakan" }, "nice", 1);
  jest.spyOn(medicalRequest, 'save').mockImplementation(() => {});
  medicalRequest.addHelper(user);
  expect(medicalRequest.helperList.length).toBe(1);
  expect(medicalRequest.helperList[0]).toBe(user._id);
  expect(medicalRequest.status).toBe("Closed");
  medicalRequest.removeHelper(user);
  expect(medicalRequest.status).toBe("Active");
});
