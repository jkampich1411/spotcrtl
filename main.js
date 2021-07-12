//Imports
const express = require("express")
const request = require("request")
const app = express()
const fs = require("fs")
const https = require("https");
const { post } = require("request");

//Idk for what I used that lol
const fillervariable = "literally nothing, i dont care either"
var apires = fillervariable;

//Config File Setup
const raspotifyName= cfg.raspname;
const webport= cfg.webport;
const redirect_uri = cfg.redirUri;

//Custom Log Command
function deblog(text, lvl) {
    if(lvl ===1) {
        console.log(`INFO: ${text}`);
    }
    else if (lvl ===2) {
        console.log(`WARN: ${text}`);
    }
    else if (lvl ===3) {
        console.log(`ERROR: ${text}`);
    }
    else if (lvl ===4) {
        console.log(`CRITICAL: ${text}`);
    }
}

//Test if Cfg is setup
deblog(raspotifyName, 1);
deblog(webport, 1);

app.get('/spotify/', (req,res) => {
    res.send('Test! Works!')
});

//Authenticate with Spotify
app.get('/spotify/auth', (req,res)=> {
    var scopes = cfg.scope;
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + cfg.clientID +
            (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

//Spotify Callback Work in Progress
app.get('/spotify/callback', (req,res)=> {

    var clencr= Buffer.from(`${cfg.clientID}:${cfg.secret}`).toString('base64');

    let exchangeValue = `grant_type=authorization_code&code=${req.query.code}&redirect_uri=${redirect_uri}`

    function exchangeToken(postData) {
        const opt = {
            uri: 'https://accounts.spotify.com/api/token',
            body: postData,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + clencr
            }
        }
        request(opt, (error, respons) => {
            apires = respons;

            deblog(`${error} ${respons.body}`, 1);
            return;
        });
    }
    exchangeToken(exchangeValue)

    deblog(apires)
    res.send("llel")
})


//Start Expressjs
app.listen(webport, () => {
    deblog(`Listening on http://127.0.0.1:${webport}/spotify/`,1)
});