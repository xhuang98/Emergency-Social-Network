import MPSearcher from "../medical_provider_searcher.js";
import MedicalProvider from "../../models/medical_provider.js";
import { jest } from "@jest/globals";

test('get nearest medical providers by coordinates, sorted', async () => {
  const refLongitude = 100;
  const refLatitude = 50;
  const mp1 = { name: 'mp1', longitude: 90, latitude: 50 }; // nearest
  const mp2 = { name: 'mp4', longitude: 80, latitude: 50 }; // 3rd nearest
  const mp3 = { name: 'mp5', longitude: 111, latitude: 50 }; // 2nd nearest
  const data = [mp1, mp2, mp3];
  const target = [mp1, mp3, mp2];
  jest.spyOn(MedicalProvider, 'getAllMedicalProviders').mockImplementation(() => data);
  const searcher = new MPSearcher([refLongitude, refLatitude]);
  const results = await searcher.searchByCoordinates(3);
  results.forEach(mp => {
    delete mp.distance;
  });
  expect(results).toEqual(target);
});

test('get nearest 3 medical providers by coordinates, sorted, trimmed', async () => {
  const refLongitude = 100;
  const refLatitude = 50;
  const mp1 = { name: 'mp1', longitude: 90, latitude: 50 }; // nearest
  const mp2 = { name: 'mp2', longitude: -100, latitude: 90 }; // too far
  const mp3 = { name: 'mp3', longitude: 110, latitude: -90 }; // too far
  const mp4 = { name: 'mp4', longitude: 80, latitude: 50 }; // 3rd nearest
  const mp5 = { name: 'mp5', longitude: 111, latitude: 50 }; // 2nd nearest
  const data = [mp1, mp2, mp3, mp4, mp5];
  const target = [mp1, mp5, mp4];
  jest.spyOn(MedicalProvider, 'getAllMedicalProviders').mockImplementation(() => data);
  const searcher = new MPSearcher([refLongitude, refLatitude]);
  const results = await searcher.searchByCoordinates(3);
  results.forEach(mp => {
    delete mp.distance;
  });
  expect(results).toEqual(target);
});
