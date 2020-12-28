console.log('main.js');
let searchForm = document.querySelector('#search-form');
let results = document.querySelector('#search-results');
let currentlyPlaying = document.querySelector('#currently-playing');
let isPlaying = false;
let controls = document.querySelector('#controls');


searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let searchTerm = searchForm.querySelector('input').value;
  searchSpotify(searchTerm)

});


getCurrentlyPlaying();

controls.addEventListener('click', () => {
  if (isPlaying) {
    controls.innerText = 'Play';
    pauseSong();
  } else {
    controls.innerText = 'Pause';
    playSong();
  }
});

// voice event for search
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.continuous = true;
recognition.start();

recognition.onresult = function(event) {
  
  var searchTerm = event.results[event.results.length-1][0].transcript.replace(' ', '');
  console.log(event.results)
  if (searchTerm == 'play'){
    playSong();
    controls.innerText = 'Pause';
  } else if (searchTerm == 'pause'){
    pauseSong();
    controls.innerText = 'Play';
  }else {
    searchSpotify(searchTerm)
  }
}


// functions
function searchSpotify(searchTerm) {
  fetch('http://localhost:8080/search',{
    method: 'POST',
    headers: {
      "Content-Type":'application/json'
    },
    body: JSON.stringify({search:searchTerm})
  })
  .then(res=> {
    return res.json()
  })
  .then(data => {
    console.log(data);
    let html = '';
    results.innerText = '';
    data.tracks.items.forEach(track => {
      html = `
        <div id="${track.uri}" class="track">
        <div class="track-info">
          <p>${track.name}</p>
          <p>${track.artists[0].name}</p>
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
    });

  // TODO: add song to REQ playlist

    
  })
  .catch(err=> console.log(err));
}


function getCurrentlyPlaying() {
  let url = 'https://api.spotify.com/v1/me/player/currently-playing?market=US'
  fetch('http://localhost:8080/currently-playing', {
    method: 'POST',
    headers: {
      "Content-Type":'application/json'
    },
    body: JSON.stringify({url:url})
  })
  .then(res => {
    return res.json();
  })
  .then(data => {
    console.log(data)
    let html;

    if (data != ''){
      html = `
        <div class="playing-now">
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

    if (isPlaying) {
      controls.innerText = 'Pause';
    } else {
      controls.innerText = 'Play';
    }

  })
  .catch(err=> console.log(err));
  
}


function getPlaylist() {

}



function playSong() {
  let url = 'https://api.spotify.com/v1/me/player/play';
  fetch('http://localhost:8080/play', {
    method: 'POST',
    headers: {
      "Content-Type":'application/json'
    },
    body: JSON.stringify({url:url})
  })
  .then(res => {
    return res.json();
  })
  .then(data => {
    console.log(data)
    isPlaying = true;
  })
  .catch(err=> console.log(err));
}

function pauseSong() {
  let url = 'https://api.spotify.com/v1/me/player/pause';
  fetch('http://localhost:8080/pause', {
    method: 'POST',
    headers: {
      "Content-Type":'application/json'
    },
    body: JSON.stringify({url:url})
  })
  .then(res => {
    return res.json();
  })
  .then(data => {
    console.log(data)
    isPlaying = false;
  })
  .catch(err=> console.log(err));
}

function addToQueue(e) {
  let uri = e.currentTarget.parentElement.id;
  let url = `https://api.spotify.com/v1/me/player/queue?uri=${uri}`;
  fetch('http://localhost:8080/add-to-queue', {
    method: 'POST',
    headers: {
      "Content-Type":'application/json'
    },
    body: JSON.stringify({url:url})
  })
  .then(res => {
    return res.json();
  })
  .then(data => {
    console.log(data)
  })
  .catch(err=> console.log(err));
}