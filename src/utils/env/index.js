const dotenv = require("dotenv");
const { error } = require("logggger");

/**
 * Loads environment variables based on the current Node.js environment.
 *
 * @function
 * @name loadEnv
 * @returns {string} The current Node.js environment ("production", "development", or "test").
 * @throws {Error} Throws an error if an invalid environment is detected.
 *
 * @example
 * ```
 * const currentEnvironment = loadEnv();
 * console.log(`Current environment: ${currentEnvironment}`);
 * ```
 */
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
