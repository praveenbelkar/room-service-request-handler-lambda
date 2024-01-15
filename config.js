const env = process.env.NODE_ENV ?? 'dev';
console.log(`environment [${env}]`);

const defaultNumber = (defaultValue, value) =>
  value ? parseInt(value) : defaultValue;

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: defaultNumber(5432, process.env.DB_PORT),
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_CONNECTION_MAX_RETRY: defaultNumber(
    2,
    process.env.DB_CONNECTION_MAX_RETRY
  ),
  DB_CONNECTION_RETRY_INTERVAL: defaultNumber(
    500,
    process.env.DB_CONNECTION_RETRY_INTERVAL
  ),
  DB_SCHEMA: process.env.DB_SCHEMA ?? 'public',
  DB_TABLE_NAME: process.env.DB_TABLE_NAME ?? 'room'
};
