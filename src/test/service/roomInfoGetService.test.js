const { jest, afterEach, describe, expect, it } = require('@jest/globals');
jest.mock('../../rds/repository');

const repository = require('../../rds/repository');
const roomInfoGetService = require('../../service/roomInfoGetService');
const expectedResponse = require('../data/roomInfoSIFResponse');
const mockRoomData = require('../data/roomMockData');
const xrefLambda = require('../../util/xrefLambda');

describe('roomInfoGetService', () => {
  describe('when queried with ZoneId', () => {
    const mockFindByLocationCode = jest.mocked(repository.findByLocationCode);
    jest.spyOn(xrefLambda, "findSchoolRef").mockReturnValue("some-ref-id");
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return RoomList', async () => {
      mockFindByLocationCode.mockImplementationOnce(async () =>
        Promise.resolve(mockRoomData.mockRoomInfoList)
      );
      const response = await roomInfoGetService.getRoomsByZoneId('zone:2118');
      expect(response).not.toBeNull();
    });

    it('should throw error when school is not ACTIVE', async () => {
      mockFindByLocationCode.mockImplementationOnce(async () =>
        Promise.resolve([])
      );
      jest.spyOn(xrefLambda, "findSchoolRef").mockReturnValue('some-ref-id');
      try {
        const response = await  roomInfoGetService.getRoomsByZoneId('zone:2118');
      } catch (e) {
        expect(e).toEqual({
                          statusCode: 404,
                          statusMessage: 'Not Found',
                          description: 'Rooms for school [2118] not found'
                        });
      }
    });
  });

  describe('when queried with ZoneId and RefId', () => {
    const mockFindByRefIdAndLocationCode = jest.mocked(
      repository.findByRefIdAndLocationCode
    );
    it('should return RoomInfo', async () => {
      mockFindByRefIdAndLocationCode.mockImplementationOnce(async () =>
        Promise.resolve([mockRoomData.mockRoomInfo])
      );
      const response = await roomInfoGetService.getRoomByRefId(
        'D3E34B35-9D75-101A-8C3D-00AA001A1652',
        '2118'
      );
      expect(JSON.parse(response).RoomInfo.RefId).toEqual(expectedResponse.roomInfo.RoomInfo.RefId);
    });

    it('should throw error when there is RefId Mismatch', async () => {
        jest.spyOn(xrefLambda, "findSchoolRef").mockReturnValue('some-ref-id');
        try {
             await roomInfoGetService.getRoomByRefId('ECF31C2C-0D1A-2E20-E053-4863070A7767', '2118')
        } catch(error) {
          expect(error.statusCode).toEqual(404);
          expect(error.statusMessage).toEqual('Not Found');
          expect(error.description).toEqual('Room with RefId: ECF31C2C-0D1A-2E20-E053-4863070A7767 under ZoneId: 2118 not found');
        };
    });
  });



});
