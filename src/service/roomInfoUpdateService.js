const Handlebars = require('handlebars/runtime');
require('../dtoSchema/handlebarHelpers');
const repository = require('../rds/repository');
const zoneIdToSchoolCode = require('../util/utils').zoneIdToSchoolCode;
const roomInfoTemplate = Handlebars.templates['roomInfo'];
const roomInfoListTemplate = Handlebars.templates['roomInfoList'];
const roomInfoGetService = require('./roomInfoGetService');
const logger = require('api-node-modules').logger;
const {UUID_FORMAT} = require('api-node-modules').constant;

const updateRoomInfo = async (roomInfo, zoneId) => {
    logger.debug('\nroomInfoUpdateService: ' + JSON.stringify(roomInfo, null, 2));
    let response;
    try {
        if(roomInfo) {
            const refId = roomInfo.RefId;
            const schoolCode = zoneIdToSchoolCode(zoneId);
            let existingRoomInfo = null;
            if (refId && !refId.match(UUID_FORMAT)) {
               logger.error(`RoomInfo RefId ${refId} is not a valid UUID`);
                 return {
                            id: refId,
                            statusCode: 400,
                            statusMessage: 'RefId should match the format ^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
                        };
            }

            existingRoomInfo = await roomInfoGetService.checkIfRoomExistsByRefIdAndLocationCode(refId, schoolCode);
            logger.debug('Existing existingRoomInfo ' + JSON.stringify(existingRoomInfo, null, 2));
            if(existingRoomInfo) {
                logger.debug('Room existing...proceeding to check attribute update permission ' + refId);
            } else {
                return {
                    id: refId,
                    statusCode: 404,
                    statusMessage: 'Room Not Found'
                }
            }

            const delta = deltaBetweenExistingAndRequestRoom(existingRoomInfo, roomInfo);
            logger.debug('delta: ' + JSON.stringify(delta, null, 2));
            const disAllowedUpdateAttributes = updatingNotAllowedAttributes(delta);
            if(existingRoomInfo.source == 'E') {
                return {
                    id: refId,
                    statusCode: 400,
                    statusMessage: 'No permission to update for the room with source value E'
                };
            }

            if(disAllowedUpdateAttributes.disAllowed == true) {
                return {
                    id: refId,
                    statusCode: 400,
                    statusMessage: 'No permission to update the attribute for the vendor: ' + disAllowedUpdateAttributes.disAllowedAttributes
                };
            }

            roomInfo = updateAttributeValuesAsPerPermission(delta, roomInfo, existingRoomInfo);
            logger.debug('Update request after adjusting as per source... ' + JSON.stringify(roomInfo, null, 2));
            roomInfo.CreatedTime = existingRoomInfo.created_time;
            const roomsRepoRequest = [];
            roomsRepoRequest.push(roomInfo);

            const isInsert = false;
            response = await repository.saveRoom(roomsRepoRequest, schoolCode, isInsert);
            logger.debug('successful ')
            return {
                id: roomInfo.RefId,
                statusCode: 200
            }
        }
    } catch(error) {
        logger.error(JSON.stringify(error, null, 2));
        let statusCode = error.statusCode || 500;

        return {
            id: roomInfo.RefId,
            statusCode: statusCode,
            statusMessage: 'Internal Server Error'
        };
    }
}

const updateRoomInfos = async (roomInfos, zoneId) => {
    logger.debug('\nroomInfoUpdateService: updateRoomInfos() ' + JSON.stringify(roomInfos, null, 2));
    if(roomInfos.length > 0) {
        const nonExistingRoomsArray = [];
        const existingRoomsArray = [];
        const noUpdatePermissionArray = [];
        try {
            const schoolCode = zoneIdToSchoolCode(zoneId);
            for(let roomInfo of roomInfos) {
                let refId = roomInfo.RefId;
                let existingRoomInfo = null;
                existingRoomInfo = await roomInfoGetService.checkIfRoomExistsByRefIdAndLocationCode(refId, schoolCode);
                logger.debug('Existing existingRoomInfo ' + JSON.stringify(existingRoomInfo, null, 2));
                if(existingRoomInfo) {
                    logger.debug('Room existing...reverting the attribute values as allowed (based on source value) ');

                    let delta = deltaBetweenExistingAndRequestRoom(existingRoomInfo, roomInfo);
                    const disAllowedUpdateAttributes = updatingNotAllowedAttributes(delta);
                    if(disAllowedUpdateAttributes.disAllowed == true || existingRoomInfo.source == 'E') {
                        noUpdatePermissionArray.push(roomInfo);
                        continue;
                    }

                    logger.debug('delta: ' + JSON.stringify(delta, null, 2));
                    roomInfo = updateAttributeValuesAsPerPermission(delta, roomInfo, existingRoomInfo);
                    logger.debug('Update request after adjusting as per source... ' + JSON.stringify(roomInfo, null, 2));
                    roomInfo.CreatedTime = existingRoomInfo.created_time;
                    existingRoomsArray.push(roomInfo);
                    continue;
                } else {
                    nonExistingRoomsArray.push(roomInfo);
                }
            }
            logger.debug('\nbefore calling saveRoom: \n' + JSON.stringify(existingRoomsArray, null, 2));
            if(existingRoomsArray && existingRoomsArray.length > 0) {
                await repository.saveRoom(existingRoomsArray, schoolCode);
            }
            let existingRoomsResponse =  buildSuccessResponseArray(existingRoomsArray, 200);
            const nonExistingRoomsResponse =  buildSuccessResponseArray(nonExistingRoomsArray, 404, "Non-existing Record");
            const noUpdatePermissionResponse = buildSuccessResponseArray(noUpdatePermissionArray, 400, "No permission to update the attribute for the vendor");

            logger.debug('existingRoomsResponse ' + JSON.stringify(existingRoomsResponse, null, 2));
            logger.debug('nonExistingRoomsResponse ' + JSON.stringify(nonExistingRoomsResponse, null, 2));
            logger.debug('noUpdatePermissionResponse ' + JSON.stringify(noUpdatePermissionResponse, null, 2));
            return [...existingRoomsResponse, ...noUpdatePermissionResponse, ...nonExistingRoomsResponse];
        } catch (e) {
            logger.error("Error while updating "+JSON.stringify(e,null,2));
            return [{
                id: roomInfos[0].RefId,
                statusCode: 500,
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

const deltaBetweenExistingAndRequestRoom = (existingRoomInfo, roomInfo) => {
    const delta = {};
    if(diff(existingRoomInfo.school_ref_id.toLowerCase(), roomInfo.SchoolInfoRefId.toLowerCase())) {
        delta.SchoolInfoRefId = true;
    }

    if(diff(existingRoomInfo.local_id, roomInfo.LocalId)) {
        delta.LocalId = true;
    }

    if(diff(existingRoomInfo.short_description, roomInfo.RoomNumber)) {
        delta.Description = true;
    }

    if(diff(existingRoomInfo.long_description, roomInfo.Description)) {
        delta.Description = true;
    }

    if(diff(existingRoomInfo.square_metres, roomInfo.Size)) {
        delta.Size = true;
    }

    if(diff(existingRoomInfo.capacity, roomInfo.Capacity)) {
        delta.Capacity = true;
    }

    if(diff(existingRoomInfo.room_type, roomInfo.RoomType)) {
        delta.RoomType = true;
    }

    if(diff(existingRoomInfo.can_be_timetabled, roomInfo.AvailableForTimetable)) {
        delta.AvailableForTimetable = true;
    }

    const deltaExtendedElement = diffSifExtendedElements(existingRoomInfo, roomInfo);

    if(deltaExtendedElement.Status) {
        delta.Status = true;
    }

    if(deltaExtendedElement.Source) {
        delta.Source = true;
    }

    if(deltaExtendedElement.RoomTypeDescription) {
        delta.RoomTypeDescription = true;
    }

    return delta;
}


const diff = (val1, val2) => {
    if((val1 && val2 && val1 == val2) || (!val1 && !val2)) {
        return null;
    }
    return true;
}

const diffSifExtendedElements = (existingRoomInfo, newRoomInfo) => {
    const deltaExtendedElement = {};
    if(newRoomInfo.SIF_ExtendedElements && newRoomInfo['SIF_ExtendedElements']) {
        const newRoomInfoSifExtendedElements = newRoomInfo['SIF_ExtendedElements']['SIF_ExtendedElement'];
        const newRoomStatus = newRoomInfoSifExtendedElements.filter(newRoomInfoSifExtendedElement => newRoomInfoSifExtendedElement.Name === 'Status')
                                                            .map(newRoomInfoSifExtendedElement => newRoomInfoSifExtendedElement.value);
        const newRoomSource = newRoomInfoSifExtendedElements.filter(newRoomInfoSifExtendedElement => newRoomInfoSifExtendedElement.Name === 'Source')
                                                            .map(newRoomInfoSifExtendedElement => newRoomInfoSifExtendedElement.value);
        const newRoomRoomTypeDescription = newRoomInfoSifExtendedElements.filter(newRoomInfoSifExtendedElement => newRoomInfoSifExtendedElement.Name === 'RoomTypeDescription')
                                                            .map(newRoomInfoSifExtendedElement => newRoomInfoSifExtendedElement.value);

        const existingRoomStatus = existingRoomInfo.status;
        const existingRoomSource = existingRoomInfo.source;
        const existingRoomRoomTypeDescription = existingRoomInfo.room_type_description;

        if(diff(existingRoomStatus, newRoomStatus)) {
            deltaExtendedElement.Status = true;
        }
        if(diff(existingRoomSource, newRoomSource)) {
            deltaExtendedElement.Source = true;
        }
        if(diff(existingRoomRoomTypeDescription, newRoomRoomTypeDescription)) {
            deltaExtendedElement.RoomTypeDescription = true;
        }
    }
    return deltaExtendedElement;
}

const updateAttributeValuesAsPerPermission = (delta, newRoomInfoRequest, existingRoomInfo) => {
    const existingSource = existingRoomInfo.source;

    if(existingSource == 'V') { // If source is 'V' and it is trying to alter any of ( 'SchoolInfoRefId', 'LocalId', 'Source') then dont allow it.
        if(delta.SchoolInfoRefId || delta.LocalId || delta.Source) {
            newRoomInfoRequest.SchoolInfoRefId = existingRoomInfo.school_ref_id;
            newRoomInfoRequest.LocalId = existingRoomInfo.local_id;
            newRoomSourceSifExtendedElement.value = existingRoomInfo.source;
        }
    }

    if(existingSource == 'A') { // If source is 'A' and it is trying to alter any of ( 'SchoolInfoRefId', 'LocalId', 'RoomNumber', 'Size', 'Capacity', 'RoomType', 'Source', 'RoomTypeDescription') then dont allow it.
        if(delta.SchoolInfoRefId || delta.LocalId  || delta.RoomNumber || delta.Size || delta.Capacity || delta.RoomType || delta.Source || delta.RoomTypeDescription) {
            newRoomInfoRequest.SchoolInfoRefId = existingRoomInfo.school_ref_id;
            newRoomInfoRequest.LocalId = existingRoomInfo.local_id;
            newRoomInfoRequest.RoomNumber = existingRoomInfo.short_description;

            newRoomInfoRequest.Size = existingRoomInfo.square_metres;
            newRoomInfoRequest.Capacity = existingRoomInfo.capacity;
            newRoomInfoRequest.RoomType = existingRoomInfo.room_type;

            let roomTypeDescriptionFound = false;

            for(const ele of newRoomInfoRequest['SIF_ExtendedElements']['SIF_ExtendedElement']) {
                if(ele.Name == 'Source') {
                    ele.value = existingRoomInfo.source;;
                } else if(ele.Name == 'RoomTypeDescription') {
                    ele.value = existingRoomInfo.room_type_description;
                    roomTypeDescriptionFound = true;
                }
            }

            if(!roomTypeDescriptionFound) {
                newRoomInfoRequest['SIF_ExtendedElements']['SIF_ExtendedElement'].push(
                    {
                        "Name" : "RoomTypeDescription",
                        "value" : existingRoomInfo.room_type_description
                    }
                )
            }
        }

        //Make sure that room_code is not over-written. So retain the existing value for room_code
        newRoomInfoRequest.roomCode = existingRoomInfo.room_code;
    }
    return newRoomInfoRequest;
}

const updatingNotAllowedAttributes = (delta) => {
    const disAllowedUpdateAttributes = {
        disAllowed: false,
        disAllowedAttributes: ''
    }

    if(delta.RefId) {
        disAllowedUpdateAttributes.disAllowed = true;
        disAllowedUpdateAttributes.disAllowedAttributes = disAllowedUpdateAttributes.disAllowedAttributes + 'RefId, ';
    }

    if(delta.SchoolInfoRefId) {
        disAllowedUpdateAttributes.disAllowed = true;
        disAllowedUpdateAttributes.disAllowedAttributes = disAllowedUpdateAttributes.disAllowedAttributes + 'SchoolInfoRefId, ';
    }

    if(delta.LocalId) {
        disAllowedUpdateAttributes.disAllowed = true;
        disAllowedUpdateAttributes.disAllowedAttributes = disAllowedUpdateAttributes.disAllowedAttributes + 'LocalId, ';
    }

    if(delta.Source) {
        disAllowedUpdateAttributes.disAllowed = true;
        disAllowedUpdateAttributes.disAllowedAttributes = disAllowedUpdateAttributes.disAllowedAttributes + 'Source, ';
    }

    return disAllowedUpdateAttributes;
}

module.exports = {
  updateRoomInfo,
  updateRoomInfos
};
