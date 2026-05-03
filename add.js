const { default: mongoose } = require("mongoose");
const Account = require("./models/Account");
const Transaction = require("./models/Transaction");
const User = require("./models/User");
const External = require("./models/External");
require("dotenv").config();
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const DATABASE_URI = process.env.MONGO_URI;

async function dropCollections() {
  try {
    await mongoose.connect(DATABASE_URI);
    console.log("✅ Connected to MongoDB");

    // Drop each collection using Mongoose
    await User.collection.drop().catch((err) => {
      if (err.code === 26) console.log("⚠️ Users collection not found");
      else throw err;
    });
    console.log("✅ Dropped users collection");

    await Transaction.collection.drop().catch((err) => {
      if (err.code === 26) console.log("⚠️ Transactions collection not found");
      else throw err;
    });
    console.log("✅ Dropped transactions collection");

    await Account.collection.drop().catch((err) => {
      if (err.code === 26) console.log("⚠️ Accounts collection not found");
      else throw err;
    });
    console.log("✅ Dropped accounts collection");

    await External.collection.drop().catch((err) => {
      if (err.code === 26) console.log("⚠️ External collection not found");
      else throw err;
    });
    console.log("✅ Dropped external collection");

    console.log("\n🎉 All collections dropped successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

dropCollections();
