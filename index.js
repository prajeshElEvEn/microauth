const express = require("express");
const cors = require("cors");

const { connectToDB, loadEnv } = require("./src/utils");
const { errorHandler } = require("./src/middlewares/error.middlewares");
const { auth, health } = require("./src/routes");
const { warn, log } = require("logggger");

const currentEnv = loadEnv();
const port = process.env.PORT || 5000;
const hostname = process.env.HOSTNAME || "127.0.0.1";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/api/v1/health", health);
app.use("/api/v1/auth", auth);

app.use(errorHandler);

app.listen(port, hostname, async () => {
  warn(`Environment > ${currentEnv}`);
  await connectToDB(process.env.MONGO_URI);
  log(`Server running > http://${hostname}:${port}/api/v1/health`);
  log(`View docs > http://${hostname}:${port}/docs`);
});
