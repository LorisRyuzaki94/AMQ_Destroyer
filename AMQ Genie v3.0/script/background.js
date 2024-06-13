chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) { // Listener che ascolta il messaggio inviato da content.js

    if (message.action === "check-code") { // Se il messaggio è di tipo "check-code"
        getHash(message.url)    // Calcola l'hash dell'url
        .then(hash => {         
            fetch(new Request("database.json"))     // Recupera i dati dal file database.json
            .then(data => data.json())
            .then(data => {
                if (data[hash] === undefined) {     // Cerca l'hash nel database e se non trova un riscontro
                    sendResponse({action: "learn", hash: hash});    // Manda una risposta per fare imparare 
                } else {
                    sendResponse(
                        {
                            action: "guess", 
                            hash: hash, 
                            anime: data[hash]["anime"], 
                            song: data[hash]["song"], 
                            artist: data[hash]["artist"]
                        }
                    );    // Risposta per guessare
                }
            });
        });
    }

    return true;
});

const blobToData = async (blob) => {
    const buffer = await blob.arrayBuffer();

    const view = new Int8Array(buffer);

    return [...view].map((n) => n.toString()).join("");
};

String.prototype.hashCode = function () {
    var hash = 0, i, chr;

    if (this.length === 0) return hash;

    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
}

async function getHash(url) {
    return fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
        headers: {
            'x-requested-with': 'XMLHttpRequest'  // Sostituisci con il tuo valore di origine
        }
    })
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => blobToData(blob))
    .then(blob => blob.hashCode());
}