const fs = require('fs');
const fetch = require('node-fetch');

// Funzione per leggere un file JSON
function readJSONFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (err) {
                reject(err);
            }
        });
    });
}

// Funzione per scrivere un file JSON
function writeJSONFile(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

// Funzione per convertire un blob in una stringa di dati
const blobToData = async (blob) => {
    const buffer = await blob.arrayBuffer();
    const view = new Int8Array(buffer);
    return [...view].map((n) => n.toString()).join("");
};

// Aggiungi la funzione hashCode al prototipo di String
String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// Funzione per ottenere l'hash di un URL
async function getHash(url) {
    return fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
        headers: {
            'x-requested-with': 'XMLHttpRequest'  // Sostituisci con il tuo valore di origine
        }
    })
    .then(res => res.blob()) // Ottieni la risposta e restituiscila come blob
    .then(blob => {console.log(blob); return blobToData(blob)})
    .then(data => data.hashCode());
}

// Funzione principale per leggere i file JSON, calcolare gli hash e scrivere i nuovi dati
async function main() {
    try {
        const songsData = await readJSONFile('list-updater/list.json');
        const targetData = await readJSONFile('database.json');

        const promises = songsData.map(async (song) => {
            const uniqueID = await getHash(song.audio);
            targetData[uniqueID] = {
                "anime": song.animeENName,
                "song": song.songName,
                "artist": song.songArtist
            };
        });

        // Aspetta che tutte le promesse siano risolte
        await Promise.all(promises);

        await writeJSONFile('database.json', targetData);
        console.log('I dati sono stati aggiunti con successo al target.json');
    } catch (err) {
        console.error('Errore:', err);
    }
}

// Esegui la funzione principale
main();