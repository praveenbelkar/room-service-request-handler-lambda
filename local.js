//import your handler file or main file of Lambda
let indexHandler = require('./index');

let getRoomInfoByRefId = require('./src/test/data/getRoomInfoByRefId.event.json')

let saveSingleRoomJson = require('./src/test/local/saveSingleRoomInfo.event.json');
let saveSingleRoomInfoWithOnlyMandatoryFields = require('./src/test/local/saveSingleRoomInfoWithOnlyMandatoryFields.event.json');
let saveSingleRoomInfoWithMissingMandatoryFields = require('./src/test/local/saveSingleRoomInfoWithMissingMandatoryFields.event.json');
let saveSingleRoomInfoWithInvalidStatusAndSource = require('./src/test/local/saveSingleRoomInfoWithInvalidStatusAndSource.event.json');

let saveMultiRoomJson = require('./src/test/local/saveMultiRoomInfo.event.json');
let saveMultiRoomInfoWithDuplicate = require('./src/test/local/saveMultiRoomInfoWithDuplicate.event.json');
let saveMultiRoomInfoWithMissingMandatoryFields = require('./src/test/local/saveMultiRoomInfoWithMissingMandatoryFields.event.json');
let saveMultiRoomInfoWithOnlyMandatoryFields = require('./src/test/local/saveMultiRoomInfoWithOnlyMandatoryFields.event.json');
let saveMultiRoomInfoWithInvalidStatusAndSource = require('./src/test/local/saveMultiRoomInfoWithInvalidStatusAndSource.event');

let updateSingleRoomJson = require('./src/test/local/updateSingleRoomInfo.event.json');
let updateSingleRoomInfoAmsWithRoomCode = require('./src/test/local/updateSingleRoomInfoAmsWithRoomCode.event.json');
let updateSingleRoomInfoAmsSourcePermissionJson = require('./src/test/local/updateSingleRoomInfoAmsSourcePermission.event.json');
let updateSingleRoomInfoWithOnlyMandatoryFieldsJson = require('./src/test/local/updateSingleRoomInfoWithOnlyMandatoryFields.event.json');

let updateMultiRoomJson = require('./src/test/local/updateMultiRoomInfo.event.json');
let updateMultiRoomInfoWithOnlyMandatoryFieldsJson = require('./src/test/local/updateMultiRoomInfoWithOnlyMandatoryFields.event.json');
let updateMultiRoomInfoAmsSourcePermissionJson = require('./src/test/local/updateMultiRoomInfoAmsSourcePermission.event.json');
let updateSingleRoomInfoWithEasSourceJson = require('./src/test/local/updateSingleRoomInfoWithEasSource.event.json');
let updateMultiRoomWithEmptyBody = require('./src/test/local/updateMultiRoomWithEmptyBody.event.json');

let postWithNoBody = require('./src/test/local/postWithNoBody.event.json');

const { randomUUID } = require("crypto");

process.env.SPEC_FILE_PATH = '../../../../src/openApiSpec/sais-api-roominfo-v3-1.0.0.yaml';
//Call your exports function with required params
//In AWS lambda these are event, content, and callback
//event and content are JSON object and callback is a function
//In my example i'm using empty JSON

//console.log(studentBaselineJson);
//let testJson = getRoomInfoByRefId;

//save-single-room
let testJson = saveSingleRoomJson;
testJson.body.RoomInfo.RefId = randomUUID();


//save-multi-rooms
/*
let testJson = saveMultiRoomJson;
for(const roomInfo of testJson.body.RoomInfos.RoomInfo) {
    roomInfo.RefId = randomUUID();
}
*/

//save-single-with-only-mandatory-fields
//let testJson = saveSingleRoomInfoWithOnlyMandatoryFields;
//testJson.body.RoomInfo.RefId = randomUUID();

//save-multi-rooms-with-only-mandatory-fields
//let testJson = saveMultiRoomInfoWithOnlyMandatoryFields;
/*for(const roomInfo of testJson.body.RoomInfos.RoomInfo) {
    roomInfo.RefId = randomUUID();
}*/

//update-single-room
//let testJson = updateSingleRoomJson;

//update-single-ams-room-with-roomCode
//let testJson = updateSingleRoomInfoAmsWithRoomCode;

//update-multi-room
//let testJson = updateMultiRoomJson;

//update-single-AMS-source-permission-permutation
//let testJson = updateSingleRoomInfoAmsSourcePermissionJson;

//update-multi-AMS-source-permission-permutation
//let testJson = updateMultiRoomInfoAmsSourcePermissionJson;

//update-multi-AMS-source-permission-permutation
//let testJson = updateSingleRoomInfoWithEasSourceJson;

//update-single-with-only-mandatory-fields
//let testJson = updateSingleRoomInfoWithOnlyMandatoryFieldsJson;

//update-multi-with-only-mandatory-fields
//let testJson = updateMultiRoomInfoWithOnlyMandatoryFieldsJson;

//post-With-No-Body
//let testJson = postWithNoBody;

//update-multi-with-no-body
//let testJson = updateMultiRoomWithEmptyBody;

//save-multi-room-with-duplicate
//First one unique - last two duplicate
/*
let testJson = saveMultiRoomInfoWithDuplicate
let duplicateRefId = randomUUID();
for(const roomInfo of testJson.body.RoomInfos.RoomInfo) {
    roomInfo.RefId = duplicateRefId;
}
testJson.body.RoomInfos.RoomInfo[0].RefId = randomUUID();
*/

//post - with missing mandatory fields
//let testJson = saveSingleRoomInfoWithMissingMandatoryFields;

//save-multi-with-missing-mandatory fields
//let testJson = saveMultiRoomInfoWithMissingMandatoryFields;

//single-save-invalid values for extended elements source and status
//let testJson = saveSingleRoomInfoWithInvalidStatusAndSource;

//multi-save invalid values for extended elements source and status
/*
let testJson = saveMultiRoomInfoWithInvalidStatusAndSource;
for(const roomInfo of testJson.body.RoomInfos.RoomInfo) {
    roomInfo.RefId = randomUUID();
}
*/

testJson.body = JSON.stringify(testJson.body);
exports.handler = indexHandler.handler( testJson, {});
