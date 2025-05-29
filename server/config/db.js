const mongoose = require('mongoose');
const DBname = "interveiwe";

const connectDB = async () => {
  try {
    console.log(process.env.PORT);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}/${DBname}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;