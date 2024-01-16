const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

// Middleware per consentire richieste da qualsiasi dominio (CORS)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.post("/record", (req, res) => {
    var data = fs.readFileSync('database.json');
    var myObj = JSON.parse(data);
    myObj[req.body.hash] = {anime: req.body.anime, song: req.body.song, artist: req.body.artist};

    var newData = JSON.stringify(myObj);
    fs.writeFile('database.json', newData, err => {
        if(err) throw err;
        console.log("added " + req.body.hash + " - " + req.body.anime + " - " + req.body.song);
    });   
});

app.listen(port, () => {
    console.log(`Il server è in ascolto sulla porta ${port}`);
});