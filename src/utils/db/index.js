const mongoose = require("mongoose");
const { success, error } = require("logggger");

/**
 * Connects to the MongoDB database using the provided URI.
 *
 * @async
 * @function
 * @name connectToDB
 *
 * @param {string} mongoURI - The MongoDB connection URI.
 * @returns {Promise<void>} A Promise that resolves when the connection to the database is successful.
 * @throws {Error} Throws an error if there's an issue connecting to the database.
 *
 * @example
 * ```
 * const mongoURI = "mongodb://localhost:27017/mydatabase";
 * connectToDB(mongoURI);
 * ```
 */
const connectToDB = async (mongoURI) => {
  try {
    const conn = await mongoose.connect(mongoURI);
    success(`Connected to Database > ${conn.connection.host}`);
  } catch (err) {
    error(`Error connecting to Database > ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectToDB;
