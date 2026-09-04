"use strict";

/* =========================================
   WAVEIFY
   Music for your mood
   ========================================= */


/* =========================================
   MORCEAUX YOUTUBE
   ========================================= */

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


/* =========================================
   DONNÉES
   ========================================= */

function getYoutubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
}


const tracks = videoLinks.map((url, index) => {
  const youtubeId = getYoutubeId(url);

  return {
    id: index + 1,
    title: `Track ${String(index + 1).padStart(2, "0")}`,
    artist: "Waveify",
    url,
    youtubeId,
    cover: youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : ""
  };
});


/* =========================================
   ÉTAT
   ========================================= */

let currentTrackIndex = 0;
let player = null;
let playerReady = false;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let progressTimer = null;

let favorites = JSON.parse(
  localStorage.getItem("waveifyFavorites") || "[]"
);


/* =========================================
   ÉLÉMENTS
   ========================================= */

const musicGrid = document.getElementById("musicGrid");
const libraryGrid = document.getElementById("libraryGrid");
const favoritesGrid = document.getElementById("favoritesGrid");

const emptyFavorites = document.getElementById("emptyFavorites");
const libraryEmpty = document.getElementById("libraryEmpty");

const playerCover = document.getElementById("playerCover");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const playerHeart = document.getElementById("playerHeart");

const progressBar = document.getElementById("progressBar");
const currentTimeElement = document.getElementById("currentTime");
const durationElement = document.getElementById("duration");

const volumeBar = document.getElementById("volumeBar");
const muteButton = document.getElementById("muteButton");

const shuffleButton = document.getElementById("shuffleButton");
const repeatButton = document.getElementById("repeatButton");

const searchInput = document.getElementById("searchInput");

const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.getElementById("sidebar");

const notificationButton =
  document.getElementById("notificationButton");

const heroPlay =
  document.getElementById("heroPlay");

const seeAllHome =
  document.getElementById("seeAllHome");


/* =========================================
   FAVORIS
   ========================================= */

function saveFavorites() {
  localStorage.setItem(
    "waveifyFavorites",
    JSON.stringify(favorites)
  );
}


function isFavorite(trackId) {
  return favorites.includes(trackId);
}


function toggleFavorite(trackId) {
  if (isFavorite(trackId)) {
    favorites = favorites.filter(id => id !== trackId);
  } else {
    favorites.push(trackId);
  }

  saveFavorites();

  renderAll();

  updatePlayerFavorite();
}


/* =========================================
   CARTES
   ========================================= */

function createTrackCard(track) {

  const card = document.createElement("article");

  card.className = "music-card";

  card.dataset.id = track.id;

  const favorite = isFavorite(track.id);

  card.innerHTML = `
    <div class="card-cover">

      <img
        src="${track.cover}"
        alt="${track.title}"
        loading="lazy"
      >

      <button
        class="card-heart ${favorite ? "favorite" : ""}"
        data-action="favorite"
        aria-label="Favori"
      >
        ${favorite ? "♥" : "♡"}
      </button>

      <button
        class="card-play"
        data-action="play"
        aria-label="Lire ${track.title}"
      >
        ▶
      </button>

    </div>

    <span class="card-title">
      ${track.title}
    </span>

    <span class="card-artist">
      ${track.artist}
    </span>
  `;

  card.addEventListener("click", event => {

    const actionButton =
      event.target.closest("[data-action]");

    if (actionButton) {

      const action =
        actionButton.dataset.action;

      if (action === "favorite") {
        toggleFavorite(track.id);
      }

      if (action === "play") {
        playTrack(track.id);
      }

      return;
    }

    playTrack(track.id);
  });

  return card;
}


/* =========================================
   AFFICHAGE
   ========================================= */

function renderGrid(container, list) {

  if (!container) return;

  container.innerHTML = "";

  list.forEach(track => {
    container.appendChild(
      createTrackCard(track)
    );
  });
}


function renderAll() {

  renderGrid(
    musicGrid,
    tracks
  );

  renderGrid(
    libraryGrid,
    tracks
  );

  const favoriteTracks =
    tracks.filter(track =>
      favorites.includes(track.id)
    );

  renderGrid(
    favoritesGrid,
    favoriteTracks
  );

  if (emptyFavorites) {
    emptyFavorites.classList.toggle(
      "visible",
      favoriteTracks.length === 0
    );
  }

  if (libraryEmpty) {
    libraryEmpty.classList.toggle(
      "visible",
      tracks.length === 0
    );
  }
}


/* =========================================
   LECTEUR YOUTUBE
   ========================================= */

function loadYoutubeAPI() {

  if (
    window.YT &&
    window.YT.Player
  ) {
    createYoutubePlayer();
    return;
  }

  if (
    document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    )
  ) {
    return;
  }

  const script =
    document.createElement("script");

  script.src =
    "https://www.youtube.com/iframe_api";

  document.head.appendChild(script);
}


window.onYouTubeIframeAPIReady =
  function () {
    createYoutubePlayer();
  };


function createYoutubePlayer() {

  if (player) return;

  player =
    new YT.Player("youtubePlayer", {

      width: "1",
      height: "1",

      videoId:
        tracks[currentTrackIndex].youtubeId,

      playerVars: {
        autoplay: 0,
        controls: 0,
        playsinline: 1,
        rel: 0
      },

      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }

    });
}


function onPlayerReady() {

  playerReady = true;

  player.setVolume(
    Number(volumeBar?.value || 100)
  );

  loadTrack(
    currentTrackIndex,
    false
  );
}


function onPlayerStateChange(event) {

  if (
    event.data === YT.PlayerState.PLAYING
  ) {
    isPlaying = true;
    updatePlayButton();
    startProgressTimer();
  }

  else if (
    event.data === YT.PlayerState.PAUSED
  ) {
    isPlaying = false;
    updatePlayButton();
    stopProgressTimer();
  }

  else if (
    event.data === YT.PlayerState.ENDED
  ) {

    isPlaying = false;

    stopProgressTimer();

    if (isRepeat) {
      player.seekTo(0, true);
      player.playVideo();
      return;
    }

    nextTrack();
  }
}


/* =========================================
   LECTURE
   ========================================= */

function loadTrack(index, autoplay = true) {

  if (!tracks.length) return;

  currentTrackIndex =
    (index + tracks.length) %
    tracks.length;

  const track =
    tracks[currentTrackIndex];

  updatePlayerInfo();

  if (
    playerReady &&
    player
  ) {

    player.loadVideoById(
      track.youtubeId
    );

    if (!autoplay) {
      player.pauseVideo();
    }
  }
}


function playTrack(trackId) {

  const index =
    tracks.findIndex(
      track => track.id === trackId
    );

  if (index === -1) return;

  currentTrackIndex = index;

  updatePlayerInfo();

  if (!playerReady) {
    loadYoutubeAPI();
    return;
  }

  player.loadVideoById(
    tracks[currentTrackIndex].youtubeId
  );

  player.playVideo();
}


function togglePlay() {

  if (!playerReady) {
    loadYoutubeAPI();
    return;
  }

  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}


function previousTrack() {

  if (!tracks.length) return;

  let index;

  if (isShuffle) {
    index =
      Math.floor(
        Math.random() * tracks.length
      );
  } else {
    index =
      currentTrackIndex - 1;

    if (index < 0) {
      index = tracks.length - 1;
    }
  }

  playTrack(
    tracks[index].id
  );
}


function nextTrack() {

  if (!tracks.length) return;

  let index;

  if (isShuffle) {

    index =
      Math.floor(
        Math.random() * tracks.length
      );

  } else {

    index =
      currentTrackIndex + 1;

    if (index >= tracks.length) {
      index = 0;
    }
  }

  playTrack(
    tracks[index].id
  );
}


/* =========================================
   INFOS DU LECTEUR
   ========================================= */

function updatePlayerInfo() {

  const track =
    tracks[currentTrackIndex];

  if (!track) return;

  if (playerCover) {
    playerCover.src =
      track.cover;
  }

  if (playerTitle) {
    playerTitle.textContent =
      track.title;
  }

  if (playerArtist) {
    playerArtist.textContent =
      track.artist;
  }

  updatePlayerFavorite();
}


function updatePlayerFavorite() {

  if (!playerHeart) return;

  const track =
    tracks[currentTrackIndex];

  if (!track) return;

  const favorite =
    isFavorite(track.id);

  playerHeart.textContent =
    favorite ? "♥" : "♡";

  playerHeart.classList.toggle(
    "favorite",
    favorite
  );
}


function updatePlayButton() {

  if (!playButton) return;

  playButton.textContent =
    isPlaying ? "❚❚" : "▶";
}


/* =========================================
   PROGRESSION
   ========================================= */

function startProgressTimer() {

  stopProgressTimer();

  progressTimer =
    setInterval(updateProgress, 250);
}


function stopProgressTimer() {

  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}


function updateProgress() {

  if (
    !playerReady ||
    !player ||
    typeof player.getCurrentTime !== "function"
  ) {
    return;
  }

  const current =
    player.getCurrentTime() || 0;

  const duration =
    player.getDuration() || 0;

  if (duration > 0) {

    progressBar.value =
      (current / duration) * 100;

    durationElement.textContent =
      formatTime(duration);

  } else {

    progressBar.value = 0;

    durationElement.textContent =
      "0:00";
  }

  currentTimeElement.textContent =
    formatTime(current);
}


function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  seconds =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    seconds % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}


function seek(event) {

  if (
    !playerReady ||
    !player
  ) {
    return;
  }

  const duration =
    player.getDuration();

  if (!duration) return;

  const percentage =
    Number(event.target.value) / 100;

  player.seekTo(
    duration * percentage,
    true
  );
}


/* =========================================
   VOLUME
   ========================================= */

let lastVolume = 100;

function changeVolume() {

  if (!playerReady || !player) {
    return;
  }

  const volume =
    Number(volumeBar.value);

  player.setVolume(volume);

  if (volume > 0) {
    lastVolume = volume;
  }

  updateMuteIcon();
}


function toggleMute() {

  if (!playerReady || !player) {
    return;
  }

  const volume =
    Number(player.getVolume());

  if (volume > 0) {

    lastVolume = volume;

    player.setVolume(0);

    volumeBar.value = 0;

  } else {

    const restored =
      lastVolume || 100;

    player.setVolume(restored);

    volumeBar.value =
      restored;
  }

  updateMuteIcon();
}


function updateMuteIcon() {

  const volume =
    Number(volumeBar?.value || 0);

  if (!muteButton) return;

  if (volume === 0) {
    muteButton.textContent = "🔇";
  } else if (volume < 50) {
    muteButton.textContent = "🔉";
  } else {
    muteButton.textContent = "🔊";
  }
}


/* =========================================
   SHUFFLE / REPEAT
   ========================================= */

function toggleShuffle() {

  isShuffle =
    !isShuffle;

  shuffleButton.classList.toggle(
    "active",
    isShuffle
  );
}


function toggleRepeat() {

  isRepeat =
    !isRepeat;

  repeatButton.classList.toggle(
    "active",
    isRepeat
  );
}


/* =========================================
   NAVIGATION
   ========================================= */

function showSection(sectionName) {

  const sections =
    document.querySelectorAll(
      ".page-section"
    );

  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  sections.forEach(section => {

    section.classList.toggle(
      "active",
      section.id === sectionName
    );

  });

  navItems.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.section === sectionName
    );

  });

  localStorage.setItem(
    "waveifySection",
    sectionName
  );

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function setupNavigation() {

  document
    .querySelectorAll(".nav-item")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showSection(
            button.dataset.section
          );

        }
      );

    });
}


/* =========================================
   RECHERCHE
   ========================================= */

function searchTracks(query) {

  const text =
    query
      .trim()
      .toLowerCase();

  if (!text) {

    renderAll();

    return;
  }

  const results =
    tracks.filter(track =>
      track.title
        .toLowerCase()
        .includes(text) ||

      track.artist
        .toLowerCase()
        .includes(text)
    );

  renderGrid(
    musicGrid,
    results
  );

  renderGrid(
    libraryGrid,
    results
  );

  const favoriteResults =
    results.filter(track =>
      favorites.includes(track.id)
    );

  renderGrid(
    favoritesGrid,
    favoriteResults
  );

  if (emptyFavorites) {
    emptyFavorites.classList.toggle(
      "visible",
      favoriteResults.length === 0
    );
  }

  if (libraryEmpty) {
    libraryEmpty.classList.toggle(
      "visible",
      results.length === 0
    );
  }
}


/* =========================================
   MOBILE MENU
   ========================================= */

function toggleMobileMenu() {

  if (!sidebar) return;

  sidebar.classList.toggle(
    "open"
  );
}


/* =========================================
   NOTIFICATIONS
   ========================================= */

async function requestNotifications() {

  if (!("Notification" in window)) {
    return;
  }

  try {

    if (
      Notification.permission === "default"
    ) {

      await Notification.requestPermission();

    }

  } catch (error) {
    console.log(
      "Notifications indisponibles."
    );
  }
}


/* =========================================
   BOUTON HERO
   ========================================= */

function playFromHero() {

  if (!tracks.length) return;

  playTrack(
    tracks[0].id
  );
}


/* =========================================
   VOIR TOUT
   ========================================= */

function showLibrary() {

  showSection("library");

}


/* =========================================
   ÉVÉNEMENTS
   ========================================= */

if (playButton) {
  playButton.addEventListener(
    "click",
    togglePlay
  );
}

if (previousButton) {
  previousButton.addEventListener(
    "click",
    previousTrack
  );
}

if (nextButton) {
  nextButton.addEventListener(
    "click",
    nextTrack
  );
}

if (playerHeart) {

  playerHeart.addEventListener(
    "click",
    () => {

      const track =
        tracks[currentTrackIndex];

      if (track) {
        toggleFavorite(track.id);
      }

    }
  );

}

if (progressBar) {
  progressBar.addEventListener(
    "input",
    seek
  );
}

if (volumeBar) {
  volumeBar.addEventListener(
    "input",
    changeVolume
  );
}

if (muteButton) {
  muteButton.addEventListener(
    "click",
    toggleMute
  );
}

if (shuffleButton) {
  shuffleButton.addEventListener(
    "click",
    toggleShuffle
  );
}

if (repeatButton) {
  repeatButton.addEventListener(
    "click",
    toggleRepeat
  );
}

if (searchInput) {

  searchInput.addEventListener(
    "input",
    event => {
      searchTracks(
        event.target.value
      );
    }
  );

}

if (mobileMenu) {

  mobileMenu.addEventListener(
    "click",
    toggleMobileMenu
  );

}

if (notificationButton) {

  notificationButton.addEventListener(
    "click",
    requestNotifications
  );

}

if (heroPlay) {

  heroPlay.addEventListener(
    "click",
    playFromHero
  );

}

if (seeAllHome) {

  seeAllHome.addEventListener(
    "click",
    showLibrary
  );

}


/* =========================================
   INITIALISATION
   ========================================= */

function init() {

  renderAll();

  setupNavigation();

  updatePlayerInfo();

  updatePlayButton();

  updateMuteIcon();

  const savedSection =
    localStorage.getItem(
      "waveifySection"
    );

  if (
    savedSection &&
    document.getElementById(savedSection)
  ) {

    showSection(
      savedSection
    );

  } else {

    showSection("home");

  }

  loadYoutubeAPI();
}


document.addEventListener(
  "DOMContentLoaded",
  init
);
