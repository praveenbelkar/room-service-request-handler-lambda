const config = require('../../config');
const { logger } = require('api-node-modules');

const DELAY_RETRY_INTERVAL = process.env.DELAY_RETRY_INTERVAL || 500;
const RETRY_ATTEMPT = process.env.RETRY_ATTEMPT || 3;
const CONNECTION_TIMEOUT = process.env.CONNECTION_TIMEOUT || 3000;

const initOptions = {};
const pgp = require('pg-promise')(initOptions);
const initConnection = () => {
    logger.debug('Initialising the pool')
    return pgp({
        host: config.DB_HOST,
        port: config.DB_PORT,
        database: config.DB_NAME,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        ssl: false,
        allowExitOnIdle: true,
        connectionTimeoutMillis: parseInt(CONNECTION_TIMEOUT)
    });
}

const initInsertColumnSet = () => {
    logger.debug('Initialising insert ColumnSet');
    return new pgp.helpers.ColumnSet(['ref_id', 'school_ref_id', 'location_code', 'room_code', 'short_description', 'long_description', 'square_metres', 'capacity', 'room_type', 'status', 'source', 'created_time', 'updated_time', 'local_id', 'can_be_timetabled', 'room_type_description'], {table: 'room'});
}

const initUpdateColumnSet = () => {
    logger.debug('Initialising update ColumnSet');
    return new pgp.helpers.ColumnSet(['?ref_id', {name: 'school_ref_id', cast: 'uuid'}, 'location_code', 'room_code', 'short_description', 'long_description', {name: 'square_metres', cast: 'int'}, {name: 'capacity', cast: 'int'}, 'room_type', 'status', 'source', {name: 'created_time', cast: 'timestamp'}, {name: 'updated_time', cast: 'timestamp'}, 'local_id', 'can_be_timetabled', 'room_type_description'], {table: 'room'});
}

const singletonConnection = initConnection();
const singletonInsertColumnSet = initInsertColumnSet();
const singletonUpdateColumnSet = initUpdateColumnSet();
const delay = ms => new Promise(res => setTimeout(res, ms));

const makeClient = () => {
    return singletonConnection;
}

const query = async (query) => {
  const client = await makeClient();
  let result = null;
  let attempt = parseInt(RETRY_ATTEMPT);
  while(attempt > 0) {
      try {
          result = await client.any(query);
          return result;
      } catch(e) {
          attempt--;
          logger.error('error while querying  '+ JSON.stringify(e,null,2));
          await delay(parseInt(DELAY_RETRY_INTERVAL));
          logger.debug("waited for " + parseInt(DELAY_RETRY_INTERVAL) + " millisec");
          if(attempt == 0){
              throw e;
          }
      }
  }
  return result;
};

const insertQuery = async(values) => {
    const client = await makeClient();
    const cs = singletonInsertColumnSet;
    let attempt = parseInt(RETRY_ATTEMPT);
    const query = pgp.helpers.insert(values, cs);
    while(attempt > 0) {
        try {
            await client.none(query);
            attempt = 0;
        } catch(e) {
            attempt--;
            logger.error('error while inserting  '+ JSON.stringify(e,null,2));
            await delay(parseInt(DELAY_RETRY_INTERVAL));
            logger.debug("waited for " + parseInt(DELAY_RETRY_INTERVAL) + " millisec");
            if(attempt == 0){
                throw e;
            }
        }
    }
}

const updateQuery = async(values) => {
    const client = await makeClient();
    const cs = singletonUpdateColumnSet;
    let attempt = parseInt(RETRY_ATTEMPT);
    const query = pgp.helpers.update(values, cs) + ' WHERE v.ref_id = t.ref_id::text';
    while(attempt > 0) {
        try {
            const updateResponse  = await client.none(query);
            attempt = 0;
        } catch(e){
            attempt--;
            logger.error('error while updating  '+ JSON.stringify(e,null,2));
            await delay(parseInt(DELAY_RETRY_INTERVAL));
            logger.debug("waited for " + parseInt(DELAY_RETRY_INTERVAL) + " millisec");
            if(attempt == 0){
                throw e;
            }
        }
    }
}

module.exports = { query, insertQuery, updateQuery };
