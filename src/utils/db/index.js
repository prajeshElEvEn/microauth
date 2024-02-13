const mongoose = require("mongoose");
const { success, error } = require("logggger");

const connectToDB = async (mongoURI) => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    success(`Connected to Databse > ${conn.connection.host}`);
  } catch (err) {
    error(`Error connecting to Database > ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectToDB;
