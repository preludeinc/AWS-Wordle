import AWS from 'aws-sdk';

AWS.config.update({ region: "us-east-1" });

let db = new AWS.DynamoDB();
let dbClient = new AWS.DynamoDB.DocumentClient();

export const handler = async(event) => {

  // wordNumber query string, converted to Integer
  let wordNumber = event.queryStringParameters.wordNumber;
  let intNum = parseInt(wordNumber);
  let result;

  // query parameters
  let params = {
    TableName: 'wordleWords',
    KeyConditionExpression: "wordNumber = :wordNumber", 
    ExpressionAttributeValues: {
      ":wordNumber": intNum,
    }
  }

  // querying the database to return a random number at the chosen index
  try {
    result = await dbClient.query(params).promise();
    result = result.Items[0].word;
  } catch (e) {
    console.log(e);
  }

  // response, including CORS headers, status code, and body
  const response = {
    statusCode: 200,
    // CORS
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(result),
  }
  return response;
};

// counts number of words in wordleWords DB 
async function countWords() {
  let result = await db.scan(
    {
      TableName: 'wordleWords',
      Select: 'COUNT'
    }
  ).promise();

  return result.Count;
}

let count = await countWords();

// returns a random number between 0 and count
let randomIndex = Math.floor(Math.random() * count);

let event = {
  "queryStringParameters": {
  "wordNumber": randomIndex,
  }
}

let response = await handler(event);
console.log(response);
