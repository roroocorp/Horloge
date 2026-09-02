"use strict";

/* =========================================================
   WAVEIFY
   36 musiques YouTube
========================================================= */

const SONGS = [
  "Pl1d5YSEg2w",
  "y1T2LQ2bym4",
  "SX0u0s5h4as",
  "mdcBqqWj3kY",
  "n2THLWjJ3Wo",
  "Snhn9wB-z1w",
  "xlmyDTa_S6M",
  "rDrIRNUaE6s",
  "EXYj9wecau4",
  "ShR_fQrqsdA",
  "pN-TLYBDkWc",
  "00ff2UcGLu0",
  "c8qXCL-ElfA",
  "pEBFJI-g9AA",
  "63fJnwefxBk",
  "gZXijVptbic",
  "QzZflH4liuU",
  "MFHiEocxkdM",
  "2uM9ZIS-v0w",
  "Qq7Q6CLCfvs",
  "cYi1jI7uLa0",
  "MqiljVyq_1o",
  "KTYp4guSwLg",
  "vaeio3idHzU",
  "FaXqep3IsZw",
  "VIs9zdNq_IU",
  "JwVm-DHKH_U",
  "zNEU9VExoWE",
  "WudXzTex5JQ",
  "pxjsZK_fkO4",
  "dIJuNqS9c3w",
  "BJwovrr6XzI",
  "yx9WQ0hrsdk",
  "0uLp-tejcSo",
  "w4CI96-D2Zg",
  "HqJ1qP05Si0"
];

const STORAGE_KEY = "waveify-final-v1";

const $ = selector => document.querySelector(selector);

const unique = array => [...new Set(array)];

function createSongs() {
  return SONGS.map((id, index) => ({
    id,
    title: `Musique ${String(index + 1).padStart(2, "0")}`,
    artist: "YouTube",
    cover: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  }));
}

const songs = createSongs();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      return {
        liked: [],
        disliked: [],
        playlist: [],
        history: [],
        currentId: null,
        queue: [...SONGS],
        queueIndex: -1,
        infinite: false,
        shuffle: false,
        repeat: false,
        volume: 80
      };
    }

    return {
      liked: Array.isArray(saved.liked) ? saved.liked : [],
      disliked: Array.isArray(saved.disliked) ? saved.disliked : [],
      playlist: Array.isArray(saved.playlist) ? saved.playlist : [],
      history: Array.isArray(saved.history) ? saved.history : [],
      currentId: saved.currentId || null,
      queue: Array.isArray(saved.queue) && saved.queue.length
        ? saved.queue
        : [...SONGS],
      queueIndex: Number.isInteger(saved.queueIndex)
        ? saved.queueIndex
        : -1,
      infinite: Boolean(saved.infinite),
      shuffle: Boolean(saved.shuffle),
      repeat: Boolean(saved.repeat),
      volume: typeof saved.volume === "number"
        ? saved.volume
        : 80
    };
  } catch {
    return {
      liked: [],
      disliked: [],
      playlist: [],
      history: [],
      currentId: null,
      queue: [...SONGS],
      queueIndex: -1,
      infinite: false,
      shuffle: false,
      repeat: false,
      volume: 80
    };
  }
}

const state = loadState();

let player = null;
let playerReady = false;
let progressTimer = null;
let toastTimer = null;
let currentPage = "home";
let searchResults = [];


/* =========================================================
   STORAGE
========================================================= */

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}


/* =========================================================
   HELPERS
========================================================= */

function getSong(id) {
  return songs.find(song => song.id === id);
}

function getSongs(ids) {
  return unique(ids)
    .map(getSong)
    .filter(Boolean);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function showToast(message) {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(page) {
  const validPages = [
    "home",
    "recommendations",
    "liked",
    "disliked",
    "playlist",
    "search"
  ];

  if (!validPages.includes(page)) {
    page = "home";
  }

  currentPage = page;

  document.querySelectorAll(".page").forEach(element => {
    element.classList.remove("active");
  });

  const target = $(`#${page}Page`);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.page === page
    );
  });

  if (location.hash !== `#${page}`) {
    history.pushState(
      { page },
      "",
      `#${page}`
    );
  }

  closeMobileMenu();
  renderCurrentPage();
}

function initializeNavigation() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });

  window.addEventListener("popstate", () => {
    const page = location.hash.replace("#", "") || "home";
    showPage(page);
  });

  const initialPage =
    location.hash.replace("#", "") || "home";

  showPage(initialPage);
}


/* =========================================================
   SONG CARD
========================================================= */

function songCard(song) {
  const liked = state.liked.includes(song.id);
  const disliked = state.disliked.includes(song.id);
  const inPlaylist = state.playlist.includes(song.id);

  return `
    <article class="music-card">

      <div class="cover-wrap">

        <img
          src="${song.cover}"
          alt="${song.title}"
          loading="lazy"
          onerror="this.src='https://i.ytimg.com/vi/${song.id}/mqdefault.jpg'">

        <button
          class="card-play"
          data-action="play"
          data-id="${song.id}"
          aria-label="Lire ${song.title}">
          ▶
        </button>

      </div>

      <div class="card-title">
        ${song.title}
      </div>

      <div class="card-artist">
        ${song.artist}
      </div>

      <div class="card-actions">

        <button
          class="card-action ${liked ? "active-like" : ""}"
          data-action="like"
          data-id="${song.id}"
          title="J’aime">
          ${liked ? "♥" : "♡"}
        </button>

        <button
          class="card-action ${disliked ? "active-dislike" : ""}"
          data-action="dislike"
          data-id="${song.id}"
          title="Pas aimé">
          👎
        </button>

        <button
          class="card-action ${inPlaylist ? "active-playlist" : ""}"
          data-action="playlist"
          data-id="${song.id}"
          title="${inPlaylist ? "Retirer de la playlist" : "Ajouter à la playlist"}">
          ${inPlaylist ? "✓" : "+"}
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   PLAYLIST ROW
========================================================= */

function playlistRow(song) {
  return `
    <div class="playlist-row">

      <img
        src="${song.cover}"
        alt="${song.title}">

      <div class="row-info">

        <div class="row-title">
          ${song.title}
        </div>

        <div class="row-artist">
          ${song.artist}
        </div>

      </div>

      <div class="row-actions">

        <button
          data-action="play"
          data-id="${song.id}"
          title="Lire">
          ▶
        </button>

        <button
          data-action="playlist"
          data-id="${song.id}"
          title="Retirer">
          ×
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyState(icon, title, text) {
  return `
    <div class="empty-state">

      <div class="empty-icon">
        ${icon}
      </div>

      <h3>
        ${title}
      </h3>

      <p>
        ${text}
      </p>

    </div>
  `;
}


/* =========================================================
   RENDER
========================================================= */

function renderHome() {
  const home = $("#homeMusicGrid");
  const recent = $("#recentMusicGrid");

  if (home) {
    home.innerHTML = songs
      .slice(0, 12)
      .map(songCard)
      .join("");
  }

  const recentSongs = getSongs(state.history);

  if (recent) {
    recent.innerHTML = recentSongs.length
      ? recentSongs.slice(0, 8).map(songCard).join("")
      : emptyState(
          "♫",
          "Aucune écoute récente",
          "Lance une musique pour la retrouver ici."
        );
  }
}

function renderRecommendations() {
  const container = $("#recommendationsGrid");

  if (!container) return;

  let recommended = songs.filter(
    song => !state.disliked.includes(song.id)
  );

  if (recommended.length > 12) {
    recommended = recommended.slice(0, 12);
  }

  container.innerHTML = recommended
    .map(songCard)
    .join("");
}

function renderLiked() {
  const container = $("#likedGrid");

  if (!container) return;

  const likedSongs = getSongs(state.liked);

  container.innerHTML = likedSongs.length
    ? likedSongs.map(songCard).join("")
    : emptyState(
        "♡",
        "Pas encore de favoris",
        "Appuie sur ♡ pour ajouter des musiques à J’aime."
      );
}

function renderDisliked() {
  const container = $("#dislikedGrid");

  if (!container) return;

  const dislikedSongs = getSongs(state.disliked);

  container.innerHTML = dislikedSongs.length
    ? dislikedSongs.map(songCard).join("")
    : emptyState(
        "👎",
        "Aucune musique ici",
        "Les morceaux que tu n’aimes pas apparaîtront ici."
      );
}

function renderPlaylist() {
  const container = $("#playlistList");

  if (!container) return;

  const playlistSongs = getSongs(state.playlist);

  container.innerHTML = playlistSongs.length
    ? playlistSongs.map(playlistRow).join("")
    : emptyState(
        "+",
        "Ta playlist est vide",
        "Ajoute des morceaux avec le bouton +."
      );
}

function renderSearch() {
  const container = $("#searchGrid");
  const description = $("#searchDescription");

  if (!container) return;

  if (!searchResults.length) {
    container.innerHTML = emptyState(
      "⌕",
      "Aucun résultat",
      "Essaie avec « musique 01 », « musique 02 » ou un identifiant YouTube."
    );
    return;
  }

  if (description) {
    description.textContent =
      `${searchResults.length} résultat${searchResults.length > 1 ? "s" : ""}`;
  }

  container.innerHTML = searchResults
    .map(songCard)
    .join("");
}

function updateCounts() {
  $("#likedCount").textContent = state.liked.length;
  $("#dislikedCount").textContent = state.disliked.length;
  $("#playlistCount").textContent = state.playlist.length;
}

function renderCurrentPage() {
  renderHome();
  renderRecommendations();
  renderLiked();
  renderDisliked();
  renderPlaylist();
  renderSearch();
  updateCounts();
  updatePlayerUI();
}


/* =========================================================
   ACTIONS MUSIQUE
========================================================= */

function toggleLike(id) {
  const likedIndex = state.liked.indexOf(id);

  if (likedIndex >= 0) {
    state.liked.splice(likedIndex, 1);
    showToast("Retiré de J’aime");
  } else {
    state.liked.push(id);

    state.disliked = state.disliked.filter(
      songId => songId !== id
    );

    showToast("Ajouté à J’aime");
  }

  saveState();
  renderCurrentPage();
}

function toggleDislike(id) {
  const dislikedIndex = state.disliked.indexOf(id);

  if (dislikedIndex >= 0) {
    state.disliked.splice(dislikedIndex, 1);
    showToast("Retiré de Pas aimé");
  } else {
    state.disliked.push(id);

    state.liked = state.liked.filter(
      songId => songId !== id
    );

    showToast("Ajouté à Pas aimé");
  }

  saveState();
  renderCurrentPage();
}

function togglePlaylist(id) {
  const index = state.playlist.indexOf(id);

  if (index >= 0) {
    state.playlist.splice(index, 1);
    showToast("Retiré de ta playlist");
  } else {
    state.playlist.push(id);
    showToast("Ajouté à ta playlist");
  }

  saveState();
  renderCurrentPage();
}


/* =========================================================
   QUEUE
========================================================= */

function setQueue(ids, startId = null) {
  let queue = unique(ids).filter(
    id => SONGS.includes(id)
  );

  if (!queue.length) {
    queue = [...SONGS];
  }

  state.queue = state.shuffle
    ? shuffleArray(queue)
    : queue;

  if (startId && state.queue.includes(startId)) {
    state.queueIndex = state.queue.indexOf(startId);
  } else {
    state.queueIndex = -1;
  }

  saveState();
}

function playAll(ids) {
  let queue = unique(ids).filter(
    id => SONGS.includes(id)
  );

  if (!queue.length) {
    showToast("Aucune musique à lire");
    return;
  }

  if (state.shuffle) {
    queue = shuffleArray(queue);
  }

  state.queue = queue;
  state.queueIndex = 0;

  playSong(queue[0], false);
}

function playSong(id, rebuildQueue = true) {
  const song = getSong(id);

  if (!song) return;

  if (rebuildQueue) {
    const queue = state.queue.length
      ? state.queue
      : [...SONGS];

    setQueue(queue, id);
  }

  const index = state.queue.indexOf(id);

  if (index >= 0) {
    state.queueIndex = index;
  }

  state.currentId = id;

  state.history = [
    id,
    ...state.history.filter(
      historyId => historyId !== id
    )
  ].slice(0, 20);

  saveState();

  updatePlayerUI();

  if (!playerReady || !player) {
    showToast("Le lecteur YouTube se prépare…");
    return;
  }

  player.loadVideoById(id);
  player.setVolume(state.volume);
  player.playVideo();

  startProgressTimer();
}

function playNext() {
  if (!state.queue.length) {
    setQueue([...SONGS]);
  }

  if (state.repeat && state.currentId) {
    playSong(state.currentId, false);
    return;
  }

  let nextIndex = state.queueIndex + 1;

  if (nextIndex >= state.queue.length) {

    if (state.infinite) {
      let newQueue = [...SONGS];

      if (state.shuffle) {
        newQueue = shuffleArray(newQueue);
      }

      state.queue = newQueue;
      nextIndex = 0;
    } else {
      showToast("Fin de la playlist");
      return;
    }
  }

  state.queueIndex = nextIndex;

  playSong(
    state.queue[nextIndex],
    false
  );
}

function playPrevious() {
  if (!state.currentId || !state.queue.length) {
    return;
  }

  if (
    player &&
    playerReady &&
    typeof player.getCurrentTime === "function" &&
    player.getCurrentTime() > 3
  ) {
    player.seekTo(0);
    return;
  }

  let previousIndex = state.queueIndex - 1;

  if (previousIndex < 0) {
    previousIndex = state.queue.length - 1;
  }

  state.queueIndex = previousIndex;

  playSong(
    state.queue[previousIndex],
    false
  );
}


/* =========================================================
   PLAYER UI
========================================================= */

function updatePlayerUI() {
  const song = getSong(state.currentId);

  const title = $("#playerTitle");
  const artist = $("#playerArtist");
  const cover = $("#playerCover");
  const likeButton = $("#playerLike");

  if (!song) {
    title.textContent = "Aucune musique";
    artist.textContent = "Sélectionne une musique";
    likeButton.textContent = "♡";
    likeButton.classList.remove("active");
    return;
  }

  title.textContent = song.title;
  artist.textContent = song.artist;
  cover.src = song.cover;

  const liked = state.liked.includes(song.id);

  likeButton.textContent = liked ? "♥" : "♡";
  likeButton.classList.toggle("active", liked);

  $("#shuffleButton").classList.toggle(
    "active",
    state.shuffle
  );

  $("#repeatButton").classList.toggle(
    "active",
    state.repeat
  );

  $("#infiniteButton").classList.toggle(
    "active",
    state.infinite
  );

  $("#volumeBar").value = state.volume;
}

function togglePlayPause() {
  if (!playerReady || !player) {
    showToast("Le lecteur YouTube se prépare…");
    return;
  }

  if (!state.currentId) {
    playAll(SONGS);
    return;
  }

  const playerState = player.getPlayerState();

  if (
    playerState === YT.PlayerState.PLAYING
  ) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function updatePlayButton(isPlaying) {
  $("#playPauseButton").textContent =
    isPlaying ? "Ⅱ" : "▶";
}


/* =========================================================
   PROGRESSION
========================================================= */

function updateProgress() {
  if (!playerReady || !player) return;

  try {
    const current = player.getCurrentTime();
    const duration = player.getDuration();

    if (!duration) return;

    $("#currentTime").textContent =
      formatTime(current);

    $("#duration").textContent =
      formatTime(duration);

    $("#progressBar").value =
      (current / duration) * 100;

  } catch {
    // Le lecteur peut ne pas être encore initialisé.
  }
}

function startProgressTimer() {
  clearInterval(progressTimer);

  progressTimer = setInterval(
    updateProgress,
    500
  );
}

function seekProgress(value) {
  if (!playerReady || !player) return;

  const duration = player.getDuration();

  if (!duration) return;

  player.seekTo(
    (Number(value) / 100) * duration,
    true
  );
}


/* =========================================================
   OPTIONS PLAYER
========================================================= */

function toggleShuffle() {
  state.shuffle = !state.shuffle;

  if (state.shuffle && state.queue.length > 1) {
    const current = state.currentId;

    let queue = shuffleArray(state.queue);

    if (current) {
      queue = [
        current,
        ...queue.filter(id => id !== current)
      ];
    }

    state.queue = queue;
    state.queueIndex = current
      ? 0
      : -1;
  }

  saveState();
  updatePlayerUI();

  showToast(
    state.shuffle
      ? "Lecture aléatoire activée"
      : "Lecture aléatoire désactivée"
  );
}

function toggleRepeat() {
  state.repeat = !state.repeat;

  saveState();
  updatePlayerUI();

  showToast(
    state.repeat
      ? "Répétition activée"
      : "Répétition désactivée"
  );
}

function toggleInfinite() {
  state.infinite = !state.infinite;

  saveState();
  updatePlayerUI();

  showToast(
    state.infinite
      ? "Mode infini activé"
      : "Mode infini désactivé"
  );
}


/* =========================================================
   YOUTUBE API
========================================================= */

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("youtubePlayer", {

    height: "1",
    width: "1",

    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      rel: 0,
      playsinline: 1
    },

    events: {

      onReady: event => {
        playerReady = true;

        event.target.setVolume(
          state.volume
        );

        updatePlayerUI();
      },

      onStateChange: event => {

        if (
          event.data === YT.PlayerState.PLAYING
        ) {
          updatePlayButton(true);
          startProgressTimer();
        }

        if (
          event.data === YT.PlayerState.PAUSED
        ) {
          updatePlayButton(false);
        }

        if (
          event.data === YT.PlayerState.ENDED
        ) {
          updatePlayButton(false);
          playNext();
        }
      },

      onError: () => {
        updatePlayButton(false);
        showToast(
          "Cette vidéo YouTube ne peut pas être lue."
        );
      }

    }

  });
};


/* =========================================================
   RECHERCHE
========================================================= */

function searchSongs(query) {
  const value = query
    .trim()
    .toLowerCase();

  if
