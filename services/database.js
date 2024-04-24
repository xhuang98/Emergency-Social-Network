/* istanbul ignore file */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from "mongodb-memory-server";
import UserAuth from '../models/user_auth.js';
import User from '../models/user.js';

dotenv.config();

let MONGODB_URL;

let isTestingDatabase = false;
const connectionFactory = async (testing) => {
  isTestingDatabase = testing;
  let connection;
  if (testing) {
    connection = await testingDatabase();
  } else {
    connection = await productionDatabase();
  }
  await seedDatabase();
  return connection;
};

let mongod;
const testingDatabase = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  return mongoose.connect(uri, mongooseOpts);
};

const productionDatabase = async () => {
  const MONGODB_USERNAME = process.env.MONGODB_ATLAS_USERNAME;
  const MONGODB_PASSWORD = process.env.MONGODB_ATLAS_PASSWORD;
  const MONGODB_HOST = process.env.MONGODB_ATLAS_HOST;
  const MONGODB_PORT = process.env.MONGODB_ATLAS_PORT;
  const MONGODB_DATABASE = process.env.MONGODB_ATLAS_DATABASE;

  MONGODB_URL = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}`;
  return await mongoose.connect(MONGODB_URL);
};

/* ATTENTION DONT CALL THIS IN PRODUCTION AT ALL UNLESS YOU WANT TO DIE */
const closeTestingDatabase = async () => {
  if (!isTestingDatabase) {
    return;
  }
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

/* ATTENTION DONT CALL THIS IN PRODUCTION AT ALL UNLESS YOU WANT TO DIE */
const clearDatabase = async () => {
  if (!isTestingDatabase) {
    return;
  }
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

const seedDatabase = async () => {
  const salt = await UserAuth.generateSalt();
  const hashedPassword = await UserAuth.hashPassword("admin", salt);
  try{
    await new UserAuth({username: "esnadmin", password: hashedPassword, salt}).save();
    await new User({username: "esnadmin", displayName: "ESNAdmin", role: 'administrator', status: 'ok'}).save();
  } catch(err){
    //ignore error
  }
};

export default { connectionFactory, closeTestingDatabase, clearDatabase, seedDatabase };
