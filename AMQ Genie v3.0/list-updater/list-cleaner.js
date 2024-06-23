const fs = require('fs');

// Leggi il file JSON
fs.readFile('list-updater/list.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Errore nella lettura del file:', err);
        return;
    }

    // Parse il contenuto del file JSON
    let jsonData = JSON.parse(data);

    // Rimuovi le proprietà specificate
    jsonData = jsonData.map(item => {
        const {
            annId, annSongId, animeJPName, animeAltName, animeVintage, animeType, 
            songType, songDifficulty, songCategory, HQ, MQ, artists, composers, arrangers,
            ...rest
        } = item;
        return rest;
    });

    // Scrivi il nuovo JSON in un file
    fs.writeFile('list-updater/list.json', JSON.stringify(jsonData, null, 4), 'utf8', err => {
        if (err) {
            console.error('Errore nella scrittura del file:', err);
            return;
        }
        console.log('File JSON processato e salvato con successo come output.json');
    });
});