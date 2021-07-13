//Imports
const express = require("express")
const request = require("request")
const app = express()
const fs = require("fs")
const https = require("https");
const { post } = require("request");

//Config File Setup
const cfg = JSON.parse(fs.readFileSync('./cfg.json', 'utf8'))
const raspotifyName= cfg.raspname;
const webport= cfg.webport;
const redirect_uri = cfg.redirUri;

//Spotify Auth Token
var spotifycfg = JSON.parse(fs.readFileSync('./spotifyauth.json', 'utf8'))
const ACCESS_TOKEN = spotifycfg.access_token;
const REFRESH_TOKEN = spotifycfg.refresh_token;
const EXPIRES_IN = spotifycfg.expires_in;

//Custom Log Command
function deblog(text, lvl) {
    if(!(lvl)) lvl===1;
    if(lvl ===1) {
        console.log(`INFO: ${text}`);
    }
    else if(lvl ===2) {
        console.log(`WARN: ${text}`);
    }
    else if(lvl ===3) {
        console.log(`ERROR: ${text}`);
    }
    else if(lvl ===4) {
        console.log(`CRITICAL: ${text}`);
    }
}

//request Devices to get deviceId
function requestDevices(tok) {
    let opt = {
        uri: 'https://api.spotify.com/v1/me/player/devices',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + tok
        }
    }
    request(opt, (error, respons) => {
        deblog(`${error} ${respons.body}`, 1);
        let objParse = JSON.parse(respons.body)        
        let i = 0;
        if (objParse.devices.length === 0) deblog("No Devices Found!", 1)
        else {
            while(i < objParse.devices.length) {
                if (objParse.devices[i].name === cfg.raspname) {
                    deblog("I am going to do something here!", 1);
                    break;
                } else i++;
            }
        }
        return;
    })
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

//Spotify Callback that requests (and handles => WorkInProgress) Device IDs
app.get('/spotify/callback', (req,res)=> {

    let clencr= Buffer.from(`${cfg.clientID}:${cfg.secret}`).toString('base64');
    let exchangeValue = `grant_type=authorization_code&code=${req.query.code}&redirect_uri=${redirect_uri}`

    let opt = {
        uri: 'https://accounts.spotify.com/api/token',
        body: exchangeValue,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + clencr
        }
    }
    request(opt, (error, respons) => {
        deblog(`${error} ${respons.body}`, 1);
        fs.writeFileSync('./spotifyauth.json', respons.body);
        return;
    })
    requestDevices(ACCESS_TOKEN)
    res.send("")
})

//Stop the server
app.get('/stopserver', (req,res) => {
    res.send("Stopping the Node Server!")
    fs.unlinkSync('./spotifyauth.json');
    fs.unlinkSync('./deviceid.txt');
    process.kill(process.pid, 'SIGTERM')
})


//Start Expressjs
app.listen(webport, () => {
    deblog(`Listening on http://127.0.0.1:${webport}/spotify/`,1)
});