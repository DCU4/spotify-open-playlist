'use strict';
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const app = express();
let refresh_token = '';
let scopes = 'user-read-private user-read-email user-read-currently-playing user-modify-playback-state user-read-playback-state playlist-modify-public';
let credentials;
if (fs.existsSync('./credentials.json')) {
  credentials = require('./credentials.json');
}
const secret = process.env.secret ? process.env.secret : credentials.secret;
const client_id = process.env.client_id ? process.env.client_id : credentials.client_id;
const redirect_uri = process.env.secret ? 'https://spotify-dc-app.herokuapp.com/callback/' : 'http://localhost:8080/callback/';

// app.locals.spotifyData = '';

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/player', function (req, res, next) {
  if (res.statusCode === 200) {
    res.render('index');
  } else {
    res.status(404);
  }
});


app.get('/', function (req, res, next) {
  if (res.statusCode === 200) {
    res.writeHead(302, {
      Location: `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scopes}`
    });
    res.send();
  } else {
    res.status(404);
  }
});


app.get('/callback', function (req, res, next) {
  let code = req.query.code;
  if (res.statusCode === 200) {
    if (refresh_token == '') {

      // auth
      spotifyAuthorization(code)
        .then(response => {
          let token = response.data.access_token;
          refresh_token = response.data.refresh_token;
          spotifyAPICall(token, 'https://api.spotify.com/v1/me/player/devices', 'GET')
            .then(data => {
              res.render('index', { data: data.data });
            })
            .catch(err => console.log('spotify err', err.response));
        })
        .catch(err => console.log('callback err', err.response.data));

    } else {

      // refresh
      spotifyRefresh(refresh_token)
        .then(response => {
          let token = response.data.access_token;
          spotifyAPICall(token, 'https://api.spotify.com/v1/me/player/devices', 'GET')
            .then(data => {
              res.render('index', { data: data.data });
            })
            .catch(err => console.log('spotify err', err.response.data));
        })
        .catch(err => console.log('callback err', err.response.data));

    }
  } else {
    res.status(404);
  }
});


app.post('/search', function (req, res) {
  let search = req.body.search;

  if (res.statusCode === 200) {

    authenticate()
      .then(response => {
        let token = response.data.access_token;
        let config = {
          method: 'GET',
          url: `https://api.spotify.com/v1/search?q=${search}&type=album,artist,track`,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        };
        axios(config)
          .then(results => {
            res.json(results.data)
          })
          .catch(err => console.log('search error:', err.response.data));
      })
      .catch(err => console.log('errorrrr', err))

  } else {
    res.status(404);
  }
});


app.post('/currently-playing', function (req, res) {
  let url = req.body.url;
  if (res.statusCode === 200) {

    spotifyAuthAndRefreshData(refresh_token, url, 'GET', res);

  } else {
    res.status(404);
  }
});


app.post('/play', function (req, res) {
  let url = req.body.url;

  if (res.statusCode === 200) {

    spotifyAuthAndRefreshPlayer(refresh_token, url, 'PUT', res);

  } else {
    res.status(404);
  }
});



app.post('/pause', function (req, res) {
  let url = req.body.url;

  if (res.statusCode === 200) {

    spotifyAuthAndRefreshPlayer(refresh_token, url, 'PUT', res);

  } else {
    res.status(404);
  }
});



app.post('/add-to-queue', function(req, res) {
  let url = req.body.url;

  if (res.statusCode === 200) {

    spotifyAuthAndRefreshData(refresh_token, url, 'POST', res);

  } else {
    res.status(404);
  }

});



// get REQ playlist
app.post('/get-playlist', function(req, res) {
  let url = req.body.url;

  if (res.statusCode === 200) {

    spotifyAuthAndRefreshData(refresh_token, url, 'GET', res);

  } else {
    res.status(404);
  }

});





// add to REQ playlist
app.post('/add-to-playlist', function(req, res) {
  let url = req.body.url;

  if (res.statusCode === 200) {

    spotifyAuthAndRefreshData(refresh_token, url, 'POST', res);

  } else {
    res.status(404);
  }

});







// functions

function spotifyAuthAndRefreshPlayer(refresh_token, url, method, res) {
  if (refresh_token == '') {

    // auth
    spotifyAuthorization(code)
      .then(response => {
        let token = response.data.access_token;
        refresh_token = response.data.refresh_token;
        spotifyAPICall(token, url, method)
          .then(data => {
            let playerUrl = 'https://api.spotify.com/v1/me/player';
            spotifyAPICall(token, playerUrl, 'GET')
              .then(data => {
                res.json(data.data);
              })
              .catch(err => console.log('spotify player err', err));
          })
          .catch(err => console.log('spotify err', err));
      })
      .catch(err => console.log('callback err', err));

  } else {

    // refresh
    spotifyRefresh(refresh_token)
      .then(response => {
        let token = response.data.access_token;
        spotifyAPICall(token, url, method)
          .then(data => {
            let playerUrl = 'https://api.spotify.com/v1/me/player';
            spotifyAPICall(token, playerUrl, 'GET')
              .then(data => {
                res.json(data.data);
              })
              .catch(err => console.log('spotify player err', err));
          })
          .catch(err => console.log('spotify err', err));
      })
      .catch(err => console.log('callback err', err));

  }
}


function spotifyAuthAndRefreshData(refresh_token, url, method, res) {
  if (refresh_token == '') {

    // auth
    spotifyAuthorization(code)
      .then(response => {
        let token = response.data.access_token;
        refresh_token = response.data.refresh_token;
        spotifyAPICall(token, url, method)
          .then(data => {
            res.json(data.data);
            // app.locals.spotifyData = data;
          })
          .catch(err => console.log('spotify err', err));
      })
      .catch(err => console.log('callback err', err));

  } else {

    // refresh
    spotifyRefresh(refresh_token)
      .then(response => {
        let token = response.data.access_token;
        spotifyAPICall(token, url, method)
          .then(data => {
            res.json(data.data);
            // app.locals.spotifyData = data;
          })
          .catch(err => console.log('spotify err', err));
      })
      .catch(err => console.log('callback err', err));

  }
}



// authenticate with spotify
async function authenticate() {
  const btoa = (data) => Buffer.from(data).toString('base64');
  const auth = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token?grant_type=client_credentials',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${client_id}:${secret}`)}`
    }
  };

  let res = await axios(auth);
  return res;
}


async function spotifyAuthorization(code) {
  const btoa = (data) => Buffer.from(data).toString('base64');
  const auth = {
    method: 'POST',
    url: `https://accounts.spotify.com/api/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${client_id}:${secret}`)}`
    }
  };

  let res = await axios(auth);
  return res;
}


async function spotifyRefresh(refresh_token) {
  const btoa = (data) => Buffer.from(data).toString('base64');
  const auth = {
    method: 'POST',
    url: `https://accounts.spotify.com/api/token?grant_type=refresh_token&refresh_token=${refresh_token}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${client_id}:${secret}`)}`
    }
  };

  let res = await axios(auth);
  return res;
}


async function spotifyAPICall(access_token, url, method) {
  const auth = {
    method: method,
    url: url,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`
    }
  };
  let res = await axios(auth);
  return res;
}



app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images



// // Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;