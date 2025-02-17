chrome.tabs.query({ active: true }, function (tabs) {
    var tab = tabs[0];
    chrome.scripting.executeScript(
        {
            target: {
                tabId: tab.id,
            },

            func: () => {
                if (document.getElementById("qpMoePlayer-0").classList.contains("vjs-paused")) { // Cerca e seleziona quale dei due video player sia attivo
                    id = "qpMoePlayer-1_html5_api";
                } else {
                    id = "qpMoePlayer-0_html5_api";
                }

                var url = document.getElementById(id).src; // Cerca l'elemento contrassegnato dall'id univoco e ottiene il campo src (link del video)
                
                chrome.runtime.sendMessage({action: "check-code", url: url}, function(response) { // Invia un messaggio di tipo "check-code" con l'url al listener in background.js
                    if (response.action === "guess") {  // Se l'azione è guess
                        if (response.anime == "Error!! Forbidden (403)" || response.hash == "1958199988") {
                            window.open("https://cors-anywhere.herokuapp.com/corsdemo", "_blank");
                            return;
                        }
    
                        inputField = document.querySelectorAll("#qpAnswerInput");
                        if (inputField.length > 1) {
                            inputField[1].value = response.song; // Ottiene la risposta
                            inputField[2].value = response.artist; // Ottiene la risposta
                            
                        }
                        inputField[0].value = response.anime; // Ottiene la risposta da background.js e la imposta come valore del campo input
                    }

                    if (response.action === "learn") {  // Se l'azione è learn
                        waitForInfo(response.hash);     // Richiama la funzione che aspetta finché non viene rivelato l'anime
                    }
                });

                async function waitForInfo(hash) {
                    while (!document.getElementById("qpAnimeNameHider").classList.contains("hide")) {   // Controlla che l'elemento qpAnimeNameHider sia visibile
                        await new Promise(r => setTimeout(r, 1000));    // In caso aspetta un secondo prima di ricontrollare
                    }
                    
                    anime = document.getElementById("qpAnimeName").innerText;       // Cattura i dati della canzone
                    song = document.getElementById("qpSongName").innerText;
                    artist = document.getElementById("qpSongArtist").innerText;
                
                    fetch("http://localhost:3000/record", {     // Invia i dati al server avviato localmente per registrare la canzone
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({hash: hash, anime: anime, song: song, artist: artist})
                    });
                }
            }
        }
    );
});

