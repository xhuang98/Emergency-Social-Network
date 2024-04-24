import MedicalSupply from "../medical_supply.js";

const supply1 = {
  _id: "6333bcbab76bffde652d5114",
  username: "dominic",
  displayName: "Dominic",
  timestamp: "2022-09-28T03:17:14.921Z",
  supplyName: "Aspirin",
  supplyQuantity: "1",
  supplyType: "Medicine",
  exchangeType: "Offer"
};

const supply2 = {
  _id: "63316e2d7af1e05ac332739b",
  username: "dominic",
  displayName: "Dominic",
  timestamp: "2022-09-26T09:17:33.608Z",
  supplyName: "Water",
  supplyQuantity: "10",
  supplyType: "Food",
  exchangeType: "Request"
};

const supply3 = {
  _id: "63316be3532898a5ae0f0174",
  username: "tp55",
  displayName: "tp55",
  timestamp: "2022-09-26T09:07:47.416Z",
  supplyName: "Bandage",
  supplyQuantity: "20",
  supplyType: "Accessories",
  exchangeType: "Offer"
};

const supply4 = {
  _id: "63316be3532898a5ae0f0174",
  username: "kishan",
  displayName: "kishan",
  timestamp: "2022-09-29T09:07:47.416Z",
  supplyName: "Zinc",
  supplyQuantity: "5",
  supplyType: "Medicine",
  exchangeType: "Request"
};

const supply5 = {
  _id: "63316be3532898a5ae0f0175",
  username: "sunny",
  displayName: "sunny",
  timestamp: "2022-11-30T09:07:47.416Z",
  supplyName: "Stretcher",
  supplyQuantity: "1",
  supplyType: "Equipment",
  exchangeType: "Offer"
};

const supply6 = {
  _id: "63316be3532898a5ae0f0176",
  username: "xi",
  displayName: "Xi",
  timestamp: "2022-10-26T09:07:47.416Z",
  supplyName: "Water",
  supplyQuantity: "20",
  supplyType: "Food",
  exchangeType: "Request"
};

test('whether medical supplies are sorted, oldest at the top', () => {
  const queriedSupplies = [
    supply1, supply2, supply3, supply4, supply5, supply6
  ];
    // Sort by decreasing timestamp order
  const sortedSupplies = [
    supply3, supply2, supply1, supply4, supply6, supply5
  ];
  const supplies = MedicalSupply.sortLatestMedicalSupplies(queriedSupplies);
  expect(supplies).toEqual(sortedSupplies);
});
