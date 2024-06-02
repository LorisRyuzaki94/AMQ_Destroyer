// ==UserScript==
// @name         AMQ Song/Artist with DB
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  A song artist mode with autocomplete on database
// @author       Ryuzaki94
// @match        https://animemusicquiz.com/*
// @grant        none
// @icon         
// @downloadURL  
// @updateURL    
// @require      https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/simpleLogger.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @copyright    MIT license
// ==/UserScript==

// Variables
let enableBinary = true,
    scoreboardReady = false,
    playerDataReady = false,
    returningToLobby = false,
    playerData = {},
    playerAmount = 0,
    titles,
    artists,
    titlesInit = false,
    artistsInit = false,
    titleValue,
    artistValue;

/* Limits how many songs can be rendered when you type a keyword. Larger number means more lag and requires more computing power. */
let dropdownListLimit = 50

// listeners
let quizReadyRigTracker,
    answerResultsRigTracker,
    joinLobbyListener,
    spectateLobbyListener,
    quizEndTracker;

if (document.getElementById('startPage')) return;

// Wait until the LOADING... screen is hidden and load script
let loadInterval = setInterval(() => {
    if (document.getElementById("loadingScreen").classList.contains("hidden")) {
        setup();
        clearInterval(loadInterval);
    }
}, 500);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// This is a proxy so I can do a cross-origin API request to my site
let cors_api_url = 'https://amq-proxy.herokuapp.com/';
async function doCORSRequest(options) {
    if (enableBinary === false) {
        return;
    }

    let x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + options.url);
    x.onload = x.onerror = function () {

        if (options.type === 'titles') {
            titles = x.responseText
            titles = JSON.parse(titles)
            titles = titles.body
            titlesInit = true
        }

        if (options.type === 'artists') {
            artists = x.responseText
            artists = JSON.parse(artists)
            artists = artists.body
            artistInit = true
        }
    };
    x.send(options.data);
}

// Writes the current rig to scoreboard
function writeRigToScoreboard() {
    if (enableBinary === false) {
        return;
    }
    if (playerDataReady) {
        for (let entryId in quiz.scoreboard.playerEntries) {
            let entry = quiz.scoreboard.playerEntries[entryId];
            let guessedCounter = entry.$entry.find(".qpsPlayerRig");
            guessedCounter.text(playerData[entryId].score);
            quiz.scoreboard.playerEntries[entryId].$score[0].textContent = playerData[entryId].rig
        }
    }
}

// Clears the rig counters from scoreboard
function clearScoreboard() {
    if (enableBinary === false) {
        return;
    }
    $(".qpsPlayerRig").remove();
    scoreboardReady = false;
}

// Clears player data
function clearPlayerData() {
    if (enableBinary === false) {
        return;
    }
    playerData = {};
    playerDataReady = false;
    missedFromOwnList = 0;
}

// Creates the player data for counting rig (and score)
function initialisePlayerData() {
    if (enableBinary === false) {
        return;
    }
    clearPlayerData();
    for (let entryId in quiz.players) {
        playerData[entryId] = {
            rig: 0,
            score: 0,
            missedList: 0,
            name: quiz.players[entryId]._name
        };
    }
    playerDataReady = true;
}

// Creates the rig counters on the scoreboard and sets them to 0
function initialiseScoreboard() {
    if (enableBinary === false) {
        return;
    }
    clearScoreboard();
    for (let entryId in quiz.scoreboard.playerEntries) {
        let tmp = quiz.scoreboard.playerEntries[entryId];
        let rig = $(`<span class="qpsPlayerRig">0</span>`);
        tmp.$entry.find(".qpsPlayerName").before(rig);
    }
    scoreboardReady = true;
}

//Alt+H to change Scoring Mode
async function changeMode(e) {
    if (e.altKey && e.key == 'h') {
        enableBinary = !enableBinary;

        gameChat.systemMessage(enableBinary ? "Song/Artist plugin has been ENABLED" : "Song/Artist plugin has been DISABLED");
        if (enableBinary === false) {
            let songArtistDOMElement = document.querySelector('#songartist');
            songArtistDOMElement.style.display = 'none';
            let playerScore = document.querySelector('.qpsPlayerRig')
            playerScore.style.display = 'none';
        }
        if (enableBinary === true) {
            let songArtistDOMElement = document.querySelector('#songartist');
            songArtistDOMElement.style.display = 'block';
            let playerScore = document.querySelector('.qpsPlayerRig');
            console.log(playerScore);
            playerScore.style.display = 'block';
        }
    }
}

// Initial setup on quiz start
quizReadyRigTracker = new Listener("quiz ready", async (data) => {
    gameChat.systemMessage('Current Scoring Mode: 1')
    gameChat.systemMessage('Press [Alt+G] to change it or [Alt+H] to hide it')
    document.addEventListener('keydown', changeMode)
    if (enableBinary === false) {
        return;
    }
    //Fetches title and artist list from an API
    //
    // Database TO DO
    //
    
    playerAmount = Object.entries(quiz.players).length
    returningToLobby = false;
    clearPlayerData();
    clearScoreboard();
    answerResultsRigTracker.bindListener();
    initialiseScoreboard();
    initialisePlayerData();

    await sleep(2000)
})

// Reset data when joining a lobby
joinLobbyListener = new Listener("Join Game", async (payload) => {
    if (enableBinary === false) {
        return;
    }
    titlesInit = false
    artistInit = false
    if (titlesInit === false && artistsInit === false) {
        titles = ''
        artists = ''
    //
    // Database TO DO
    //
    }
    
    if (payload.error) {
        return;
    }
    if (payload.inLobby) {
        answerResultsRigTracker.unbindListener();
        clearPlayerData();
        clearScoreboard();
    }
})

// Stuff to do on answer reveal
answerResultsRigTracker = new Listener("answer results", async (result) => {
    if (enableBinary === false) {
        return;
    }
    for (let player of result.players) {
        if (player.correct === true) {
            playerData[player.gamePlayerId].score++;
        }
    }
    await sleep(100)
    writeRigToScoreboard()
})

// Reset data when spectating a lobby
spectateLobbyListener = new Listener("Spectate Game", (payload) => {
    if (enableBinary === false) {
        return;
    }
    if (payload.error) {
        return;
    }
    answerResultsRigTracker.bindListener();
    clearPlayerData();
    clearScoreboard();
})

//Remove Alt+G listener on the end of the game
quizEndTracker = new Listener("quiz end result", (result) => {
    if (enableBinary === false) {
        return;
    }
    document.removeEventListener('keydown', changeMode)
    writeRigToScoreboard()
})

quizReadyRigTracker.bindListener();
answerResultsRigTracker.bindListener();
joinLobbyListener.bindListener();
spectateLobbyListener.bindListener();
quizEndTracker.bindListener();