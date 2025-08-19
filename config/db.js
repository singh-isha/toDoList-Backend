// before test cases
// // const mongoose = require('mongoose');
// // const dotenv = require('dotenv');

// // dotenv.config();

// // const connectDB = async () => {
// //     try{
// //         await mongoose.connect(process.env.MONGO_URI);
// //         console.log('MongoDB connected...');
// //     } catch (err) {
// //         console.error(err.message);
// //         // Exit process with failure
// //         process.exit(1);
// //     }
// // };

// // module.exports = connectDB;

// after test cases

const mongoose = require("mongoose");

const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    const uri =
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TEST
        : process.env.MONGO_URI;

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
