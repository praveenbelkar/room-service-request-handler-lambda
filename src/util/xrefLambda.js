const { InvokeCommand, LambdaClient } = require("@aws-sdk/client-lambda");
const logger = require('api-node-modules').logger;
const REGION = process.env.REGION || "ap-southeast-2";

const lambdaClient = new LambdaClient({
  region: REGION
});


const findSchoolRef = async (schoolCode) => {
    //return 'thenga';
    //return 'E3E34B35-9D75-101A-8C3D-00AA001A1652';
    return 'e3e34b35-9d75-101a-8c3d-00aa001a1652';
    //return null;
    //return '';
  logger.debug("Finding schoolRef by schoolCode: %s", schoolCode);

  const findSchoolCommand = new InvokeCommand({
    FunctionName: "xref-service-lambda",
    Payload: Buffer.from(
      JSON.stringify({
        pathParameters: {
          schoolCode,
        },
      }),
    ),
  });

  try {
    const findSchoolResult = await lambdaClient.send(findSchoolCommand);
    logger.debug("Got response from xref-service-lambda: %s", findSchoolResult);

    const resultBody = JSON.parse(
      JSON.parse(new TextDecoder().decode(findSchoolResult.Payload)).body,
    );

    if (!resultBody?.attributes?.refId) {
      throw "Couldn't find schoolRef for: " + schoolCode;
    }

    return resultBody.attributes.refId;
  } catch (e) {
    logger.error("Failed to get schoolRef for: %s", schoolCode, e);
    throw e;
  }
}


module.exports = {
    findSchoolRef
};
