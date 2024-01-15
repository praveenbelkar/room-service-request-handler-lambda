const config = require('../../config');
const { query } = require('./client');
const { insertQuery } = require('./client');
const { updateQuery } = require('./client');
const { randomUUID } = require("crypto");
const dayjs  = require('dayjs');
const uuid = require('uuid');
const logger = require('api-node-modules').logger;

const TABLE_NAME = `${config.DB_SCHEMA}.${config.DB_TABLE_NAME}`;

const pageableQuery = (query, paging) => {
  const page = paging.page;
  const pageSize = paging.pageSize;
  const offset = (page - 1) * pageSize;
  return `${query} LIMIT ${pageSize} OFFSET ${offset}`;
};

const withPaging = (query, paging) => {
  if (!paging) {
    return query;
  }
  return pageableQuery(query, paging);
};

const findByLocationCode = async (locationCode, paging) => {
  const queryString = withPaging(
    `SELECT * FROM ${TABLE_NAME} WHERE location_code = '${locationCode}'`,
    paging
  );

  return await query(queryString);
};

const findByRefIdAndLocationCode = async (refId, locationCode) => {
  const queryString = `SELECT * FROM ${TABLE_NAME} WHERE ref_id = '${refId}' AND location_code = '${locationCode}'`;
  logger.debug('\n queryString: \n' + queryString);
  return await query(queryString);
};

const findByRefId = async (refId) => {
  const queryString = `SELECT * FROM ${TABLE_NAME} WHERE ref_id = '${refId}'`;
  logger.debug('\n queryString: \n' + queryString);
  return await query(queryString);
};

const saveRoom = async (roomInfos, schoolCode, insert)  => {
    let values = null;
    const currentTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS');
    if(roomInfos && roomInfos.length > 0) {
        values = roomInfos.map( roomInfo => {

                                    if(roomInfo) {
                                          const sifExtendedElement = getSifExtendedElement(roomInfo);
                                          return {
                                            ref_id: roomInfo.RefId.toLowerCase(),
                                            school_ref_id: roomInfo.SchoolInfoRefId.toLowerCase(),
                                            location_code: schoolCode,
                                            room_code: roomInfo.roomCode,
                                            short_description: roomInfo.RoomNumber,
                                            long_description: roomInfo.Description,
                                            square_metres: roomInfo.Size,
                                            capacity: roomInfo.Capacity,
                                            room_type: roomInfo.RoomType,
                                            status: sifExtendedElement.status,
                                            source: sifExtendedElement.source,
                                            created_time: roomInfo.CreatedTime || currentTime,
                                            updated_time: currentTime,
                                            local_id: roomInfo.LocalId,
                                            can_be_timetabled: roomInfo.AvailableForTimetable,
                                            room_type_description: sifExtendedElement.roomTypeDescription
                                          };
                                    }
                                });

    }
    if(insert) {
        await insertQuery(values);
    } else {
        await updateQuery(values);
    }

}

const getSifExtendedElement = (roomInfo) => {
    let status = null;
    let source = null;
    let roomTypeDescription = null;
    if(roomInfo.SIF_ExtendedElements) {
        for(sifExtendedElement of roomInfo.SIF_ExtendedElements.SIF_ExtendedElement) {
            if(sifExtendedElement.Name && sifExtendedElement.Name === 'Status') {
                status = sifExtendedElement.value;
            }
            if(sifExtendedElement.Name && sifExtendedElement.Name === 'Source') {
                source = sifExtendedElement.value;
            }
            if(sifExtendedElement.Name && sifExtendedElement.Name === 'RoomTypeDescription') {
                roomTypeDescription = sifExtendedElement.value;
            }
        }
    }
    return {
        status: status,
        source: source,
        roomTypeDescription: roomTypeDescription
    };
}
module.exports = { findByLocationCode, findByRefIdAndLocationCode, findByRefId, saveRoom };
