import mongoose from 'mongoose';
import fp from 'fastify-plugin';
import {MONGO_URI} from '../../config/config';

async function dbConnect() {
  try {
    const connection = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB connected successfully`);

    if (!connection.connection.db) {
      throw new Error("MongoDB database connection is undefined");
    }

    const tokensCollection = connection.connection.db.collection("tokens");

    // Get existing indexes
    const indexes = await tokensCollection.indexes();
    const userIdIndex = indexes.find((idx) => idx.name === "userId_1");

    if (userIdIndex && userIdIndex.unique) {
      console.log("⚠️ Dropping existing unique index on userId in tokens collection");
      await tokensCollection.dropIndex("userId_1");
    }

    // Create compound unique index on userId + type + token
    console.log("Creating unique compound index on userId, type, and token fields");
    await tokensCollection.createIndex(
      { userId: 1, type: 1, token: 1 },
      { unique: true }
    );

    console.log("✅ Tokens collection indexes ensured");

  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export default fp(async (fastify, opts) => {
  await dbConnect();
});