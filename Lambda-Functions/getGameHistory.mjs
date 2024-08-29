import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1'});

let dbClient = new AWS.DynamoDB.DocumentClient();

export const handler = async(event) => {
  let games = [];

  // accepts the playerName as a query string, converts to lowercase
  let playerName = event.queryStringParameters.player;

  // sets the dynamo DB table, and the given parameter as the player name
  let params = {
    ExpressionAttributeValues: {
      ':p': playerName
    },
    KeyConditionExpression: 'player = :p',
    TableName: 'gamePlay' 
  }

  try {
    // queries the table, and returns the games array
    games = await dbClient.query(params).promise();

  } catch (e) {
    data = e;
  }

  // returns the response headers, and game items
  const response = {
    statusCode: 200,
    // CORS
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(games.Items),
  }
  return response;
}

let event = {
  "queryStringParameters": {
    "player": "ada"
  }
}
let response = await handler(event);
console.log(response);
