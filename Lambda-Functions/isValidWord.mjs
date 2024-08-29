import AWS from 'aws-sdk';

AWS.config.update({ region: "us-east-1" });

let dbClient = new AWS.DynamoDB.DocumentClient();

export const handler = async(event) => {
  let word = event.queryStringParameters.word;
  let result;

  // query parameters
  let params = {
    TableName: 'wordleWords',
    IndexName: 'word-index',
    KeyConditionExpression: "word = :word",
    ExpressionAttributeValues: {
      ":word": word
    }
  }

  // querying the database for the provided word, then ensuring result's length is greater than zero
  try {
    result = await dbClient.query(params).promise();
    return (result.Items.length > 0);
  } catch (e) {
    console.log(e);
  }

  // response, including CORS headers, status code, and body
  const response = {
    statusCode: 200,
    // CORS
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(`result: ${result}`),
  }
  return response;
};

// parameter passed to Lambda function
let event = {
  "queryStringParameters": {
    "word": "tall"
  }
}

let response = await handler(event);
console.log(response);