const { jest, afterEach, describe, expect, it } = require('@jest/globals');

const repository = require('../../rds/repository');
const roomInfoCreateService = require('../../service/roomInfoCreateService');
const roomInfoGetService = require('../../service/roomInfoGetService');
const saveSingleRoomInfoLambdaRequestJson = require('../local/saveSingleRoomInfo.event.json');
const saveSingleRoomInfoRequest = saveSingleRoomInfoLambdaRequestJson.body.RoomInfo;
const saveMultiRoomJson = require('../local/saveMultiRoomInfo.event.json');
const saveMultiRoomInfoRequest = saveMultiRoomJson.body.RoomInfos.RoomInfo;

const mockRoomData = require('../data/roomMockData');

jest.mock('../../rds/repository');
jest.mock('../../service/roomInfoGetService');

describe('roomInfoCreateService', () => {

    afterEach(() => {
      jest.restoreAllMocks();
    });

  describe('when posted with valid single object ', () => {

    it('should return statusCode 201', async () => {

      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefId").mockReturnValue(null);
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      const response = await roomInfoCreateService.saveRoom(saveSingleRoomInfoRequest, 'zone:2118');
      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(201);
    });

  });

  describe('when posted with valid single object which is already existing ', () => {

    it('should return statusCode 409', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefId").mockReturnValue(saveSingleRoomInfoRequest);
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      //Execute
      const response = await roomInfoCreateService.saveRoom(saveSingleRoomInfoRequest, 'zone:2118');

      //Expect
      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(409);
    });

  });

  describe('when posted with valid single object, failure in repository layer ', () => {

    it('should return statusCode 500', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefId").mockReturnValue(null);
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {throw new Error('Repo failure')});

      //Execute
      const response = await roomInfoCreateService.saveRoom(saveSingleRoomInfoRequest, 'zone:2118');

      //Expect
      expect(response).not.toBeNull();
      expect(response.statusCode).toEqual(500);
    });

  });

  describe('when posted with valid multi object request (each non-existing room)', () => {

    it('should return statusCode for each object 201', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefId").mockReturnValue(null);
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      //Execute
      let responses = [];
      responses = await roomInfoCreateService.saveRooms(saveMultiRoomInfoRequest, 'zone:2118');

      //Expect
      expect(responses).not.toBeNull();
      responses.forEach(response => {
            expect(response.statusCode).toEqual(201);
      });
    });

  });

  describe('when posted with valid multi object request (each pre-existing room)', () => {

    it('should return statusCode for each object 409', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefId").mockReturnValue(saveMultiRoomInfoRequest[0]);
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      //Execute
      let responses = [];
      responses = await roomInfoCreateService.saveRooms(saveMultiRoomInfoRequest, 'zone:2118');

      //Expect
      expect(responses).not.toBeNull();
      responses.forEach(response => {
            expect(response.statusCode).toEqual(409);
      });
    });

  });

  describe('when posted with valid multi object request (few existing and few non-existing room)', () => {

    it('should return statusCode of 201 for non-existing and 409 for existing object respectively', async () => {
      //Set up
      jest.spyOn(roomInfoGetService, "checkIfRoomExistsByRefId").mockImplementation(
        async (refId) => {
                if(saveMultiRoomInfoRequest[0].RefId.toLowerCase() === refId.toLowerCase()) {
                    return saveMultiRoomInfoRequest[0];
                } else {
                    return null;
                };
              });
      jest.spyOn(repository, "saveRoom").mockImplementation(async (roomInfos, schoolCode, insert) => {});

      //Execute
      let responses = [];
      responses = await roomInfoCreateService.saveRooms(saveMultiRoomInfoRequest, 'zone:2118');

      //Expect
      expect(responses).not.toBeNull();
      responses.filter(response => response.id.toLowerCase() === saveMultiRoomInfoRequest[0].RefId.toLowerCase())
                .map(response => expect(response.statusCode).toEqual(409));
      responses.filter(response => response.id.toLowerCase() != saveMultiRoomInfoRequest[0].RefId.toLowerCase())
                .forEach(response => expect(response.statusCode).toEqual(201));
    });

  });

});
