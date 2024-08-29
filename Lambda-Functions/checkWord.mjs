import AWS from 'aws-sdk';

AWS.config.update({ region: "us-east-1" });

export const handler = async(event) => {
  let body;
  // ensures data format is JSON
  if (typeof event != String) {
    body = JSON.stringify(event);
  } 

  let guess = event.queryStringParameters.guess;
  let word = event.queryStringParameters.word;

  // guess states
  const CORRECT = 'correct';
  const CONTAINS = 'contains';

  // fills verdict array with incorrect by default
  let verdict = new Array(5).fill("incorrect");
  let count = [];

  // provides letter count for word
  // ensures "contains" check accurately tracks double letters
  for (let i = 0; i < 5; i++) {
    let letter = word[i];
    // if the letter exists in the word and its count tracked, increment it
    // otherwise start counting at one
    count[letter] ? count[letter]++ : count[letter] = 1
  }  

  for (let i = 0; i < 5; i++) {
    // if guess letter is in the same position, marked as correct
    // otherwise if the word includes the letter, (and is greater than zero) 
    // find the letter's index and decrement count
    if (guess[i] == word[i]) {
      verdict[i] = CORRECT; 
      count[word[i]]--;
    } else if (word.includes(guess[i])) {
      let index = word.indexOf(guess[i]);
      if (verdict[index] != CORRECT && index > 0) {
        verdict[i] = CONTAINS;
        count[word[index]]--;
      }
    }
  }
 
  // response, including CORS headers, status code, and body
  const response = {
    statusCode: 200,
    // CORS
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(verdict),
  }
  return response;
};

let event = {
  queryStringParameters: {
    "guess": "atoms",
    "word": "roman"
  }
}

let response = await handler(event);
console.log(response);