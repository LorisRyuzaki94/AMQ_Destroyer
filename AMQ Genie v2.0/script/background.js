chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) { // Listener che ascolta il messaggio inviato da content.js

    if (message.action === "check-code") { // Se il messaggio è di tipo "check-code"
        fetch(new Request("database/database.json")) // Legge il file database.json
            .then((response) => response.json())
            .then((database) => {
                anime = database[message.code]; // Cerca nel database una corrispondenza per il codice ricevuto
                if (anime === undefined) { // Se non lo trova restituisce il codice
                    anime = message.code;
                }

                anime = convertUnicode(anime)
                
                sendResponse({name: anime}); // Invia la risposta al file content.js
            }
        );
    }
    return true; // Questo serve altrimenti non funziona bene
});

function convertUnicode(anime) {
    return anime.replace("\u00d7", "×")
} 