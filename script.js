/* =========================================================
   Waveify — script.js
   ========================================================= */

"use strict";

/* =========================================================
   MUSIQUES
   ========================================================= */

const videoLinks = [
  "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
  "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
  "https://www.youtube.com/watch?v=RgKAFK5djSk",
  "https://www.youtube.com/watch?v=09R8_2nJtjg",
  "https://www.youtube.com/watch?v=YQHsXMglC9A",
  "https://www.youtube.com/watch?v=OPf0YbXqDm0",
  "https://www.youtube.com/watch?v=JGwWNGJdvx8",
  "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  "https://www.youtube.com/watch?v=60ItHLz5WEA",
  "https://www.youtube.com/watch?v=lp-EO5I60KA",
  "https://www.youtube.com/watch?v=hT_nvWreIhg",
  "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
  "https://www.youtube.com/watch?v=7wtfhZwyrcc",
  "https://www.youtube.com/watch?v=KQ6zr6kCPj8",
  "https://www.youtube.com/watch?v=RgKAFK5djSk",
  "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
  "https://www.youtube.com/watch?v=JGwWNGJdvx8",
  "https://www.youtube.com/watch?v=YQHsXMglC9A",
  "https://www.youtube.com/watch?v=OPf0YbXqDm0",
  "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  "https://www.youtube.com/watch?v=60ItHLz5WEA",
  "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
  "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
  "https://www.youtube.com/watch?v=09R8_2nJtjg",
  "https://www.youtube.com/watch?v=hT_nvWreIhg",
  "https://www.youtube.com/watch?v=lp-EO5I60KA",
  "https://www.youtube.com/watch?v=7wtfhZwyrcc",
  "https://www.youtube.com/watch?v=KQ6zr6kCPj8",
  "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
  "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
  "https://www.youtube.com/watch?v=RgKAFK5djSk",
  "https://www.youtube.com/watch?v=09R8_2nJtjg",
  "https://www.youtube.com/watch?v=YQHsXMglC9A",
  "https://www.youtube.com/watch?v=OPf0YbXqDm0",
  "https://www.youtube.com/watch?v=JGwWNGJdvx8",
  "https://www.youtube.com/watch?v=kJQP7kiw5Fk"
];


/* =========================================================
   CRÉATION DES MORCEAUX
   ========================================================= */

function getYoutubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.substring(1);
    }

    return parsed.searchParams.get("v");
  } catch (error) {
    return null;
  }
}


const tracks = videoLinks
  .map((url, index) => {

    const youtubeId = getYoutubeId(url);

    return {
      id: index,
      youtubeId: youtubeId,
      title: `Track ${String(index + 1).padStart(2, "0")}`,
      artist: "Waveify",
      cover: youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : "",
      url: url
    };

  })
  .filter(track => track.youtubeId);


/* =========================================================
   VARIABLES
   ========================================================= */

let currentTrack = 15;

let isPlaying = false;

let shuffleEnabled = false;

let repeatEnabled = false;

let youtubePlayer = null;

let youtubeReady = false;

let progressInterval = null;

let favorites = [];

let savedSection = "homeSection";


/* =========================================================
   CHARGEMENT LOCALSTORAGE
   ========================================================= */

function loadSavedData() {

  try {

    const savedFavorites =
      localStorage.getItem("waveifyFavorites");

    if (savedFavorites) {

      const parsed =
        JSON.parse(savedFavorites);

      if (Array.isArray(parsed)) {
        favorites = parsed
          .map(Number)
          .filter(Number.isInteger);
      }

    }

  } catch (error) {

    favorites = [];

  }


  const section =
    localStorage.getItem("waveifySection");

  if (
    section &&
    document.getElementById(section)
  ) {
    savedSection = section;
  }

}


/* =========================================================
   SAUVEGARDE DES FAVORIS
   ========================================================= */

function saveFavorites() {

  localStorage.setItem(
    "waveifyFavorites",
    JSON.stringify(favorites)
  );

}


/* =========================================================
   SAUVEGARDE DE LA PAGE
   ========================================================= */

function saveSection(sectionId) {

  localStorage.setItem(
    "waveifySection",
    sectionId
  );

}


/* =========================================================
   CHARGER YOUTUBE
   ========================================================= */

function loadYouTubeAPI() {

  if (
    window.YT &&
    window.YT.Player
  ) {

    createYouTubePlayer();

    return;

  }


  if (
    document.getElementById("youtube-api")
  ) {

    return;

  }


  window.onYouTubeIframeAPIReady =
    createYouTubePlayer;


  const script =
    document.createElement("script");

  script.id = "youtube-api";

  script.src =
    "https://www.youtube.com/iframe_api";

  document.head.appendChild(script);

}


/* =========================================================
   CRÉER LE PLAYER YOUTUBE
   ========================================================= */

function createYouTubePlayer() {

  if (youtubePlayer) {
    return;
  }


  if (!window.YT || !window.YT.Player) {
    return;
  }


  youtubePlayer =
    new YT.Player(
      "youtubePlayer",
      {

        width: "1",
        height: "1",

        videoId:
          tracks[currentTrack]
            ? tracks[currentTrack].youtubeId
            : "",

        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0
        },

        events: {

          onReady: function () {

            youtubeReady = true;

            updatePlayer();

            updateProgress();

          },


          onStateChange:
            handlePlayerStateChange,


          onError:
            handlePlayerError

        }

      }
    );

}


/* =========================================================
   ÉTAT YOUTUBE
   ========================================================= */

function handlePlayerStateChange(event) {

  if (!window.YT) {
    return;
  }


  if (
    event.data ===
    YT.PlayerState.PLAYING
  ) {

    isPlaying = true;

    updatePlayButton();

    startProgress();

    return;

  }


  if (
    event.data ===
    YT.PlayerState.PAUSED
  ) {

    isPlaying = false;

    updatePlayButton();

    stopProgress();

    return;

  }


  if (
    event.data ===
    YT.PlayerState.BUFFERING
  ) {

    return;

  }


  if (
    event.data ===
    YT.PlayerState.ENDED
  ) {

    isPlaying = false;

    updatePlayButton();

    stopProgress();

    handleTrackEnded();

  }

}


/* =========================================================
   ERREUR YOUTUBE
   ========================================================= */

function handlePlayerError() {

  isPlaying = false;

  updatePlayButton();

  stopProgress();

}


/* =========================================================
   MORCEAU TERMINÉ
   ========================================================= */

function handleTrackEnded() {

  if (repeatEnabled) {

    playTrack(
      currentTrack,
      true
    );

    return;

  }


  nextTrack();

}


/* =========================================================
   LIRE UN MORCEAU
   ========================================================= */

function playTrack(index, restart = false) {

  const number =
    Number(index);


  if (
    !Number.isInteger(number) ||
    !tracks[number]
  ) {

    return;

  }


  currentTrack = number;


  updatePlayer();


  loadYouTubeAPI();


  if (
    !youtubePlayer ||
    !youtubeReady
  ) {

    return;

  }


  const id =
    tracks[currentTrack].youtubeId;


  try {

    if (restart) {

      youtubePlayer.loadVideoById(id);

    } else {

      youtubePlayer.loadVideoById(id);

    }

    youtubePlayer.playVideo();

    isPlaying = true;

    updatePlayButton();

    startProgress();

  } catch (error) {

    isPlaying = false;

    updatePlayButton();

  }

}


/* =========================================================
   LECTURE / PAUSE
   ========================================================= */

function togglePlay() {

  loadYouTubeAPI();


  if (
    !youtubePlayer ||
    !youtubeReady
  ) {

    return;

  }


  try {

    if (isPlaying) {

      youtubePlayer.pauseVideo();

    } else {

      youtubePlayer.playVideo();

    }

  } catch (error) {

    console.warn(
      "Impossible de contrôler la lecture.",
      error
    );

  }

}


/* =========================================================
   MORCEAU SUIVANT
   ========================================================= */

function nextTrack() {

  if (!tracks.length) {
    return;
  }


  if (shuffleEnabled) {

    if (tracks.length === 1) {

      playTrack(0);

      return;

    }


    let next;

    do {

      next =
        Math.floor(
          Math.random() *
          tracks.length
        );

    } while (
      next === currentTrack
    );


    playTrack(next);

    return;

  }


  let next =
    currentTrack + 1;


  if (next >= tracks.length) {

    next = 0;

  }


  playTrack(next);

}


/* =========================================================
   MORCEAU PRÉCÉDENT
   ========================================================= */

function previousTrack() {

  if (
    youtubePlayer &&
    youtubeReady
  ) {

    try {

      const time =
        youtubePlayer.getCurrentTime();


      if (
        Number.isFinite(time) &&
        time > 3
      ) {

        youtubePlayer.seekTo(
          0,
          true
        );

        return;

      }

    } catch (error) {}

  }


  let previous =
    currentTrack - 1;


  if (previous < 0) {

    previous =
      tracks.length - 1;

  }


  playTrack(previous);

}


/* =========================================================
   METTRE À JOUR LE PLAYER
   ========================================================= */

function updatePlayer() {

  const track =
    tracks[currentTrack];


  if (!track) {
    return;
  }


  const cover =
    document.getElementById(
      "playerCover"
    );


  const title =
    document.getElementById(
      "playerTitle"
    );


  const artist =
    document.getElementById(
      "playerArtist"
    );


  const favorite =
    document.getElementById(
      "playerFavorite"
    );


  if (cover) {

    cover.src =
      track.cover;

    cover.alt =
      track.title;

  }


  if (title) {

    title.textContent =
      track.title;

  }


  if (artist) {

    artist.textContent =
      track.artist;

  }


  if (favorite) {

    const active =
      favorites.includes(
        track.id
      );


    favorite.textContent =
      active ? "♥" : "♡";


    favorite.classList.toggle(
      "active",
      active
    );

  }


  updatePlayButton();

}


/* =========================================================
   BOUTON PLAY / PAUSE
   ========================================================= */

function updatePlayButton() {

  const button =
    document.getElementById(
      "playButton"
    );


  if (!button) {
    return;
  }


  button.textContent =
    isPlaying
      ? "❚❚"
      : "▶";


  button.setAttribute(
    "aria-label",
    isPlaying
      ? "Pause"
      : "Lecture"
  );


  button.setAttribute(
    "title",
    isPlaying
      ? "Pause"
      : "Lecture"
  );

}


/* =========================================================
   PROGRESSION
   ========================================================= */

function startProgress() {

  stopProgress();


  progressInterval =
    setInterval(
      updateProgress,
      250
    );

}


function stopProgress() {

  if (progressInterval) {

    clearInterval(
      progressInterval
    );

    progressInterval = null;

  }

}


function updateProgress() {

  if (
    !youtubePlayer ||
    !youtubeReady
  ) {

    return;

  }


  let current = 0;

  let duration = 0;


  try {

    current =
      youtubePlayer.getCurrentTime();

    duration =
      youtubePlayer.getDuration();

  } catch (error) {

    return;

  }


  if (
    !Number.isFinite(current) ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {

    return;

  }


  const percentage =
    Math.max(
      0,
      Math.min(
        100,
        (current / duration) * 100
      )
    );


  const fill =
    document.getElementById(
      "progressFill"
    );


  const thumb =
    document.getElementById(
      "progressThumb"
    );


  if (fill) {

    fill.style.width =
      `${percentage}%`;

  }


  if (thumb) {

    thumb.style.left =
      `${percentage}%`;

  }


  const currentTime =
    document.getElementById(
      "currentTime"
    );


  const durationElement =
    document.getElementById(
      "duration"
    );


  if (currentTime) {

    currentTime.textContent =
      formatTime(current);

  }


  if (durationElement) {

    durationElement.textContent =
      formatTime(duration);

  }

}


/* =========================================================
   FORMAT TEMPS
   ========================================================= */

function formatTime(seconds) {

  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {

    return "0:00";

  }


  const total =
    Math.floor(seconds);


  const minutes =
    Math.floor(total / 60);


  const secs =
    total % 60;


  return (
    `${minutes}:` +
    `${String(secs).padStart(2, "0")}`
  );

}


/* =========================================================
   BARRE DE PROGRESSION
   ========================================================= */

function seekFromClick(event) {

  if (
    !youtubePlayer ||
    !youtubeReady
  ) {

    return;

  }


  const bar =
    event.currentTarget;


  const rect =
    bar.getBoundingClientRect();


  if (!rect.width) {
    return;
  }


  const position =
    (event.clientX - rect.left) /
    rect.width;


  const percentage =
    Math.max(
      0,
      Math.min(
        1,
        position
      )
    );


  try {

    const duration =
      youtubePlayer.getDuration();


    youtubePlayer.seekTo(
      duration * percentage,
      true
    );

  } catch (error) {}

}


/* =========================================================
   FAVORIS
   ========================================================= */

function isFavorite(id) {

  return favorites.includes(
    Number(id)
  );

}


function toggleFavorite(id) {

  id = Number(id);


  if (
    !Number.isInteger(id)
  ) {

    return;

  }


  if (
    favorites.includes(id)
  ) {

    favorites =
      favorites.filter(
        favoriteId =>
          favoriteId !== id
      );

  } else {

    favorites.push(id);

  }


  saveFavorites();

  renderAll();

  updatePlayer();

}


/* =========================================================
   RENDU DES CARTES
   ========================================================= */

function renderCards(
  container,
  list
) {

  if (!container) {
    return;
  }


  container.innerHTML = "";


  list.forEach(track => {

    const favorite =
      isFavorite(track.id);


    const card =
      document.createElement(
        "article"
      );


    card.className =
      "music-card";


    card.innerHTML = `

      <div class="card-cover">

        <img
          src="${escapeHtml(track.cover)}"
          alt="${escapeHtml(track.title)}"
          loading="lazy"
        >

        <button
          type="button"
          class="card-play"
          data-play="${track.id}"
          aria-label="Lire ${escapeHtml(track.title)}"
        >
          ▶
        </button>

      </div>

      <div class="card-info">

        <button
          type="button"
          class="card-favorite ${
            favorite ? "active" : ""
          }"
          data-favorite="${track.id}"
          aria-label="${
            favorite
              ? "Retirer des favoris"
              : "Ajouter aux favoris"
          }"
        >
          ${favorite ? "♥" : "♡"}
        </button>

        <span class="card-title">
          ${escapeHtml(track.title)}
        </span>

        <span class="card-artist">
          ${escapeHtml(track.artist)}
        </span>

      </div>

    `;


    container.appendChild(card);

  });

}


/* =========================================================
   PROTECTION HTML
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   RENDRE TOUT LE SITE
   ========================================================= */

function renderAll() {

  const homeGrid =
    document.getElementById(
      "musicGrid"
    );


  const libraryGrid =
    document.getElementById(
      "libraryGrid"
    );


  const favoritesGrid =
    document.getElementById(
      "favoritesGrid"
    );


  const favoriteTracks =
    tracks.filter(
      track =>
        favorites.includes(
          track.id
        )
    );


  if (homeGrid) {

    renderCards(
      homeGrid,
      tracks.slice(0, 10)
    );

  }


  if (libraryGrid) {

    renderCards(
      libraryGrid,
      tracks
    );

  }


  if (favoritesGrid) {

    renderCards(
      favoritesGrid,
      favoriteTracks
    );

  }


  const emptyFavorites =
    document.getElementById(
      "emptyFavorites"
    );


  if (emptyFavorites) {

    emptyFavorites.classList.toggle(
      "show",
      favoriteTracks.length === 0
    );

  }


  const favoriteCount =
    document.getElementById(
      "favoriteCount"
    );


  if (favoriteCount) {

    const number =
      favoriteTracks.length;


    favoriteCount.textContent =
      `${number} morceau${
        number > 1 ? "x" : ""
      }`;

  }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(sectionId) {

  const section =
    document.getElementById(
      sectionId
    );


  if (!section) {
    return;
  }


  document
    .querySelectorAll(
      ".page-section"
    )
    .forEach(page => {

      page.classList.toggle(
        "active",
        page.id === sectionId
      );

    });


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.section ===
          sectionId
      );

    });


  saveSection(sectionId);


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   ALÉATOIRE
   ========================================================= */

function toggleShuffle() {

  shuffleEnabled =
    !shuffleEnabled;


  const button =
    document.getElementById(
      "shuffleButton"
    );


  if (button) {

    button.classList.toggle(
      "active",
      shuffleEnabled
    );

  }

}


/* =========================================================
   RÉPÉTER
   ========================================================= */

function toggleRepeat() {

  repeatEnabled =
    !repeatEnabled;


  const button =
    document.getElementById(
      "repeatButton"
    );


  if (button) {

    button.classList.toggle(
      "active",
      repeatEnabled
    );

  }

}


/* =========================================================
   ÉVÉNEMENTS DES CARTES
   ========================================================= */

document.addEventListener(
  "click",
  function(event) {

    const playButton =
      event.target.closest(
        "[data-play]"
      );


    if (playButton) {

      event.preventDefault();

      playTrack(
        playButton.dataset.play
      );

  
