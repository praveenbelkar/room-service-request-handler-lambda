const {HEADERS} = require("api-node-modules").constant;
const {getByKeyIgnoreCase} = require("api-node-modules").utils;

const zoneIdToSchoolCode = (zoneId) => {
  return zoneId.substring(zoneId.lastIndexOf(':') + 1);
};

const isSchoolInfoRedIdValid = (xrefSchoolInfoRefId, requestSchoolInfoRefId) => {
    const result = (xrefSchoolInfoRefId && requestSchoolInfoRefId && xrefSchoolInfoRefId.toLowerCase() === requestSchoolInfoRefId.toLowerCase());
    return result;
}

const addDefaultMetadataToLogger = (logger, event) => {
    logger.defaultMeta['RequestId'] = getByKeyIgnoreCase(event.headers, HEADERS.REQUEST_ID);
    logger.defaultMeta['ZoneId'] = getByKeyIgnoreCase(event.headers, HEADERS.ZONE_ID);
    logger.defaultMeta['MessageId'] = getByKeyIgnoreCase(event.headers, HEADERS.MESSAGE_ID);
    logger.defaultMeta['RefId'] = undefined; //forcefully clearing it, so we do not log refid from previous invocation
}

const addRefIdMetadataToLogger = (logger, sifRequest) => {
    let refIds = sifRequest?.RoomInfos?.RoomInfo?.map(e => e?.RefId);

    if(refIds) {
        logger.defaultMeta['RefId'] = refIds;
    } else {
        logger.defaultMeta['RefId'] = sifRequest?.RoomInfo?.RefId;
    }
}

const addRefIdMetadataToLoggerFromPathParam = (logger, event) => {
    let refId = getByKeyIgnoreCase(event['pathParameters'], 'refid');
    if(refId)
        logger.defaultMeta['RefId'] = refId;
}

module.exports = {
    zoneIdToSchoolCode,
    isSchoolInfoRedIdValid,
    addDefaultMetadataToLogger,
    addRefIdMetadataToLogger,
    addRefIdMetadataToLoggerFromPathParam
};
