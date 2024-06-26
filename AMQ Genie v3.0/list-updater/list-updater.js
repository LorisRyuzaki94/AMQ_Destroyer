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
        fs.writeFile(filename, JSON.stringify(data, null, 4), 'utf8', (err) => {
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
    .then(blob => blobToData(blob))
    .then(data => data.hashCode());
}

// Funzione principale per leggere i file JSON, calcolare gli hash e scrivere i nuovi dati
async function main() {
    try {
        const songsData = await readJSONFile('list-updater/list.json');

        for (const song of songsData) {
            // Se l'audio non è presente nel JSON lo segnala e skippa la entry
            if (song.audio === null) {
                console.error(`No audio property: ${song.animeENName}, ${song.songName}`); 
                continue
            };

            const uniqueID = await getHash(song.audio);
            
            // Rileggi database.json ad ogni iterazione
            let targetData = await readJSONFile('database.json');
            
            // Controlla se l'entry esiste già
            if (!targetData.hasOwnProperty(uniqueID)) {
                targetData[uniqueID] = {
                    "anime": song.animeENName,
                    "song": song.songName,
                    "artist": song.songArtist
                };

                await writeJSONFile('database.json', targetData);
                console.log(`Aggiunto: ${targetData[uniqueID]["song"]}`);
            } else {
                console.log(`Esiste già: ${targetData[uniqueID]["song"]}`);
            }
        }

        console.log('I dati sono stati aggiunti con successo al database');
    } catch (err) {
        console.error('Errore:', err);
    }
}

// Esegui la funzione principale
main();