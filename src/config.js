require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || undefined });

const REQUIRED = ['API_KEY', 'TARGET_HOST', 'TARGET_MAC', 'TARGET_PORT', 'PING_PORT', 'PORT'];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

module.exports = {
  API_KEY: process.env.API_KEY,
  TARGET_HOST: process.env.TARGET_HOST,
  TARGET_MAC: process.env.TARGET_MAC,
  TARGET_PORT: parseInt(process.env.TARGET_PORT, 10),
  PING_PORT: parseInt(process.env.PING_PORT, 10),
  PORT: parseInt(process.env.PORT, 10),
};
