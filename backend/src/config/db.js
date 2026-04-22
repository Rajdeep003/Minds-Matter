const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    dbName: "minds-matter",
  });
  console.log("MongoDB connected");
};

module.exports = { connectDB };
