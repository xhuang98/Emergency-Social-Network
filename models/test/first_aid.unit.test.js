import FirstAid from "../first_aid.js";
import { jest } from "@jest/globals";

const text = "et porttitor eget dolor morbi non arcu risus quis varius quam quisque id diam vel quam elementum pulvinar etiam non quam lacus suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit duis tristique sollicitudin nibh sit amet commodo nulla facilisi nullam vehicula ipsum a arcu cursus vitae congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas maecenas pharetra convallis posuere morbi leo urna molestie at elementum eu facilisis sed odio morbi quis commodo odio aenean sed adipiscing diam donec adipiscing tristique risus nec feugiat in fermentum posuere urna nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus";

const shortext = "this is sample short text";

const instructions1 = {
  displayName: "doctorperson2",
  instructions: "First, try to remove the stinger with tweezers or by scraping the stung area with a credit card. Then apply a cool compress to reduce swelling and remove tight clothing or accessories from the area in case swelling occurs. Watch for signs of shock or allergic reaction by checking the victims airway, breathing, and circulation. If any of these are impeded, call 911 immediately.",
  medicalInjury: "bee sting",
  timestamp: "2022-11-30T17:03:25.012Z",
  username: "doctorperson2",
  __v: 0,
  _id: "63878cddee9d956af27bfa97"
};

const instructions2 = {
  displayName: "doctorperson2",
  instructions: "top the bleeding. Cover the wound with sterile gauze or a clean cloth. Press on it firmly with the palm of your hand until bleeding stops. But don't press on an eye injury or embedded object. Don't press on a head wound if you suspect a skull fracture.Wrap the wound with a thick bandage or clean cloth and tape. Lift the wound above heart level if possible.Help the injured person lie down. If possible, place the person on a rug or blanket to prevent loss of body heat. Elevate the feet if you notice signs of shock, such as weakness, clammy skin or a rapid pulse. Calmly reassure the injured person.",
  medicalInjury: "bleeding",
  timestamp: "2022-11-30T17:02:44.004Z",
  username: "doctorperson2",
  __v: 0,
  _id: "63878cb4ee9d956af27bfa90"
};

const instructions3 = {
  displayName: "doctorperson2",
  instructions: "Cool the burn. Hold the area under cool (not cold) running water for about 10 minutes. If the burn is on the face, apply a cool, wet cloth until the pain eases. For a mouth burn from hot food or drink, put a piece of ice in the mouth for a few minutes.Remove rings or other tight items from the burned area. Try to do this quickly and gently, before the area swells.Don't break blisters. Blisters help protect against infection. If a blister does break, gently clean the area with water and apply an antibiotic ointment.Apply lotion. After the burn is cooled, apply a lotion, such as one with aloe vera or cocoa butter. This helps prevent drying and provides relief.Bandage the burn. Cover the burn with a clean bandage. Wrap it loosely to avoid putting pressure on burned skin. Bandaging keeps air off the area, reduces pain and protects blistered skin.",
  medicalInjury: "burn",
  timestamp: "2022-11-30T17:02:06.266Z",
  username: "doctorperson2",
  __v: 0,
  _id: "63878c8eee9d956af27bfa89"
};

const instructions4 = {
  displayName: "doctorperson2",
  instructions: "this is cutthis is cutthis is cutthis is cut this is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is cutthis is ",
  medicalInjury: "cuts updatedsad",
  timestamp: "2022-11-30T15:54:13.817Z",
  username: "doctorperson2",
  __v: 0,
  _id: "6380f5054fa6d173d1eee78f"
};

const instructions5 = {
  displayName: "doctorperson3",
  instructions: "et porttitor eget dolor morbi non arcu risus quis varius quam quisque id diam vel quam elementum pulvinar etiam non quam lacus suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit duis tristique sollicitudin nibh sit amet commodo nulla facilisi nullam vehicula ipsum a arcu cursus vitae congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas maecenas pharetra convallis posuere morbi leo urna molestie at elementum eu facilisis sed odio morbi quis commodo odio aenean sed adipiscing diam donec adipiscing tristique risus nec feugiat in fermentum posuere urna nec tincidunt praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus",
  medicalInjury: "new",
  timestamp: "2022-11-27T23:56:29.182Z",
  username: "doctorperson3",
  __v: 0,
  _id: "6383f92d676eddb4e360882c"
};

const instructions6 = {
  displayName: "doctorperson3",
  instructions: "this. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracturethis. is fracture",
  medicalInjury: "fracture",
  timestamp: "2022-11-25T17:50:31.046Z",
  username: "doctorperson3",
  __v: 0,
  _id: "63810067b951466b237d30e6"
};

test('can not create a first aid record', async () => {
  const newFirstAidRecord = { username: 'test_user', displayName: 'test_user', medicalInjury: 'burn test', instructions: shortext };
  jest.spyOn(FirstAid, 'createFirstAidRecord').mockImplementation(() => { });
  await FirstAid.createFirstAidRecord(newFirstAidRecord);
  expect(() => FirstAid.checkInstructionsRule(newFirstAidRecord.medicalInjury, newFirstAidRecord.instructions)).toThrow('Instructions length is not satisfied');
});

test('can create a first aid record', async () => {
  const newFirstAidRecord = { username: 'test_user', displayName: 'test_user', medicalInjury: 'burn test', instructions: text };
  jest.spyOn(FirstAid, 'createFirstAidRecord').mockImplementation(() => { });
  await FirstAid.createFirstAidRecord(newFirstAidRecord);
  expect(FirstAid.checkInstructionsRule(newFirstAidRecord.medicalInjury, newFirstAidRecord.instructions)).toBe('pass');
});

test('whether first aid instructions are sorted, newest at the top', () => {
  const queriedInstructions = [
    instructions3, instructions4, instructions1, instructions2, instructions5, instructions6
  ];
  const sortedInstructions = [
    instructions1, instructions2, instructions3, instructions4, instructions5, instructions6
  ];
  const instructions = FirstAid.sortLatestFirstAidInstructions(queriedInstructions);
  expect(instructions).toEqual(sortedInstructions);
});
