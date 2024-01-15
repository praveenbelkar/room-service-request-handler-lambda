const { jest, afterEach, describe, expect, it } = require('@jest/globals');

const repository = require('../../rds/repository');
const roomInfoUpdateService = require('../../service/roomInfoUpdateService');
const roomInfoGetService = require('../../service/roomInfoGetService');
const updateSingleRoomInfoLambdaRequestJson = require('../local/updateSingleRoomInfo.event.json');
const updateSingleRoomInfoRequest = updateSingleRoomInfoLambdaRequestJson.body.RoomInfo;
const updateMultiRoomJson = require('../local/updateMultiRoomInfo.event.json');
const updateMultiRoomInfoRequest = updateMultiRoomJson.body.RoomInfos.RoomInfo;
const updateSingleRoomInfoMockResponseData = require('../data/updateSingleRoomInfoMockResponseData.json');
const updateMultiRoomInfoMockResponseData = require('../data/updateMultiRoomInfoMockResponseData.json');

const mockRoomData = require('../data/roomMockData');

jest.mock('../../rds/repository');
jest.mock('../../service/roomInfoGetService');

describe('roomInfoUpdateService', () => {

    afterEach(() => {
      jest.restoreAllMocks();
    });

  describe('when update request with valid single object ', () => {

    it('should return statusCode 200', async () => {

      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefIdAndLocationCode").mockReturnValue(updateSingleRoomInfoMockResponseData);
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      const response = await roomInfoUpdateService.updateRoomInfo(updateSingleRoomInfoRequest, 'zone:2118');
      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(200);
    });

  });

  describe('when update with valid single object which is NOT existing ', () => {

    it('should return statusCode 404', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefIdAndLocationCode").mockReturnValue(null);

      //Execute
      const response = await roomInfoUpdateService.updateRoomInfo(updateSingleRoomInfoRequest, 'zone:2118');

      //Expect
      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(404);
    });

  });

  describe('when update with valid existing single Vendor(source) object, but no permission to update(fields like localId ', () => {

    it('should return statusCode 400', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefIdAndLocationCode").mockReturnValue(updateSingleRoomInfoMockResponseData);
      const saveFieldValue = updateSingleRoomInfoRequest.LocalId;
      updateSingleRoomInfoRequest.LocalId = 'Updated-Local-Id';

      //Execute
      const response = await roomInfoUpdateService.updateRoomInfo(updateSingleRoomInfoRequest, 'zone:2118');
      updateSingleRoomInfoRequest.LocalId = saveFieldValue;

      //Expect
      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(400);
    });

  });

  describe('when update with valid single object, failure in repository layer ', () => {

    it('should return statusCode 500', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefIdAndLocationCode").mockReturnValue(updateSingleRoomInfoMockResponseData);
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {throw new Error('Repo failure')});

      //Execute
      const response = await roomInfoUpdateService.updateRoomInfo(updateSingleRoomInfoRequest, 'zone:2118');

      //Expect
      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(500);
    });

  });

  describe('when update with valid multi object request (each per-existing room)', () => {

    it('should return statusCode for each object 200', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefIdAndLocationCode").mockImplementation(
            async (refId, schoolCode) => {
                const existingRoomInfos = updateMultiRoomInfoMockResponseData.filter(updateRoomInfoRequest => updateRoomInfoRequest.ref_id.toLowerCase() === refId.toLowerCase())
                                            .map(updateRoomInfoRequest => updateRoomInfoRequest);
                                            return existingRoomInfos[0];
            }
      )

      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      //Execute
      let responses = [];
      responses = await roomInfoUpdateService.updateRoomInfos(updateMultiRoomInfoRequest, 'zone:2118');

      //Expect
      expect(responses).not.toBeNull();
      responses.forEach(response => {
            expect(response.statusCode).toEqual(200);
      });
    });

  });

  describe('when posted with valid multi object request (each non-existing room)', () => {

    it('should return statusCode for each object 404', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefIdAndLocationCode").mockReturnValue(null);
      //jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      //Execute
      let responses = [];
      responses = await roomInfoUpdateService.updateRoomInfos(updateMultiRoomInfoRequest, 'zone:2118');

      //Expect
      expect(responses).not.toBeNull();
      responses.forEach(response => {
            expect(response.statusCode).toEqual(404);
      });
    });

  });

  describe('when posted with valid multi object request (few existing and few non-existing room)', () => {

    it('should return statusCode of 200 for existing and 409 for non-existing object respectively', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefIdAndLocationCode").mockImplementation(
        async (refId, schoolCode) => {
                if(updateMultiRoomInfoRequest[0].RefId.toLowerCase() === refId.toLowerCase()) {
                    return updateMultiRoomInfoMockResponseData[0];
                } else {
                    return null;
                };
              });
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      //Execute
      let responses = [];
      responses = await roomInfoUpdateService.updateRoomInfos(updateMultiRoomInfoRequest, 'zone:2118');

      //Expect
      expect(responses).not.toBeNull();
      responses.filter(response => response.id.toLowerCase() === updateMultiRoomInfoRequest[0].RefId.toLowerCase())
                .map(response => expect(response.statusCode).toEqual(200));
      responses.filter(response => response.id.toLowerCase() != updateMultiRoomInfoRequest[0].RefId.toLowerCase())
                .forEach(response => expect(response.statusCode).toEqual(404));
    });

  });

});
