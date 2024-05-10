// ==UserScript==
// @name         AMQ Song/Artist with DB
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  A song artist mode with a database
// @author       Ryuzaki94
// @match        https://animemusicquiz.com/*
// @icon         
// @downloadURL  
// @updateURL    
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @grant        none
// ==/UserScript==

// Variables


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