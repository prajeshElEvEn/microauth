const dotenv = require("dotenv");
const { error } = require("logggger");

const loadEnv = () => {
  dotenv.config({ path: ".env" });
  const env = process.env.NODE_ENV;

  if (env === "production") {
    dotenv.config({ path: ".env.production" });
  } else if (env === "development") {
    dotenv.config({ path: ".env.test" });
  } else {
    error("Invalid environment");
    throw new Error(`Invalid environment: ${env}`);
  }

  return env;
};

module.exports = loadEnv;
