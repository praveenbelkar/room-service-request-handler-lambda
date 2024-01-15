const {
  logger,
  responseBuilder,
  utils,
  validator,
  constant
} = require('api-node-modules');
const roomInfoGetService = require('../service/roomInfoGetService');
const {addRefIdMetadataToLoggerFromPathParam} = require('../util/utils');
const getByKeyIgnoreCase = utils.getByKeyIgnoreCase;
const HEADERS = constant.HEADERS;

const handler = async (event) => {
  const headers = event['headers'];
  const requestId = getByKeyIgnoreCase(headers, HEADERS.REQUEST_ID);
  const requestAction = getByKeyIgnoreCase(headers, HEADERS.REQUEST_ACTION);
  const zoneId = getByKeyIgnoreCase(headers, HEADERS.ZONE_ID);
  const refId = getByKeyIgnoreCase(event['pathParameters'], 'refid');

  addRefIdMetadataToLoggerFromPathParam(logger, event);

  logger.info(`Received getRoomInfo request with refId: [${refId}]`);
  logger.debug(`SIF Request Payload : ${JSON.stringify(event, null, 2)}`);

  const validationError = validator.validate(event);
  if (validationError) {
    logger.error(`Request Validation Failed: ${validationError.description}`);

    return responseBuilder.buildErrorResponse(
      validationError,
      requestId,
      requestAction,
      event.path
    );
  }

  try {
    let response;
    if (refId) {
      response = await roomInfoGetService.getRoomByRefId(refId, zoneId);
      logger.info('\n getRoomInfo.js response:\n' + JSON.stringify(response, null, 2));
    } else {
      response = await roomInfoGetService.getRoomsByZoneId(zoneId);
    }

    if (response) {
      //Schools are always retrieved using zoneId and there will be always one.
      //so if navigationPage is > 1, then send 204(No Content)
      const navigationPage = getByKeyIgnoreCase(
        event['queryStringParameters'],
        'navigationPage'
      );
      if (navigationPage && navigationPage > 1) {
        logger.info('returning No Content(204)');
        return responseBuilder.buildSuccessResponse(
          null,
          requestId,
          requestAction,
          204
        );
      }

      logger.info('returning successful response');
      return responseBuilder.buildSuccessResponse(
        response,
        requestId,
        requestAction
      );
    }
  } catch (error) {
    logger.error(`Error occurred ${JSON.stringify(error, null, 2)}`);
    return responseBuilder.buildErrorResponse(
      error,
      requestId,
      requestAction,
      event.path
    );
  }

  logger.error('Invalid response, hence returning 500');
  return responseBuilder.buildErrorResponse(
    {
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    },
    requestId,
    requestAction,
    event.path
  );
};

module.exports = { handler };
