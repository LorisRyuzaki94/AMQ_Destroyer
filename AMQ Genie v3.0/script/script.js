
//  'https://cors-anywhere.herokuapp.com/https://nl.catbox.moe/internals/dist.php?enc=5095648dcb868760325ad1d04064e7c8:a68725f6690aa85e829ad58295c56f0d' -836262238

//  'https://cors-anywhere.herokuapp.com/https://ladist1.catbox.video/5d95gf.mp3' -836262238


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
    return fetch('https://cors-anywhere.herokuapp.com/${url}'.replace("${url}", url))
    .then(res => res.blob()) // Gets the response and returns it as a blob
    .then(blob => blobToData(blob))
    .then(blob => blob.hashCode());
}

document.getElementById("button").addEventListener("click", function () {   
    getHash(document.getElementById("text").value).then((hash) => {
        fetch("http://localhost:3000/record", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({hash: hash, anime: "palle", song: "culo", "artist": "Giovanni"})
        })
        .then(response => response.json())  // Estrai il corpo della risposta come JSON
        .then(data => {
            console.log('Risposta dal server:', data);  // Stampa i dati ricevuti dal server sulla console
        })
        .catch(error => {
            console.error('Errore durante la richiesta:', error);  // Gestisci eventuali errori durante la richiesta
        });
    });
});