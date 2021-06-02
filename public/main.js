let searchForm = document.querySelector('#search-form');
let results = document.querySelector('#search-results');
let currentlyPlaying = document.querySelector('#currently-playing');
let queue = document.querySelector('#queue');
let firstTrack;
let isPlaying = false;
let controls = document.querySelector('#controls');
// let baseUrl = 'http://localhost:8080';
let baseUrl = 'https://spotify-dc-app.herokuapp.com';
let darkModeBtn = document.querySelector('.dark-toggle');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let searchTerm = searchForm.querySelector('input').value;
  searchSpotify(searchTerm)

});

window.onload = () => {
  getCurrentlyPlaying();
  getPlaylist();
}

darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (darkModeBtn.innerText == 'Light Mode') {
    darkModeBtn.innerText = 'Dark Mode';
  } else {
    darkModeBtn.innerText = 'Light Mode';
  }
})


// controls.addEventListener('click', () => {
//   if (isPlaying) {
//     controls.innerText = 'Play';
//     pauseSong();
//   } else {
//     controls.innerText = 'Pause';
//     playSong();
//   }
// });

// voice event for search
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.continuous = true;
// recognition.start();

recognition.onresult = function (event) {

  var searchTerm = event.results[event.results.length - 1][0].transcript.replace(' ', '');
  console.log(event.results)
  if (searchTerm == 'play') {
    playSong();
    controls.innerText = 'Pause';
  } else if (searchTerm == 'pause') {
    pauseSong();
    controls.innerText = 'Play';
  } else {
    searchSpotify(searchTerm)
  }
}


// functions
function searchSpotify(searchTerm) {

  fetch(`${baseUrl}/search`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ search: searchTerm })
  })
    .then(res => {
      return res.json()
    })
    .then(data => {
      let html = '';
      results.innerText = '';
      data.tracks.items.forEach(track => {
        html = `
        <div id="${track.uri}" class="result track">
          <img class="album" src="${track.album.images[0].url}" />
          <div class="track-info">
            <p class="song">${track.name}</p>
            <p class="artist">${track.artists[0].name}</p>
          </div>
          <p class="add-to-queue">Add to Queue</p>
        </div>
      `;

        results.insertAdjacentHTML('beforeend', html)
      });


      // click event to add song to queue
      let addToQueueBtns = document.querySelectorAll('.add-to-queue');
      addToQueueBtns.forEach(btn => {
        btn.addEventListener('click', addToQueue);
        btn.addEventListener('click', addToPlaylist);
      });

      loadTracks(results)


    })
    .catch(err => console.log(err));
}

let currentlyPlayingSong;
function getCurrentlyPlaying() {
  let url = 'https://api.spotify.com/v1/me/player/currently-playing?market=US'
  fetch(`${baseUrl}/currently-playing`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data);
      let html;
      if (data != '' && data.item) {
        currentlyPlayingSong = data.item.uri;
        html = `
        <div id="${data.item.uri}" class="playing-now">
          <p>${data.item.name}</p>
          <p>${data.item.artists[0].name}</p>
          <p>${data.item.album.name}</p>
        </div>
      `;

        isPlaying = data.is_playing;
      } else {
        html = `
        <div class="playing-now">
          <p>Nothing playing currently</p>
        </div>
      `;
        isPlaying = false;
      }

      currentlyPlaying.insertAdjacentHTML('beforeend', html);

      // if (isPlaying) {
      //   controls.innerText = 'Pause';
      // } else {
      //   controls.innerText = 'Play';
      // }

    })
    .catch(err => console.log(err));

}


function getPlaylist() {
  let url = 'https://api.spotify.com/v1/playlists/4wh4DEEfm4QqLYXn3E5G0s';
  fetch(`${baseUrl}/get-playlist`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data);
      let html;
      data.tracks.items.reverse();

      // <p>${track.track.album.name}</p>
      data.tracks.items.forEach((track, i) => {
        html = `
        <div id="${track.track.uri}" class="track">
          <img src="${track.track.album.images[0].url}" />
          <div class="track-info">
            <p>${track.track.name}</p>
            <p>${track.track.artists[0].name}</p>
          </div>
        </div>
      `;
        queue.insertAdjacentHTML('beforeend', html);
      });

      firstTrack = document.querySelector('#queue .track');

      loadTracks(queue);
    })
    .catch(err => console.log(err));
}


function playSong() {
  let url = 'https://api.spotify.com/v1/me/player/play';
  fetch(`${baseUrl}/play`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data)
      isPlaying = true;
    })
    .catch(err => console.log(err));
}

function pauseSong() {
  let url = 'https://api.spotify.com/v1/me/player/pause';
  fetch(`${baseUrl}/pause`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data)
      isPlaying = false;
    })
    .catch(err => console.log(err));
}

function addToQueue(e) {
  let track = e.currentTarget;
  track.innerText = 'Added!';
  let uri = e.currentTarget.parentElement.id;
  let url = `https://api.spotify.com/v1/me/player/queue?uri=${uri}&device_id=d50fd3b81745b41a7c8892f55e4682740f9e8136`;
  fetch(`${baseUrl}/add-to-queue`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
  .then(res => {
    res.json();   
  })
  .catch(err => console.log(err));
}


function addToPlaylist(e) {
  let track = e.currentTarget.parentElement;
  let album = track.querySelector('.album').src;
  let song = track.querySelector('.song').innerText;
  let artist = track.querySelector('.artist').innerText;
  let uri = e.currentTarget.parentElement.id;
  let url = `https://api.spotify.com/v1/playlists/4wh4DEEfm4QqLYXn3E5G0s/tracks?uris=${uri}`;
  fetch(`${baseUrl}/add-to-playlist`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
    .then(res => {
      let html = `
      <div id="${uri}" class="track">
        <img src="${album}" />
        <div class="track-info">
          <p>${song}</p>
          <p>${artist}</p>
        </div>
      </div>
    `;
      queue.querySelector('.title').insertAdjacentHTML('afterend', html);
      loadTracks(queue);
    })
    .catch(err => console.log(err));
}

function deleteFromPlaylist() {
  // let uri = e.currentTarget.parentElement.id;
  let url = `https://api.spotify.com/v1/playlists/4wh4DEEfm4QqLYXn3E5G0s/tracks?uris=${currentlyPlayingSong}`;
  fetch(`${baseUrl}/add-to-playlist`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
    .then(res => {

      // queue.insertAdjacentHTML('beforeend', html);

    })
    .catch(err => console.log(err));
}



function loadTracks(parent) {
  let tracks = parent.querySelectorAll('.track');
  tracks.forEach((t, i) => {
    setTimeout(() => {
      t.classList.add('loaded');
    }, (i * 50) + 100)
  });
}