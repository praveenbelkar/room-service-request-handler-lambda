const { jest, describe, afterEach, expect, it } = require('@jest/globals');

jest.mock('../../service/roomInfoGetService');
jest.mock('api-node-modules', () => ({
  ...jest.requireActual('api-node-modules'),
  validator: { validate: jest.fn() }
}));

const roomInfo = require('../../functions/getHandler.js');

const { validator } = require('api-node-modules');
const service = require('../../service/roomInfoGetService');
const queryByZoneId = require('../data/getRoomInfo.event.json');
const queryByRefIdAndZoneId = require('../data/getRoomInfoByRefId.event.json');

const handler = roomInfo.handler;
const validate = validator.validate;

const queryByZoneIdEvent = queryByZoneId;
const queryByRefIdAndZoneIdEvent = queryByRefIdAndZoneId;

describe('getRoomInfo lambda handler', () => {
  const mockGetRoomsByZoneId = jest.mocked(service.getRoomsByZoneId);
  const mockGetRoomByRefId = jest.mocked(service.getRoomByRefId);
  const mockValidate = jest.mocked(validate);
  describe('should return success response', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('on Valid Request', async () => {
      mockGetRoomsByZoneId.mockResolvedValue(
        Promise.resolve(JSON.stringify([{ room: 'found' }]))
      );

      const response = await handler(queryByZoneIdEvent);

      expect(response.statusCode).toBe(200);

      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
          'content-profile': 'urn:sif:data/au/3.5.0',
          messageType: 'RESPONSE',
          requestId: queryByZoneId['headers']['RequestId'],
          responseAction: 'QUERY',
          serviceType: 'OBJECT',
          vary: 'Accept-Encoding'
        })
      );

      expect(response.body).toEqual(JSON.stringify([{ room: 'found' }]));
    });

    it('on Valid Request, with RefId in PathParam', async () => {
      mockGetRoomByRefId.mockResolvedValue(JSON.stringify({ room: 'found' }));

      const response = await handler(queryByRefIdAndZoneIdEvent);

      expect(response.statusCode).toBe(200);

      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
          'content-profile': 'urn:sif:data/au/3.5.0',
          messageType: 'RESPONSE',
          requestId: queryByZoneId['headers']['RequestId'],
          responseAction: 'QUERY',
          serviceType: 'OBJECT',
          vary: 'Accept-Encoding'
        })
      );

      expect(response.body).toEqual(JSON.stringify({ room: 'found' }));
    });

    it('on Valid Request, with navigatePage queryParam > 1', async () => {
      mockGetRoomByRefId.mockResolvedValue(JSON.stringify({ room: 'found' }));

      const copyOfEventPayload = {
        ...queryByRefIdAndZoneIdEvent
      };
      copyOfEventPayload.queryStringParameters = {
        ...copyOfEventPayload.queryStringParameters,
        navigationPage: '2'
      };
      const response = await handler(copyOfEventPayload);

      expect(response.statusCode).toBe(204);

      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
          'content-profile': 'urn:sif:data/au/3.5.0',
          messageType: 'RESPONSE',
          requestId: queryByZoneId['headers']['RequestId'],
          responseAction: 'QUERY',
          serviceType: 'OBJECT',
          vary: 'Accept-Encoding'
        })
      );

      expect(response.body).toBeNull();
    });
  });

  describe('should return error response', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('on InValid Request', async () => {
      mockValidate.mockImplementation(() => {
        return {
          statusCode: 400,
          statusMessage: 'Bad Request',
          description: 'Invalid HEADER'
        };
      });

      const response = await handler(queryByZoneIdEvent);

      expect(response.statusCode).toBe(400);

      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
          'content-profile': 'urn:sif:data/au/3.5.0',
          messageType: 'ERROR',
          requestId: queryByZoneId['headers']['RequestId'],
          responseAction: 'QUERY',
          serviceType: 'OBJECT',
          vary: 'Accept-Encoding'
        })
      );

      const body = JSON.parse(response.body);
      expect(body.error).toEqual(
        expect.objectContaining({
          code: 400,
          description: 'Invalid HEADER',
          message: 'Bad Request',
          scope: '/sif/v1/RoomInfos'
        })
      );
    });

    it('when schoolInfoService returns null', async () => {
      mockValidate.mockImplementation(() => null);
      mockGetRoomsByZoneId.mockResolvedValue(null);

      const response = await handler(queryByZoneIdEvent);

      expect(response.statusCode).toBe(500);

      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
          'content-profile': 'urn:sif:data/au/3.5.0',
          messageType: 'ERROR',
          requestId: queryByZoneId['headers']['RequestId'],
          responseAction: 'QUERY',
          serviceType: 'OBJECT',
          vary: 'Accept-Encoding'
        })
      );

      const body = JSON.parse(response.body);
      expect(body.error).toEqual(
        expect.objectContaining({
          code: 500,
          message: 'Internal Server Error',
          scope: '/sif/v1/RoomInfos'
        })
      );
    });

    it('when schoolInfoService calls throws an Error', async () => {
      mockValidate.mockImplementation(() => null);
      mockGetRoomsByZoneId.mockRejectedValue({
        statusCode: 404,
        statusMessage: 'Not Found',
        description: 'School with 1001 not found'
      });

      const response = await handler(queryByZoneIdEvent);

      expect(response.statusCode).toBe(404);

      expect(response.headers).toEqual(
        expect.objectContaining({
          'content-type': 'application/json',
          'content-profile': 'urn:sif:data/au/3.5.0',
          messageType: 'ERROR',
          requestId: queryByZoneId['headers']['RequestId'],
          responseAction: 'QUERY',
          serviceType: 'OBJECT',
          vary: 'Accept-Encoding'
        })
      );

      const body = JSON.parse(response.body);
      expect(body.error).toEqual(
        expect.objectContaining({
          code: 404,
          message: 'Not Found',
          description: 'School with 1001 not found',
          scope: '/sif/v1/RoomInfos'
        })
      );
    });
  });
});
