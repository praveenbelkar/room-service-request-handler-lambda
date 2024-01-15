'use strict';
require('dotenv').config();
const getHandler = require('./src/functions/getHandler');
const postHandler = require('./src/functions/postHandler');
const {getByKeyIgnoreCase} = require("api-node-modules").utils;
const {addDefaultMetadataToLogger} = require("./src/util/utils");
const logger = require('api-node-modules').logger;

const handler = async (event, context) => {
  addDefaultMetadataToLogger(logger, event);
  let response;
  logger.info(`SIF Request Payload : ${JSON.stringify(event, null, 2)}`);

  if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      response = await postHandler.handler(event, context);
  } else {
      response = await getHandler.handler(event, context);
  }
  logger.info('\nReturning response from lambda:\n' + JSON.stringify(response, null, 2));
  return response;
};

module.exports = { handler };
