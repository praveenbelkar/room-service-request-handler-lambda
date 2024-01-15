const Handlebars = require('handlebars/runtime');
require('../dtoSchema/handlebarHelpers');
const repository = require('../rds/repository');
const zoneIdToSchoolCode = require('../util/utils').zoneIdToSchoolCode;
const roomInfoTemplate = Handlebars.templates['roomInfo'];
const roomInfoListTemplate = Handlebars.templates['roomInfoList'];
const roomInfoGetService = require('./roomInfoGetService');
const logger = require('api-node-modules').logger;

const saveRoom = async (roomInfo, zoneId) => {
    logger.debug('\nroomInfoService: ' + JSON.stringify(roomInfo, null, 2));
    let response;
    try {
        if(roomInfo) {
            const refId = roomInfo.RefId;
            const schoolCode = zoneIdToSchoolCode(zoneId);

            let existingRoomInfo = null;
            existingRoomInfo = await roomInfoGetService.checkIfRoomExistsByRefId(refId);
            if(existingRoomInfo) {
                logger.error('Duplicate Room already exists. Not adding..refId ' + refId);
                return {
                    id: refId,
                    statusCode: 409,
                    statusMessage: 'Duplicate Room already exists'
                };
            }

            const roomsRepoRequest = [];
            roomsRepoRequest.push(roomInfo);
            response = await repository.saveRoom(roomsRepoRequest, schoolCode, true);
            return {
                id: roomInfo.RefId,
                statusCode: 201
            }
        }
    } catch(error) {
        let message = error.message;
        let statusCode = 500;

        return {
            id: roomInfo.RefId,
            statusCode: statusCode,
            statusMessage: 'Internal Server Error'
        };
    }
}

const saveRooms = async (roomInfos, zoneId) => {
    logger.debug('\nroomInfoService: saveRooms() ' + JSON.stringify(roomInfos, null, 2));
    if(roomInfos.length > 0) {
        const duplicateRoomsArray = [];
        const newRoomsArray = [];
        try {
            const schoolCode = zoneIdToSchoolCode(zoneId);
            for(const roomInfo of roomInfos) {
                let refId = roomInfo.RefId;
                let existingRoomInfo = null;
                existingRoomInfo = await roomInfoGetService.checkIfRoomExistsByRefId(refId);
                if(existingRoomInfo) {
                    logger.info('Duplicate Room already exists. Not adding..refId ' + refId);
                    duplicateRoomsArray.push(roomInfo);
                    continue;
                }
                newRoomsArray.push(roomInfo);
            }
            logger.debug('\nbefore calling saveRoom: \n' + JSON.stringify(newRoomsArray, null, 2));
            if(newRoomsArray && newRoomsArray.length > 0) {
                await repository.saveRoom(newRoomsArray, schoolCode, true);
            }
            let successResponse =  buildSuccessResponseArray(newRoomsArray, 201);
            const duplicateRoomsResponse =  buildSuccessResponseArray(duplicateRoomsArray, 409, "Duplicate Record");
            successResponse = successResponse.concat(duplicateRoomsResponse);
            logger.debug('successResponse ' + JSON.stringify(successResponse, null, 2));
            logger.debug('duplicateRoomsResponse ' + JSON.stringify(duplicateRoomsResponse, null, 2));
            return successResponse;
        } catch (e) {
            logger.error(JSON.stringify(e,null,2));
            let statusCode = 500;
            if(e.message.startsWith('duplicate key value')) {
                statusCode = 400;
            }
            return [{
                statusCode: statusCode,
                statusMessage: 'Internal Server Error'
            }];
        }
    }
}

const buildSuccessResponseArray = (roomInfos, statusCode, statusMessage) => {
    const responseArr = [];
    for(const roomInfo of roomInfos) {
        responseArr.push(
            {
                id : roomInfo.RefId,
                statusCode: statusCode,
                statusMessage: statusMessage
            }
        )
    }
    return responseArr;
}

module.exports = {
  saveRoom,
  saveRooms
};
