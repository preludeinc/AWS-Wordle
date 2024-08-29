import "./stylesheets/App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import GameOverPopup from "./GameOverPopup";

import { withAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from "@aws-amplify/auth";
import { defaultStorage } from "aws-amplify/utils";
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

const authConfig = {
  Cognito: {
    userPoolId: 'us-east-1_R6cfjqJM0',
    userPoolClientId: '7eajb338fbsihbnu6tpsobqgir'
  }
};

cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);

Amplify.configure(
  {
    Auth: authConfig
  },
  { Auth: {
    tokenProvider: cognitoUserPoolsTokenProvider
  }}
);

function App({signOut}) {
  // Popup State item
  const [gameOverPopup, setGameOverPopup] = useState(true);
  const [result, setResult] = useState("Fail");
  const [dailyWord, setDailyWord] = useState();
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [history, setHistory] = useState([{"guesses":[], "playDate":0,"word":"","player":""}]);

  // Set State variables for Current Guesses.
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentGuessNum, setCurrentGuessNum] = useState(1);
  const [firstGuess, setFirstGuess] = useState("");
  const [secondGuess, setSecondGuess] = useState("");
  const [thirdGuess, setThirdGuess] = useState("");
  const [fourthGuess, setFourthGuess] = useState("");
  const [fifthGuess, setFifthGuess] = useState("");
  const [sixthGuess, setSixthGuess] = useState("");
  const [correctGuess, setCorrectGuess] = useState(false);

  const defaultGuessArray = [
    "neutral",
    "neutral",
    "neutral",
    "neutral",
    "neutral",
  ];
  // Set the current arrays for guesses css classes
  const [firstGuessArray, setFirstGuessArray] = useState(defaultGuessArray);
  const [secondGuessArray, setSecondGuessArray] = useState(defaultGuessArray);
  const [thirdGuessArray, setThirdGuessArray] = useState(defaultGuessArray);
  const [fourthGuessArray, setFourthGuessArray] = useState(defaultGuessArray);
  const [fifthGuessArray, setFifthGuessArray] = useState(defaultGuessArray);
  const [sixthGuessArray, setSixthGuessArray] = useState(defaultGuessArray);

  // returns authorization information to be used with webpack integrations
  const authSession = async() => {
    // authorization information
    let session = await fetchAuthSession();
    let idToken = session.tokens.idToken;
    // jwt
    return idToken.toString();
  }

  // When you hit enter iterate the current guess
  const handleKeyDown = async (event) => {
    // Check if enter has been hit and the message is exactly 5 characters long
    if (
      event.key === "Enter" &&
      currentGuess.length === 5 &&
      (await checkValid(currentGuess))
    ) {
      // Set the guess state to register correct, incorrect, and contains for CSS styling. Iterate over every set
      if (currentGuessNum === 1 && !correctGuess) {
        setFirstGuessArray(await checkGuess(firstGuess));
      } else if (currentGuessNum === 2 && !correctGuess) {
        setSecondGuessArray(await checkGuess(secondGuess));
      } else if (currentGuessNum === 3 && !correctGuess) {
        setThirdGuessArray(await checkGuess(thirdGuess));
      } else if (currentGuessNum === 4 && !correctGuess) {
        setFourthGuessArray(await checkGuess(fourthGuess));
      } else if (currentGuessNum === 5 && !correctGuess) {
        setFifthGuessArray(await checkGuess(fifthGuess));
      } else if (currentGuessNum === 6 && !correctGuess) {
        setSixthGuessArray(await checkGuess(sixthGuess));
      }
      // Increment guess count and reset the input
      setCurrentGuessNum(parseInt(currentGuessNum) + 1);
      setCurrentGuess("");
    }
  };

  // Check if the word is in the database
  async function checkValid(guess) {

    // -------------------------------------------------------------------------------------
    // isValidWord is called here, true is returned if word is valid and false otherwise. 
    // -------------------------------------------------------------------------------------

    try {
      let url = `https://fswn2h1gwg.execute-api.us-east-1.amazonaws.com/prod/isvalidword?word=${guess}`;
      let jwt = await authSession();
      // fetch request to (GET) isValidWord
      let validWord = await fetch(url, {
        // authorization headers
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      return await validWord.json();
    } catch (error) {
      console.log(error);
    }
  }

  // Check if the word is the daily word
  async function checkGuess(guess) {
    // check if word is valid
    let checkWord = await checkValid(guess);
    // -------------------------------------------------------------------------------------
    // checkWord is called, passing in the daily word, together with the guess.
    // -------------------------------------------------------------------------------------

    let results = [];

    let fetchResults = async() => {
      if (checkWord) {
        let url = `https://fswn2h1gwg.execute-api.us-east-1.amazonaws.com/prod/checkword?guess=${currentGuess}&word=${dailyWord}`;
        let jwt = await authSession();
        // fetch request to checkWord
        results = await fetch(url, {
          // authorization headers
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        });
        return await results.json();
        }
      }

    let response = await fetchResults();
    let responseData = [];
    responseData = Array.from(response);

    // Check if there were 5 correct letters to see if the puzzle is solved
    let correctCount = 0;
    responseData.forEach((e) => {
      if (e === "correct") {
        correctCount++;
      }
    });
    if (correctCount === 5) {
      // If the guess is correct set every check to true.
      setResult("Solved");
      setCorrectGuess(true);
      setGameOverPopup(true);
      // Set Failure
    } else if (currentGuessNum === 6 && correctCount < 5) {
      setResult("Failed. Correct Word = " + dailyWord);
      setGameOverPopup(true);
    }
    return responseData;
  }

  // Get the daily word from API backend.
  const getDailyWord = async () => {

    // -------------------------------------------------------------------------------------
    // nextWord is called here. When the next word is obtained, setDailyWord is called to
    // initialize the application.
    // -------------------------------------------------------------------------------------

    try {
       // returns a random number between 0 and count
      let wordleWords = 3088;
      let randomIndex = Math.floor(Math.random() * wordleWords);
      let jwt = await authSession();
      // fetch GET request to /nextword
      let url =`https://fswn2h1gwg.execute-api.us-east-1.amazonaws.com/prod/nextword?wordNumber=${randomIndex}`;
      let nextWord = await fetch(url, {
        // authorization headers
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      let word = await nextWord.json();
      // sets the next word
      setDailyWord(word);
    } catch (err) {
      console.log(err);
    }
  };


  // Handle save game button press (To be wired up)
  const handleSave = async() => {
    let data = {
      player: currentPlayer,
      playDate: Date.now(), 
      word: dailyWord,
      guesses: [
        firstGuess,
        secondGuess,
        thirdGuess,
        fourthGuess,
        fifthGuess,
        sixthGuess,
      ],
    };

    // -------------------------------------------------------------------------------------
    // saveGamePlay is called here, passing in the JSON object for the game.
    // -------------------------------------------------------------------------------------

    let url = `https://fswn2h1gwg.execute-api.us-east-1.amazonaws.com/prod/savegameplay`;
    let jwt = await authSession();
    // fetch POST to saveGamePlay/
    fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      // authorization header
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-type": "application/json"
      }
    });
    handleReset();
    setGameOverPopup(false);
  };

  // Handle reset game button press
  const handleReset = () => {
    // Reset Guess Count
    setCurrentGuessNum(1);
    setCorrectGuess(false);
    // Reset Guesses
    setFirstGuess("");
    setSecondGuess("");
    setThirdGuess("");
    setFourthGuess("");
    setFifthGuess("");
    setSixthGuess("");
    // Reset CSS Arrays
    setFirstGuessArray(defaultGuessArray);
    setSecondGuessArray(defaultGuessArray);
    setThirdGuessArray(defaultGuessArray);
    setFourthGuessArray(defaultGuessArray);
    setFifthGuessArray(defaultGuessArray);
    setSixthGuessArray(defaultGuessArray);
    // hide popup
    setGameOverPopup(false);
  };

  // Handles log out game button press
  const handleLogout = () => {
    signOut();
  }

  // Populate the guess form
  const handleChange = (e) => {
    if (currentGuessNum === 1 && !correctGuess) {
      setFirstGuess(e.target.value);
    } else if (currentGuessNum === 2 && !correctGuess) {
      setSecondGuess(e.target.value);
    } else if (currentGuessNum === 3 && !correctGuess) {
      setThirdGuess(e.target.value);
    } else if (currentGuessNum === 4 && !correctGuess) {
      setFourthGuess(e.target.value);
    } else if (currentGuessNum === 5 && !correctGuess) {
      setFifthGuess(e.target.value);
    } else if (currentGuessNum === 6 && !correctGuess) {
      setSixthGuess(e.target.value);
    }
    setCurrentGuess(e.target.value);
  };

  const handlePlayer = (e) => {
    setCurrentPlayer(e.target.value);
  };

  async function searchHistory() {

    // -------------------------------------------------------------------------------------
    // getGameHistory is called here to retrieve the games played by the current user. 
    // setHistory is called to update the app's UI  
    // -------------------------------------------------------------------------------------

    let url = `https://fswn2h1gwg.execute-api.us-east-1.amazonaws.com/prod/getgamehistory?player=${currentPlayer}`;
    let jwt = await authSession();
    let history = [];
    // fetch request to (GET) getGameHistory
    history = await fetch(url, {
      // authorization headers
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
    history = await history.json();
    setHistory(history);
  }

  useEffect(() => {
    getDailyWord();
  }, []);

  return (
    <div className="App">
      {dailyWord}
      <div className="play-area">
        <div id="play-cell" className={firstGuessArray[0]}>
          {firstGuess[0]}
        </div>
        <div id="play-cell" className={firstGuessArray[1]}>
          {firstGuess[1]}
        </div>
        <div id="play-cell" className={firstGuessArray[2]}>
          {firstGuess[2]}
        </div>
        <div id="play-cell" className={firstGuessArray[3]}>
          {firstGuess[3]}
        </div>
        <div id="play-cell" className={firstGuessArray[4]}>
          {firstGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={secondGuessArray[0]}>
          {secondGuess[0]}
        </div>
        <div id="play-cell" className={secondGuessArray[1]}>
          {secondGuess[1]}
        </div>
        <div id="play-cell" className={secondGuessArray[2]}>
          {secondGuess[2]}
        </div>
        <div id="play-cell" className={secondGuessArray[3]}>
          {secondGuess[3]}
        </div>
        <div id="play-cell" className={secondGuessArray[4]}>
          {secondGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={thirdGuessArray[0]}>
          {thirdGuess[0]}
        </div>
        <div id="play-cell" className={thirdGuessArray[1]}>
          {thirdGuess[1]}
        </div>
        <div id="play-cell" className={thirdGuessArray[2]}>
          {thirdGuess[2]}
        </div>
        <div id="play-cell" className={thirdGuessArray[3]}>
          {thirdGuess[3]}
        </div>
        <div id="play-cell" className={thirdGuessArray[4]}>
          {thirdGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={fourthGuessArray[0]}>
          {fourthGuess[0]}
        </div>
        <div id="play-cell" className={fourthGuessArray[1]}>
          {fourthGuess[1]}
        </div>
        <div id="play-cell" className={fourthGuessArray[2]}>
          {fourthGuess[2]}
        </div>
        <div id="play-cell" className={fourthGuessArray[3]}>
          {fourthGuess[3]}
        </div>
        <div id="play-cell" className={fourthGuessArray[4]}>
          {fourthGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={fifthGuessArray[0]}>
          {fifthGuess[0]}
        </div>
        <div id="play-cell" className={fifthGuessArray[1]}>
          {fifthGuess[1]}
        </div>
        <div id="play-cell" className={fifthGuessArray[2]}>
          {fifthGuess[2]}
        </div>
        <div id="play-cell" className={fifthGuessArray[3]}>
          {fifthGuess[3]}
        </div>
        <div id="play-cell" className={fifthGuessArray[4]}>
          {fifthGuess[4]}
        </div>
      </div>
      <div className="play-area">
        <div id="play-cell" className={sixthGuessArray[0]}>
          {sixthGuess[0]}
        </div>
        <div id="play-cell" className={sixthGuessArray[1]}>
          {sixthGuess[1]}
        </div>
        <div id="play-cell" className={sixthGuessArray[2]}>
          {sixthGuess[2]}
        </div>
        <div id="play-cell" className={sixthGuessArray[3]}>
          {sixthGuess[3]}
        </div>
        <div id="play-cell" className={sixthGuessArray[4]}>
          {sixthGuess[4]}
        </div>
      </div>
      <div>
        <input
          type="text"
          maxLength="5"
          value={currentGuess}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {gameOverPopup && (
        <GameOverPopup
          gameOverPopup={gameOverPopup}
          currentGuessNum={currentGuessNum}
          result={result}
          handleSave={handleSave}
          handleReset={handleReset}
          handleLogout={handleLogout}
          currentPlayer={currentPlayer}
          handlePlayer={handlePlayer}
          history={history}
          searchHistory={searchHistory}
        />
      )}
    </div>
  );
}

export default withAuthenticator(App);
