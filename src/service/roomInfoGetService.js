const Handlebars = require('handlebars/runtime');
require('../dtoSchema/handlebarHelpers');
const repository = require('../rds/repository');
const zoneIdToSchoolCode = require('../util/utils').zoneIdToSchoolCode;
const roomInfoTemplate = Handlebars.templates['roomInfo'];
const roomInfoListTemplate = Handlebars.templates['roomInfoList'];
const xrefLambda = require('../util/xrefLambda');
const logger = require('api-node-modules').logger;
const {UUID_FORMAT} = require('api-node-modules').constant;

const getRoomsByZoneId = async (zoneId) => {
  const schoolCode = zoneIdToSchoolCode(zoneId);
  const rooms = await repository.findByLocationCode(schoolCode);
  if (!rooms || rooms.length === 0) {
    let message = '';
    try {
      await xrefLambda.findSchoolRef(schoolCode);
      message = `Rooms for school [${schoolCode}] not found`;
    } catch(e) {
      message = `School ${schoolCode} does not exist`;
    }

    return Promise.reject({
      statusCode: 404,
      statusMessage: 'Not Found',
      description: message
    });
  }

  return roomInfoListTemplate(rooms);
};

const getRoomByRefId = async (refId, zoneId) => {
  const schoolCode = zoneIdToSchoolCode(zoneId);
  if (refId && !refId.match(UUID_FORMAT)) {
     logger.error(`RoomInfo RefId ${refId} is not a valid UUID`);
     return Promise.reject({
                statusCode: 400,
                statusMessage: 'Invalid RefId format',
                description: `Room with RefId: ${refId} under ZoneId: ${zoneId} not found`
              });
  }

  const rooms = await repository.findByRefIdAndLocationCode(refId.toLowerCase(), schoolCode);
  logger.debug('\n inside service getRoomByRefId : rooms ' + JSON.stringify(rooms, null, 2));

  if (rooms && rooms.length > 0 && rooms[0].ref_id.toLowerCase() === refId.toLowerCase()) {
    return roomInfoTemplate(rooms[0]);
  }

  let message = '';
  try {
    await xrefLambda.findSchoolRef(schoolCode);
    message = `Room with RefId: ${refId} under ZoneId: ${zoneId} not found`;
  } catch(e) {
    message = `School ${schoolCode} does not exist`;
  }

  return Promise.reject({
    statusCode: 404,
    statusMessage: 'Not Found',
    description: message
  });
};

const checkIfRoomExistsByRefId = async (refId) => {
    const existingRooms = await repository.findByRefId(refId.toLowerCase());
    if(existingRooms && existingRooms.length > 0 && existingRooms[0].ref_id.toLowerCase() === refId.toLowerCase()) {
        return existingRooms[0];
    }
    return null;
}

const checkIfRoomExistsByRefIdAndLocationCode = async (refId, schoolCode) => {
    const existingRooms = await repository.findByRefIdAndLocationCode(refId.toLowerCase(), schoolCode);
    if(existingRooms && existingRooms.length > 0 && existingRooms[0].ref_id.toLowerCase() === refId.toLowerCase()) {
        return existingRooms[0];
    }
    return null;
}

module.exports = {
  getRoomByRefId,
  getRoomsByZoneId,
  checkIfRoomExistsByRefId,
  checkIfRoomExistsByRefIdAndLocationCode
};
