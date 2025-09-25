import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const mongodb_uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 7000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  writeConcern: { w: "majority" },
};

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(mongodb_uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(mongodb_uri, options);
  console.log("Connected to MongoDB");
}

export default client;