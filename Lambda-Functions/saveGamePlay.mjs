import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1'});

let dbClient = new AWS.DynamoDB.DocumentClient();

export const handler = async(event) => {
  // parses data if in JSON format
  let body = JSON.parse(event.body);

  // sets the dynamo DB table, and passes in the event.body
  let params = {
    TableName: "gamePlay",
    Item: body
  }

  try {
    // adds data to table
    data = await dbClient.put(params).promise();

  } catch (e) {
    data = e;
  }

  const response = {
    statusCode: 200,
    // CORS
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify("result: ok")
  }
  return response;
}

let event = {
  body: JSON.stringify({
      player: "ada",
      playDate: Date.now(),
      word: "grand",
      guesses: ["word1", "word2", "word3", "word4", "word5"]
  })
};

let response = await handler(event);
console.log(response.body);
