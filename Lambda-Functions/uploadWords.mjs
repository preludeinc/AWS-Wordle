import * as fs from "fs";
import AWS from 'aws-sdk';

AWS.config.update({ region: "us-east-1" });

let wordLength = 5;
let fiveLetterWords = new Map();
let dbClient = new AWS.DynamoDB.DocumentClient();

// imports the word list text-file, used to generate word-list, and removes formatting
function readWordList() {
  let buffer = fs.readFileSync('wordlist.txt', 'utf-8');
  return buffer.split(/\r?\n/);
}

// parses five letter words
function main() {
  let words = readWordList();
  let index = 0;

  // generates list of five letter words
  for (let word in words) 
    if (words[word].length == wordLength) {
      // map with index set to key 'n', and words set as value 'w'
      index = index += 1;
      fiveLetterWords.set(Number(index), words[word]);
    }

    // adding words to database instance by applying put to DocumentClient
    fiveLetterWords.forEach(async (w, n) => {
      console.log(`wordNumber: ${n}, word: ${w}`);
      try {
        await dbClient.put({
          TableName: 'wordleWords',
          Item: {
            wordNumber: n,
            word: w
            }
          }).promise();
        }
        catch (e) {
          console.log(e.message);
        }
      });
    };

main();