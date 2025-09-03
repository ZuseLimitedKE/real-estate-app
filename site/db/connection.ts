import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const mongodb_uri = process.env.MONGODB_URI;

let client: MongoClient;

// Use a global variable in dev due to HMR
if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(mongodb_uri);
  }
  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(mongodb_uri);
}

export default client;
