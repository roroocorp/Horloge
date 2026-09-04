// script.js

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

const tracks = videoLinks.map((url, index) => {
  const id = new URL(url).searchParams.get("v");

  return {
    id: index,
    youtubeId: id,
    title: `Track ${String(index + 1).padStart(2, "0")}`,
    artist: "Waveify",
    cover: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    url
  };
});


let currentTrack = 15;
let isPlaying = false;
let shuffle = false;
let repeat = false;
let player = null;
let progressTimer = null;

let favorites = JSON.parse(
  localStorage.getItem("waveifyFavorites") || "[]"
);


/* =========================
   YOUTUBE API
========================= */

function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    createPlayer();
    return;
  }

  if (document.getElementById("youtube-api")) return;

  window.onYouTubeIframeAPIReady = createPlayer;

  const script = document.createElement("script");
  script.id = "youtube-api";
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}


function createPlayer() {
  if (player) return;

  player = new YT.Player("youtubePlayer", {
    height: "1",
    width: "1",
    videoId: tracks[currentTrack].youtubeId,

    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
      rel: 0
    },

    events: {
      onReady: () => {
        updatePlayer();
      },

      onStateChange: event => {

        if (event.data === YT.PlayerState.PLAYING) {
          isPlaying = true;
          updatePlayButton();
          startProgress();
        }

        if (event.data === YT.PlayerState.PAUSED) {
          isPlaying = false;
          updatePlayButton();
          stopProgress();
        }

        if (event.data === YT.PlayerState.ENDED) {
          stopProgress();

          if (repeat) {
            player.seekTo(0, true);
            player.playVideo();
          } else {
            nextTrack();
          }
        }
      }
    }
  });
}


/* =========================
   CARTES
========================= */

function renderCards(container, list) {

  if (!container) return;

  container.innerHTML = "";

  list.forEach(track => {

    const favorite = favorites.includes(track.id);

    const card = document.createElement("article");
    card.className = "music-card";

    card.innerHTML = `
      <div class="card-cover">

        <img
          src="${track.cover}"
          alt="${track.title}"
          loading="lazy"
        >

        <button
          type="button"
          class="card-play"
          data-play="${track.id}"
          aria-label="Lire ${track.title}"
        >
          ▶
        </button>

      </div>

      <div class="card-info">

        <button
          type="button"
          class="card-favorite ${favorite ? "active" : ""}"
          data-favorite="${track.id}"
          aria-label="Favori"
        >
          ${favorite ? "♥" : "♡"}
        </button>

        <span class="card-title">
          ${track.title}
        </span>

        <span class="card-artist">
          ${track.artist}
        </span>

      </div>
    `;

    container.appendChild(card);
  });
}


function renderAll() {

  renderCards(
    document.getElementById("musicGrid"),
    tracks.slice(0, 10)
  );

  renderCards(
    document.getElementById("libraryGrid"),
    tracks
  );

  const favoriteTracks = tracks.filter(track =>
    favorites.includes(track.id)
  );

  renderCards(
    document.getElementById("favoritesGrid"),
    favoriteTracks
  );

  const empty = document.getElementById("emptyFavorites");

  if (empty) {
    empty.classList.toggle(
      "show",
      favoriteTracks.length === 0
    );
  }

  const count = document.getElementById("favoriteCount");

  if (count) {
    count.textContent =
      `${favoriteTracks.length} morceau${favoriteTracks.length > 1 ? "x" : ""}`;
  }
}


/* =========================
   LECTURE
========================= */

function playTrack(index) {

  index = Number(index);

  if (!tracks[index]) return;

  currentTrack = index;

  updatePlayer();

  loadYouTubeAPI();

  if (!player) return;

  player.loadVideoById(tracks[currentTrack].youtubeId);
  player.playVideo();

  isPlaying = true;
  updatePlayButton();
}


function togglePlay() {

  loadYouTubeAPI();

  if (!player) return;

  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}


function nextTrack() {

  if (shuffle) {
    let next;

    do {
      next = Math.floor(Math.random() * tracks.length);
    } while (
      tracks.length > 1 &&
      next === currentTrack
    );

    playTrack(next);
    return;
  }

  let next = currentTrack + 1;

  if (next >= tracks.length) {
    next = repeat ? 0 : 0;
  }

  playTrack(next);
}


function previousTrack() {

  if (player) {

    const time = player.getCurrentTime();

    if (time > 3) {
      player.seekTo(0, true);
      return;
    }
  }

  let previous = currentTrack - 1;

  if (previous < 0) {
    previous = tracks.length - 1;
  }

  playTrack(previous);
}


/* =========================
   PLAYER
========================= */

function updatePlayer() {

  const track = tracks[currentTrack];

  const cover = document.getElementById("playerCover");
  const title = document.getElementById("playerTitle");
  const artist = document.getElementById("playerArtist");
  const favorite = document.getElementById("playerFavorite");

  if (cover) {
    cover.src = track.cover;
  }

  if (title) {
    title.textContent = track.title;
  }

  if (artist) {
    artist.textContent = track.artist;
  }

  if (favorite) {

    const active = favorites.includes(track.id);

    favorite.textContent = active ? "♥" : "♡";
    favorite.classList.toggle("active", active);
  }

  updatePlayButton();
}


function updatePlayButton() {

  const button = document.getElementById("playButton");

  if (!button) return;

  button.textContent = isPlaying ? "❚❚" : "▶";
  button.setAttribute(
    "aria-label",
    isPlaying ? "Pause" : "Lecture"
  );
}


/* =========================
   PROGRESSION
========================= */

function startProgress() {

  stopProgress();

  progressTimer = setInterval(() => {

    if (!player || !player.getDuration) return;

    const duration = player.getDuration();

    if (!duration) return;

    const current = player.getCurrentTime();

    const percent =
      Math.max(0, Math.min(100, current / duration * 100));

    const fill = document.getElementById("progressFill");
    const thumb = document.getElementById("progressThumb");

    if (fill) {
      fill.style.width = `${percent}%`;
    }

    if (thumb) {
      thumb.style.left = `${percent}%`;
    }

    const currentTime =
      document.getElementById("currentTime");

    const durationElement =
      document.getElementById("duration");

    if (currentTime) {
      currentTime.textContent = formatTime(current);
    }

    if (durationElement) {
      durationElement.textContent = formatTime(duration);
    }

  }, 250);
}


function stopProgress() {

  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}


function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  seconds = Math.floor(seconds);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}


/* =========================
   BARRE DE PROGRESSION
========================= */

function seekFromClick(event) {

  if (!player || !player.getDuration) return;

  const bar = event.currentTarget;
  const rect = bar.getBoundingClientRect();

  const position =
    (event.clientX - rect.left) / rect.width;

  const duration = player.getDuration();

  player.seekTo(
    Math.max(0, Math.min(1, position)) * duration,
    true
  );
}


/* =========================
   FAVORIS
========================= */

function toggleFavorite(id) {

  id = Number(id);

  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem(
    "waveifyFavorites",
    JSON.stringify(favorites)
  );

  renderAll();
  updatePlayer();
}


/* =========================
   NAVIGATION
========================= */

function showSection(sectionId) {

  document.querySelectorAll(".page-section")
    .forEach(section => {
      section.classList.toggle(
        "active",
        section.id === sectionId
      );
    });

  document.querySelectorAll(".nav-item")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.section === sectionId
      );
    });

  localStorage.setItem(
    "waveifySection",
    sectionId
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================
   ÉVÉNEMENTS
========================= */

document.addEventListener("click", event => {

  const playButton =
    event.target.closest("[data-play]");

  if (playButton) {
    playTrack(playButton.dataset.play);
    return;
  }


  const favoriteButton =
    event.target.closest("[data-favorite]");

  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
    return;
  }


  const navButton =
    event.target.closest(".nav-item");

  if (navButton) {
    showSection(navButton.dataset.section);
    return;
  }
});


/* =========================
   BOUTONS PLAYER
========================= */

document.getElementById("playButton")
  ?.addEventListener("click", togglePlay);

document.getElementById("nextButton")
  ?.addEventListener("click", nextTrack);

document.getElementById("previousButton")
  ?.addEventListener("click", previousTrack);

document.getElementById("shuffleButton")
  ?.addEventListener("click", () => {

    shuffle = !shuffle;

    document
      .getElementById("shuffleButton")
      ?.classList.toggle("active", shuffle);
  });

document.getElementById("repeatButton")
  ?.addEventListener("click", () => {

    repeat = !repeat;

    document
      .getElementById("repeatButton")
      ?.classList.toggle("active", repeat);
  });


document.getElementById("playerFavorite")
  ?.addEventListener("click", () => {
    toggleFavorite(currentTrack);
  });


document.getElementById("progressBar")
  ?.addEventListener("click", seekFromClick);


/* =========================
   TOUT ÉCOUTER
========================= */

document.getElementById("playAllButton")
  ?.addEventListener("click", () => {
    playTrack(0);
  });


/* =========================
   TOUT VOIR
========================= */

document.getElementById("seeAllButton")
  ?.addEventListener("click", () => {
    showSection("librarySection");
  });


/* =========================
   INITIALISATION
========================= */

renderAll();

const savedSection =
  localStorage.getItem("waveifySection");

if (
  savedSection &&
  document.getElementById(savedSection)
) {
  showSection(savedSection);
} else {
  showSection("homeSection");
}

updatePlayer();

loadYouTubeAPI();
