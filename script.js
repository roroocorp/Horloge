/*
    WAVEIFY
    --------------------------------
    Ajoute tes musiques dans cette liste.

    youtube = l'identifiant de la vidéo YouTube.

    Exemple :
    https://www.youtube.com/watch?v=dQw4w9WgXcQ
                              ↓
    youtube: "dQw4w9WgXcQ"
*/

const songs = [
    {
        title: "Never Gonna Give You Up",
        artist: "Rick Astley",
        youtube: "dQw4w9WgXcQ",
        cover: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    },

    {
        title: "Blinding Lights",
        artist: "The Weeknd",
        youtube: "4NRXx6U8ABQ",
        cover: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg"
    },

    {
        title: "Shape of You",
        artist: "Ed Sheeran",
        youtube: "JGwWNGJdvx8",
        cover: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg"
    },

    {
        title: "Stay",
        artist: "The Kid LAROI & Justin Bieber",
        youtube: "kTJczUoc26U",
        cover: "https://i.ytimg.com/vi/kTJczUoc26U/hqdefault.jpg"
    },

    {
        title: "As It Was",
        artist: "Harry Styles",
        youtube: "H5v3kku4y6Q",
        cover: "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg"
    },

    {
        title: "Levitating",
        artist: "Dua Lipa",
        youtube: "TUVcZfQe-Kw",
        cover: "https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg"
    }
];

let currentSong = -1;
let isPlaying = false;
let player = null;


/* -----------------------------
   AFFICHER LES MUSIQUES
----------------------------- */

function displaySongs(list = songs) {

    const grid = document.getElementById("musicGrid");

    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = "<p>Aucune musique trouvée.</p>";
        return;
    }

    list.forEach((song, index) => {

        const realIndex = songs.indexOf(song);

        const card = document.createElement("div");

        card.className = "music-card";

        card.innerHTML = `
            <img
                class="cover"
                src="${song.cover}"
                alt="${song.title}"
                loading="lazy"
            >

            <button
                class="play-card"
                onclick="event.stopPropagation(); playSong(${realIndex})"
            >
                ▶
            </button>

            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        `;

        card.onclick = () => playSong(realIndex);

        grid.appendChild(card);
    });
}


/* -----------------------------
   YOUTUBE API
----------------------------- */

function loadYouTubeAPI() {

    const tag = document.createElement("script");

    tag.src = "https://www.youtube.com/iframe_api";

    document.head.appendChild(tag);
}

function onYouTubeIframeAPIReady() {

    player = new YT.Player("youtubePlayer", {

        height: "0",
        width: "0",

        videoId: "",

        playerVars: {
            autoplay: 0,
            controls: 0
        },

        events: {
            onStateChange: onPlayerStateChange
        }
    });
}


/* -----------------------------
   LECTEUR
----------------------------- */

function playSong(index) {

    if (!player) {
        alert("Le lecteur YouTube est encore en train de charger.");
        return;
    }

    currentSong = index;

    const song = songs[index];

    player.loadVideoById(song.youtube);

    document.getElementById("currentTitle").textContent = song.title;
    document.getElementById("currentArtist").textContent = song.artist;

    document.getElementById("currentCover").style.backgroundImage =
        `url("${song.cover}")`;

    document.getElementById("currentCover").style.backgroundSize = "cover";

    document.getElementById("playButton").textContent = "❚❚";

    isPlaying = true;
}


function togglePlay() {

    if (!player || currentSong === -1) {
        if (songs.length > 0) {
            playSong(0);
        }
        return;
    }

    if (isPlaying) {

        player.pauseVideo();

        isPlaying = false;

        document.getElementById("playButton").textContent = "▶";

    } else {

        player.playVideo();

        isPlaying = true;

        document.getElementById("playButton").textContent = "❚❚";
    }
}


function nextSong() {

    if (songs.length === 0) return;

    let next = currentSong + 1;

    if (next >= songs.length) {
        next = 0;
    }

    playSong(next);
}


function previousSong() {

    if (songs.length === 0) return;

    let previous = currentSong - 1;

    if (previous < 0) {
        previous = songs.length - 1;
    }

    playSong(previous);
}


function onPlayerStateChange(event) {

    if (event.data === YT.PlayerState.ENDED) {
        nextSong();
    }

    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById("playButton").textContent = "❚❚";
    }

    if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        document.getElementById("playButton").textContent = "▶";
    }
}


/* -----------------------------
   RECHERCHE
----------------------------- */

function searchMusic() {

    const query =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const results = songs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );

    displaySongs(results);
}


/* -----------------------------
   PLAYLIST
----------------------------- */

function createPlaylist() {

    const name = prompt("Nom de ta playlist :");

    if (!name) return;

    const playlists = document.getElementById("playlists");

    if (playlists.innerHTML.includes("Aucune playlist")) {
        playlists.innerHTML = "";
    }

    const playlist = document.createElement("p");

    playlist.textContent = "♫ " + name;

    playlists.appendChild(playlist);
}


/* -----------------------------
   MENU MOBILE
----------------------------- */

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("open");
}


/* -----------------------------
   VOLUME
----------------------------- */

document
    .querySelector(".volume input")
    .addEventListener("input", function () {

        if (player) {
            player.setVolume(this.value);
        }

    });


/* -----------------------------
   INITIALISATION
----------------------------- */

displaySongs();

loadYouTubeAPI();
