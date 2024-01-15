const {responseBuilder} = require("api-node-modules");
const {getByKeyIgnoreCase} = require("api-node-modules").utils;
const {HEADERS} = require("api-node-modules").constant;
const logger = require('api-node-modules').logger;
const {OpenAPIBackend} = require("openapi-backend");
const requestValidationService = require('api-node-modules').validator;
const roomInfoGetService = require('../service/roomInfoGetService');
const roomInfoCreateService = require('../service/roomInfoCreateService');
const roomInfoUpdateService = require('../service/roomInfoUpdateService');
const {zoneIdToSchoolCode, addRefIdMetadataToLogger} = require('../util/utils');
const isSchoolInfoRedIdValid = require('../util/utils').isSchoolInfoRedIdValid;
const findSchoolRef = require('../util/xrefLambda').findSchoolRef;

const api = new OpenAPIBackend({
    //definition: "./src/openApiSpec/sais-api-roominfo-v3-1.0.0.yaml",
    definition: process.env.SPEC_FILE_PATH || "../../../../src/openApiSpec/sais-api-roominfo-v3-1.0.0.yaml",
    quick: true,
    strict: false,
    ajvOpts: {allErrors: true}
});

const initAPI = api.init();

exports.handler = async (event, context) => {
    const requestId = getByKeyIgnoreCase(event.headers, HEADERS.REQUEST_ID);
    const requestAction = getByKeyIgnoreCase(event.headers, HEADERS.REQUEST_ACTION);

    //Header Validations
    let validationError = requestValidationService.validate(event);
    if (validationError) {
        logger.error(' Request Validation Failed: ' + validationError.description);

        return responseBuilder.buildErrorResponse(
            validationError,
            requestId,
            requestAction,
            event.path
        );
    }

    if(!event.body) {
        return responseBuilder.buildErrorResponse(
            {
                statusCode: 400,
                statusMessage: 'Empty body not allowed'
            },
            requestId,
            requestAction,
            event.path
        );
    }

    //wait for OpenAPI Backend to be initialized with OpenAPI Spec
    //TODO uncomment if we get api yaml
    await initAPI;
    let path = event.path;

    if (path.endsWith('RoomInfos')) {
        return createRoomInfos(event)
    } else if (path.endsWith('RoomInfo')) {
        return createRoomInfo(event);
    }

    return createRoomInfo(event);
//    return responseBuilder.buildErrorResponse({statusCode: 404}, requestId, requestAction, event.path)
}

async function createRoomInfo(event) {
    logger.info(`Received createRoom`);
    const requestId = getByKeyIgnoreCase(event.headers, HEADERS.REQUEST_ID);
    const requestAction = getByKeyIgnoreCase(event.headers, HEADERS.REQUEST_ACTION);
    let operationId;
    const zoneId = getByKeyIgnoreCase(event.headers, HEADERS.ZONE_ID);
    if (event.httpMethod === 'POST')
        operationId = 'createRoomInfo';
    else
        operationId = 'updatRoomInfo';

    let result = validateRequestBodyAgainstAPISpec(event, operationId);
    logger.debug('result ' + JSON.stringify(result, null, 2));
    if (!result.valid) {
        let error = extractTopLevelError(result.errors[0]);
        let validationMsg = consolidatedValidationMsg(result.errors);
        if (!error) {
            error = {
                message: validationMsg
            };
        }

        return responseBuilder.buildErrorResponse(buildValidationError(error), requestId, requestAction, event.path);
    }

    let sifRequest = JSON.parse(event.body);
    // let sifRequest = event.body;
    addRefIdMetadataToLogger(logger, sifRequest);
    //Sif-Extended-Elemnts validatin
    result = validateSifExtendedElements(sifRequest['RoomInfo'], operationId);
    if(result.valid === false) {
        logger.error('Failure validateSifExtendedElements ' + JSON.stringify(result, null, 2));
        return responseBuilder.buildErrorResponse(
            {
                statusCode: 400,
                statusMessage: result.message
            }, requestId, requestAction, event.path);
    }

    //SchoolRefId validation
    const xrefSchoolInfoValidation = await isValidSchoolInfoRefId(zoneId, sifRequest.RoomInfo.SchoolInfoRefId);
    if(xrefSchoolInfoValidation.valid == false) {
        let xrefValidationMessage = 'SchoolInfoRefId in the request  does not match the SchoolInfoRefId corresponding to location code in the header';
        let xrefValidationStatusCode = 400;
        if(xrefSchoolInfoValidation.serviceAvailable == false) {
            xrefValidationMessage = 'XrefService Lambda is not available';
            xrefValidationStatusCode = 500;
        }
        return responseBuilder.buildErrorResponse({
            statusCode: xrefValidationStatusCode,
            statusMessage: xrefValidationMessage
        }, requestId, requestAction, event.path);
    }

    let response;
    if (event.httpMethod === 'POST') {
        response = await roomInfoCreateService.saveRoom(sifRequest['RoomInfo'],zoneId);
        logger.debug('response : ' + JSON.stringify(response, null, 2));
    } else {
        const refId = getByKeyIgnoreCase(event['pathParameters'], 'refId');
        if (refId !== sifRequest.RoomInfo?.RefId) {
            let errMessage = `RefId ${refId} on URL does not match the payload ${sifRequest.RoomInfo?.RefId}`;
            logger.error(errMessage);
            return responseBuilder.buildErrorResponse({
                statusCode: 400,
                statusMessage: errMessage
            }, requestId, requestAction, event.path);
        }
        response = await roomInfoUpdateService.updateRoomInfo(sifRequest['RoomInfo'], zoneId);
        logger.debug('response' + JSON.stringify(response, null, 2));
    }

    if (response.statusCode === 201 || response.statusCode === 200) {
        let getResponse = await roomInfoGetService.getRoomByRefId(response.id, zoneId);
        return responseBuilder.buildSuccessResponse(getResponse, requestId, requestAction, response.statusCode);
    }

    return responseBuilder.buildErrorResponse({
        statusCode: response.statusCode,
        statusMessage: response.statusMessage
    }, requestId, requestAction, event.path);
}

async function createRoomInfos(event) {
    logger.info(`Received createRooms`);
    const requestId = getByKeyIgnoreCase(event.headers, HEADERS.REQUEST_ID);
    const requestAction = getByKeyIgnoreCase(event.headers, HEADERS.REQUEST_ACTION);
    const zoneId = getByKeyIgnoreCase(event.headers, HEADERS.ZONE_ID);
    let roomInfoRequestArr = [];
    let errorArr = [];
    let responseArr = [];
    let result;
    let operationId;

    if(event.httpMethod === 'POST') {
        operationId = 'creatRoomInfos';
    } else {
        operationId = 'updateRoomInfos';
    }
    result = validateRequestBodyAgainstAPISpec(event, operationId);
    let sifRequest = JSON.parse(event.body);
    //let sifRequest = event.body;
    const emptyBodyCheck = checkForEmptyBody(sifRequest);
    if(!emptyBodyCheck.valid) {
        return responseBuilder.buildErrorResponse(
            {
                statusCode: 400,
                statusMessage: emptyBodyCheck.message || 'Empty body not allowed'
            },
            requestId,
            requestAction,
            event.path
        );
    }
    let duplicateRefIds = identifyDuplicateRefIds(sifRequest);

    if (!result.valid) {
        logger.error('request has some validation errors' + JSON.stringify(result, null, 2));
        let topLevelError = extractTopLevelError(result.errors[0]);

        if (topLevelError) {
            return responseBuilder.buildErrorResponse(buildValidationError(topLevelError), requestId, requestAction, event.path);
        }

        addRefIdMetadataToLogger(logger, sifRequest);
        let arrIndexToObjectMap = parseErrors(result.errors);

        for (let i = 0; i < sifRequest['RoomInfos']['RoomInfo'].length; i++) {
            let indexString = i.toString();
            let element = sifRequest['RoomInfos']['RoomInfo'][i];
            for (const x of Array.from(arrIndexToObjectMap.keys())) {
              //console.log(x)
            }
            let extendedElementValidation = validateSifExtendedElements(element, operationId);
            if (arrIndexToObjectMap.has(indexString)) {
                let validationErr = arrIndexToObjectMap.get(indexString);
                logger.error('validationErr ' + JSON.stringify(validationErr, null, 2));
                let validationErrMsg = consolidatedValidationMsg(validationErr);
                let fieldError = {
                    message: validationErrMsg
                }
                if(validationErr) {
                    errorArr.push({
                                id: element.RefId,
                                ...buildValidationError(fieldError)
                            });
                }
                continue;
            }
            if(extendedElementValidation.valid == false) {
                errorArr.push({
                                    id: element.RefId,
                                    ...buildValidationError(extendedElementValidation)
                                });
                continue;
            }
            if(isDuplicateRefId(duplicateRefIds, element.RefId)) {
                errorArr.push({
                                    id: element.RefId,
                                    ...buildValidationError({message: 'Duplicate RefIds in request body'})
                                });
                continue;
            }

            const xrefSchoolInfoValidation = await isValidSchoolInfoRefId(zoneId, element.SchoolInfoRefId);
            if(xrefSchoolInfoValidation.valid === false) {
                let xrefValidationMessage = 'SchoolInfoRefId in the request  does not match the SchoolInfoRefId corresponding to location code in the header';
                let xrefValidationStatusCode = 400;
                if(xrefSchoolInfoValidation.serviceAvailable == false) {
                    xrefValidationMessage = 'XrefService Lambda is not available';
                    xrefValidationStatusCode = 500
                }
                errorArr.push({
                                    id: element.RefId,
                                    ...{
                                        statusCode: xrefValidationStatusCode,
                                        statusMessage: xrefValidationMessage
                                       }
                                });
                continue;
            }

            roomInfoRequestArr.push(sifRequest['RoomInfos']['RoomInfo'][i]);
        }
    } else {
        addRefIdMetadataToLogger(logger, sifRequest);
        for (let i = 0; i < sifRequest['RoomInfos']['RoomInfo'].length; i++) {
            const element = sifRequest['RoomInfos']['RoomInfo'][i];
            let extendedElementValidation = validateSifExtendedElements(element, operationId);

            if(extendedElementValidation.valid === false) {
                errorArr.push({
                                    id: element.RefId,
                                    ...buildValidationError(extendedElementValidation)
                                });
                continue;
            }

            if(isDuplicateRefId(duplicateRefIds, element.RefId)) {
                errorArr.push({
                                    id: element.RefId,
                                    ...buildValidationError({message: 'Duplicate RefId in request body'})
                                });
                continue;
            }

            const xrefSchoolInfoValidation = await isValidSchoolInfoRefId(zoneId, element.SchoolInfoRefId);
            if(xrefSchoolInfoValidation.valid === false) {
                let xrefValidationMessage = 'SchoolInfoRefId in the request  does not match the SchoolInfoRefId corresponding to location code in the header';
                let xrefValidationStatusCode = 400;
                if(xrefSchoolInfoValidation.serviceAvailable == false) {
                    xrefValidationMessage = 'XrefService Lambda is not available';
                    xrefValidationStatusCode = 500
                }
                errorArr.push({
                                    id: element.RefId,
                                    ...{
                                        statusCode: xrefValidationStatusCode,
                                        statusMessage: xrefValidationMessage
                                       }
                                });
                continue;
            }

            roomInfoRequestArr.push(element);
        }
    }

    if(roomInfoRequestArr && roomInfoRequestArr.length > 0) {
        if (event.httpMethod === 'POST' && roomInfoRequestArr.length > 0) {
            responseArr = await roomInfoCreateService.saveRooms(roomInfoRequestArr, zoneId);
        } else if(event.httpMethod === 'PUT' && roomInfoRequestArr.length > 0) {
            responseArr = await roomInfoUpdateService.updateRoomInfos(roomInfoRequestArr, zoneId);
        }
    }
    let transformedResponse = buildResponse(responseArr.concat(errorArr), event);
    logger.debug('\n\n\ntransformedResponse: ' + JSON.stringify(transformedResponse, null, 2));
    const overAllStatusCode = checkForAtleastOneSuccess(transformedResponse);
    if(overAllStatusCode == 500) {
        return responseBuilder.buildErrorResponse(
                    {
                        statusCode: 500,
                        statusMessage: 'Internal Service Error'
                    },
                    requestId,
                    requestAction,
                    event.path
                );
    }
    return responseBuilder.buildSuccessResponse(JSON.stringify(transformedResponse), requestId, requestAction, overAllStatusCode);
}

function buildResponse(responseArr, event) {
    if (event.httpMethod === 'POST')
        return {
            createResponse: {
                creates: {
                    create: convertErrorsIfAnyToSifFormat(responseArr, event.path, 201)
                }
            }
        }
    else
        return {
            updateResponse: {
                updates: {
                    update: convertErrorsIfAnyToSifFormat(responseArr, event.path, 200)
                }
            }
        }
}

function convertErrorsIfAnyToSifFormat(response, path, statusCode) {
    return response.map(e => {
        if (e.statusCode !== statusCode) {
            return buildErrorObject(e, path);
        }

        return e;
    });
}

function buildErrorObject(error, scope) {
    return {
        id: error.id,
        statusCode: error?.statusCode || 400,
        ...JSON.parse(responseBuilder.buildErrorResponseBody({
            statusCode: error?.statusCode || 400,
            statusMessage: error?.statusMessage
        }, scope))
    }
}

function validateRequestBodyAgainstAPISpec(event, operationId) {
    return api.validateRequest(
        {
            method: event.httpMethod,
            path: event.path,
            //body: JSON.parse(event.body),
            body: event.body,
            headers: event.headers,
        },
        operationId);
}

function buildValidationError(error) {
    return {
        statusCode: 400,
        statusMessage: `${error.message}${error.field ? ` in ${error.field}` : ''}`
    }
}

function parseErrors(validationErrors) {
    let errorMap = new Map();
    validationErrors.forEach(error => {
        let instancePathSplitArr = error.instancePath?.split("/");
        let objIndex = instancePathSplitArr[4];
        let errorObj = {
                           //field: error.instancePath?.split('/RoomInfos')[1],
                           field: error.schemaPath,
                           message: error.message,
                       };
        let errorArr = errorMap.get(objIndex);
        if(!errorArr || errorArr.length == 0) {
            errorArr = [];
        }
        //errorArr.push(errorObj);
        errorArr.push(error);
        errorMap.set(objIndex, errorArr);
    });
    errorMap.forEach((val, key) => { logger.debug(key + ":" + JSON.stringify(val))});
    return errorMap;
}

function extractTopLevelError(error) {

    let instancePath = error?.instancePath;

    if (!instancePath || instancePath.endsWith("/requestBody")) {
        return {
            message: error.message
        }
    }

    /*if (instancePath.endsWith("/RoomInfos")
        || instancePath.endsWith("/RoomInfo")) {
        return {
            field: instancePath.split('requestBody/')[1],
            message: error.message
        };
    }*/

    return null;
}

function validateSifExtendedElements(roomInfo, operationId) {
    let result = { valid: true, message:  roomInfo.RefId + ': ' };
    if(roomInfo['SIF_ExtendedElements']) {
        const sifExtendedElements = roomInfo['SIF_ExtendedElements']['SIF_ExtendedElement'];
        const status = sifExtendedElements.filter(sifExtendedElement => sifExtendedElement.Name === 'Status')
                                                                    .map(sifExtendedElement => sifExtendedElement.value);
        const source = sifExtendedElements.filter(sifExtendedElement => sifExtendedElement.Name === 'Source')
                                                                    .map(sifExtendedElement => sifExtendedElement.value);
        if(status == '') {
            result.valid = false;
            result.message = result.message + ' Missing mandatory extended element - status ';
        }

        if(status != '' && !(status == 'A' || status == 'I')) {
            result.valid = false;
            result.message = result.message + 'Invalid status value. ';
        }

        if(source == '') {
            result.valid = false;
            result.message = result.message + ' Missing mandatory extended element - source ';
        }

        if(source != '' && operationId.startsWith('creat') && source != 'V') { //If Create(POST) only source with 'V' is allowed
            result.valid = false;
            result.message = result.message + ' Invalid source value. Only V is allowed ';
        }  else if(source != '' &&  operationId.startsWith('updat') && !(source == 'A' || source == 'E' || source == 'V')) { //If update(PUT) only source with ('A','E', 'V') is allowed
            result.valid = false;
            result.message = result.message + ' Invalid source value.';
        }
    } else {
        result.valid = false;
        result.message = 'Missing sif-extended elements - Status, source'
    }
    return result;
}

function checkForAtleastOneSuccess(transformedResponse) {
    let overAllStatusCode = 200;
    if(transformedResponse) {
        if(transformedResponse.createResponse && transformedResponse.createResponse.creates && transformedResponse.createResponse.creates.create) {
            const createdResponses = transformedResponse.createResponse.creates.create;
            const atleastOneSuccess = createdResponses.some(createdResponse => createdResponse.statusCode === 201);
            const atleastOneInputFailure = createdResponses.some(createdResponse => (createdResponse.statusCode >= 400 && createdResponse.statusCode < 500));
            if(atleastOneSuccess) {
                overAllStatusCode = 200;
            } else if(atleastOneInputFailure) {
                overAllStatusCode = 400;
            } else {
                overAllStatusCode = 500;
            }
        } else if(transformedResponse.updateResponse && transformedResponse.updateResponse.updates && transformedResponse.updateResponse.updates.update) {
            const updatedResponses = transformedResponse.updateResponse.updates.update;
            const atleastOneSuccess = updatedResponses.some(updatedResponse => updatedResponse.statusCode === 200);
            const atleastOneInputFailure = updatedResponses.some(updatedResponse => (updatedResponse.statusCode >= 400 && updatedResponse.statusCode < 500));
            if(atleastOneSuccess) {
                overAllStatusCode = 200;
            } else if(atleastOneInputFailure) {
                overAllStatusCode = 400;
            } else {
                overAllStatusCode = 500;
            }
        }
    }
    return overAllStatusCode;
}

function identifyDuplicateRefIds(sifRequest) {
    let duplicateRefIds = [];
    if(sifRequest.RoomInfos && sifRequest.RoomInfos.RoomInfo) {
        const refIdArr = sifRequest.RoomInfos.RoomInfo.map( roomInfo => roomInfo.RefId);
        duplicateRefIds = refIdArr.filter((refId, idx) => refIdArr.indexOf(refId) != idx);
    }
    return duplicateRefIds;
}

function isDuplicateRefId(duplicateRefIds, refId) {
    return duplicateRefIds.includes(refId);
}

async function isValidSchoolInfoRefId(zoneId, requestSchoolInfoRefId) {
    const xrefSchoolInfoValidation = {
        valid : true,
        serviceAvailable: true
    };
    const schoolCode = zoneIdToSchoolCode(zoneId);
    try {
        const xrefSchoolInfoRefId = await findSchoolRef(schoolCode);
        logger.debug('xrefSchoolInfoRefId '+ xrefSchoolInfoRefId);
        if(xrefSchoolInfoRefId && isSchoolInfoRedIdValid(xrefSchoolInfoRefId, requestSchoolInfoRefId)) {
            xrefSchoolInfoValidation.valid = true;;
        } else {
            xrefSchoolInfoValidation.valid = false;
        }
    } catch(e) {
        xrefSchoolInfoValidation.valid = false;
        xrefSchoolInfoValidation.serviceAvailable = false;
    }
    return xrefSchoolInfoValidation;
}

function consolidatedValidationMsg(errors) {
    return errors.filter(err => err.keyword != 'enum').map(err =>  {
            const field = getErringFieldName(err.schemaPath) || '';
            let msg = err.message;
            if(err.message.trim().endsWith("oneOf")) {
                msg = msg + ' allowed values';
            }
            return field + ' ' + msg + ' ';
        }).join("\n");
}

function checkForEmptyBody(sifRequest) {
    const emptyBodyCheck = {
        valid : true,
        message : ''
    };

    if(!sifRequest.RoomInfos) {
        emptyBodyCheck.valid = false;
        emptyBodyCheck.message = 'Request Body cannot be empty';
    } else if(!sifRequest.RoomInfos.RoomInfo) {
        emptyBodyCheck.valid = false;
        emptyBodyCheck.message = 'Request Body should have RoomInfo attributes inside RoomInfos';
    } else if(sifRequest.RoomInfos.RoomInfo.length == 0) {
        emptyBodyCheck.valid = false;
        emptyBodyCheck.message = 'RoomInfos.RoomInfo should have atleast one RoomInfo';
    }

    return emptyBodyCheck;
}

function getErringFieldName(erringSchemaPath) {
    let index = erringSchemaPath.lastIndexOf('properties');
    let field = '';
    if(index != -1) {
        index = index + 11;
        const fieldStr = erringSchemaPath.substring(index);
        const nextIndex = fieldStr.indexOf('/');
        if(nextIndex != -1) {
            field = fieldStr.substring(0, nextIndex);
        }
    }
    return field;
}