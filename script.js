"use strict";

/* =========================================================
   WAVEIFY
   Lecteur YouTube + playlists + historique + localStorage
   ========================================================= */

const YOUTUBE_LINKS = [
  "https://www.youtube.com/watch?v=Pl1d5YSEg2w",
  "https://www.youtube.com/watch?v=y1T2LQ2bym4",
  "https://www.youtube.com/watch?v=SX0u0s5h4as",
  "https://www.youtube.com/watch?v=mdcBqqWj3kY",
  "https://www.youtube.com/watch?v=n2THLWjJ3Wo",
  "https://www.youtube.com/watch?v=Snhn9wB-z1w",
  "https://www.youtube.com/watch?v=xlmyDTa_S6M",
  "https://www.youtube.com/watch?v=rDrIRNUaE6s",
  "https://www.youtube.com/watch?v=EXYj9wecau4",
  "https://www.youtube.com/watch?v=ShR_fQrqsdA",
  "https://www.youtube.com/watch?v=pN-TLYBDkWc",
  "https://www.youtube.com/watch?v=00ff2UcGLu0",
  "https://www.youtube.com/watch?v=c8qXCL-ElfA",
  "https://www.youtube.com/watch?v=pEBFJI-g9AA",
  "https://www.youtube.com/watch?v=63fJnwefxBk",
  "https://www.youtube.com/watch?v=gZXijVptbic",
  "https://www.youtube.com/watch?v=QzZflH4liuU",
  "https://www.youtube.com/watch?v=MFHiEocxkdM",
  "https://www.youtube.com/watch?v=2uM9ZIS-v0w",
  "https://www.youtube.com/watch?v=Qq7Q6CLCfvs",
  "https://www.youtube.com/watch?v=cYi1jI7uLa0",
  "https://www.youtube.com/watch?v=MqiljVyq_1o",
  "https://www.youtube.com/watch?v=KTYp4guSwLg",
  "https://www.youtube.com/watch?v=vaeio3idHzU",
  "https://www.youtube.com/watch?v=FaXqep3IsZw",
  "https://www.youtube.com/watch?v=VIs9zdNq_IU",
  "https://www.youtube.com/watch?v=JwVm-DHKH_U",
  "https://www.youtube.com/watch?v=zNEU9VExoWE",
  "https://www.youtube.com/watch?v=WudXzTex5JQ",
  "https://www.youtube.com/watch?v=pxjsZK_fkO4",
  "https://www.youtube.com/watch?v=dIJuNqS9c3w",
  "https://www.youtube.com/watch?v=BJwovrr6XzI",
  "https://www.youtube.com/watch?v=yx9WQ0hrsdk",
  "https://www.youtube.com/watch?v=0uLp-tejcSo",
  "https://www.youtube.com/watch?v=w4CI96-D2Zg",
  "https://www.youtube.com/watch?v=HqJ1qP05Si0"
];

/* ---------------------------------------------------------
   DONNÉES
--------------------------------------------------------- */

function extractYoutubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").trim();
    }

    return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

function createTracks() {
  return YOUTUBE_LINKS
    .map((url, index) => {
      const id = extractYoutubeId(url);

      if (!id) return null;

      return {
        id,
        index,
        title: `Wave ${String(index + 1).padStart(2, "0")}`,
        artist: "Waveify",
        url,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      };
    })
    .filter(Boolean);
}

const tracks = createTracks();

/* ---------------------------------------------------------
   STOCKAGE
--------------------------------------------------------- */

const STORAGE_KEY = "waveify-data-v1";

const defaultState = {
  liked: [],
  disliked: [],
  playlist: [],
  history: [],
  volume: 80,
  shuffle: false,
  repeat: false,
  infinite: false,
  currentTrackId: null
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { ...defaultState };
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultState,
      ...parsed
    };
  } catch {
    return { ...defaultState };
  }
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage peut être indisponible dans certains contextes.
  }
}

/* ---------------------------------------------------------
   ÉLÉMENTS
--------------------------------------------------------- */

const els = {
  sidebar: document.getElementById("sidebar"),
  mobileMenu: document.getElementById("mobileMenu"),
  searchInput: document.getElementById("searchInput"),

  sections: document.querySelectorAll(".section"),
  navItems: document.querySelectorAll(".nav-item"),

  homeTracks: document.getElementById("homeTracks"),
  recommendationTracks: document.getElementById("recommendationTracks"),
  likedTracks: document.getElementById("likedTracks"),
  dislikedTracks: document.getElementById("dislikedTracks"),
  playlistTracks: document.getElementById("playlistTracks"),
  historyTracks: document.getElementById("historyTracks"),
  searchTracks: document.getElementById("searchTracks"),

  trackCount: document.getElementById("trackCount"),
  searchInfo: document.getElementById("searchInfo"),

  playAllBtn: document.getElementById("playAllBtn"),

  playerCover: document.getElementById("playerCover"),
  playerTitle: document.getElementById("playerTitle"),
  playerArtist: document.getElementById("playerArtist"),
  playerLike: document.getElementById("playerLike"),

  shuffleBtn: document.getElementById("shuffleBtn"),
  previousBtn: document.getElementById("previousBtn"),
  playBtn: document.getElementById("playBtn"),
  nextBtn: document.getElementById("nextBtn"),
  repeatBtn: document.getElementById("repeatBtn"),
  infiniteBtn: document.getElementById("infiniteBtn"),

  currentTime: document.getElementById("currentTime"),
  duration: document.getElementById("duration"),
  progressBar: document.getElementById("progressBar"),
  volumeBar: document.getElementById("volumeBar"),

  toast: document.getElementById("toast")
};

/* ---------------------------------------------------------
   LECTEUR YOUTUBE
--------------------------------------------------------- */

let player = null;
let playerReady = false;
let currentTrackIndex = -1;
let progressTimer = null;

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("youtubePlayer", {
    width: "1",
    height: "1",
    videoId: "",
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
};

function onPlayerReady() {
  playerReady = true;

  player.setVolume(Number(state.volume) || 80);
  els.volumeBar.value = Number(state.volume) || 80;

  if (state.currentTrackId) {
    const index = tracks.findIndex(t => t.id === state.currentTrackId);

    if (index !== -1) {
      currentTrackIndex = index;
      updatePlayerUI(tracks[index]);
    }
  }
}

function onPlayerStateChange(event) {
  if (!window.YT) return;

  if (event.data === YT.PlayerState.PLAYING) {
    els.playBtn.textContent = "Ⅱ";
    startProgressTimer();
  }

  if (event.data === YT.PlayerState.PAUSED) {
    els.playBtn.textContent = "▶";
    stopProgressTimer();
  }

  if (event.data === YT.PlayerState.ENDED) {
    stopProgressTimer();
    handleTrackEnded();
  }
}

function onPlayerError() {
  showToast("Impossible de lire ce morceau.");

  setTimeout(() => {
    nextTrack();
  }, 800);
}

/* ---------------------------------------------------------
   LECTURE
--------------------------------------------------------- */

function playTrack(index, autoplay = true) {
  if (!tracks.length) return;

  if (index < 0) index = tracks.length - 1;
  if (index >= tracks.length) index = 0;

  currentTrackIndex = index;

  const track = tracks[index];

  state.currentTrackId = track.id;

  addToHistory(track.id);
  saveState();

  updatePlayerUI(track);

  if (!playerReady || !player) {
    showToast("Le lecteur YouTube est encore en chargement.");
    return;
  }

  try {
    player.loadVideoById(track.id);

    if (!autoplay) {
      player.pauseVideo();
    }
  } catch {
    showToast("Erreur du lecteur.");
  }
}

function togglePlay() {
  if (!playerReady || !player) {
    showToast("Le lecteur YouTube est encore en chargement.");
    return;
  }

  if (currentTrackIndex === -1) {
    playTrack(0);
    return;
  }

  const statePlayer = player.getPlayerState();

  if (statePlayer === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function previousTrack() {
  if (!tracks.length) return;

  if (currentTrackIndex === -1) {
    playTrack(0);
    return;
  }

  if (state.shuffle) {
    playTrack(getRandomIndex());
    return;
  }

  playTrack(
    (currentTrackIndex - 1 + tracks.length) % tracks.length
  );
}

function nextTrack() {
  if (!tracks.length) return;

  if (state.shuffle) {
    playTrack(getRandomIndex());
    return;
  }

  if (currentTrackIndex === -1) {
    playTrack(0);
    return;
  }

  const next = currentTrackIndex + 1;

  if (next >= tracks.length) {
    if (state.infinite) {
      playTrack(0);
    } else {
      stopPlayback();
    }
    return;
  }

  playTrack(next);
}

function stopPlayback() {
  if (playerReady && player) {
    player.stopVideo();
  }

  els.playBtn.textContent = "▶";
  stopProgressTimer();
}

function handleTrackEnded() {
  if (state.repeat && currentTrackIndex !== -1) {
    playTrack(currentTrackIndex);
    return;
  }

  nextTrack();
}

function getRandomIndex() {
  if (tracks.length <= 1) return 0;

  let index;

  do {
    index = Math.floor(Math.random() * tracks.length);
  } while (index === currentTrackIndex);

  return index;
}

/* ---------------------------------------------------------
   UI LECTEUR
--------------------------------------------------------- */

function updatePlayerUI(track) {
  els.playerTitle.textContent = track.title;
  els.playerArtist.textContent = track.artist;

  els.playerCover.style.backgroundImage =
    `url("${track.thumbnail}")`;

  els.playerCover.style.backgroundSize = "cover";
  els.playerCover.style.backgroundPosition = "center";
  els.playerCover.textContent = "";

  updatePlayerLike();
}

function updatePlayerLike() {
  if (!state.currentTrackId) {
    els.playerLike.textContent = "♡";
    return;
  }

  const liked = state.liked.includes(state.currentTrackId);

  els.playerLike.textContent = liked ? "♥" : "♡";
  els.playerLike.classList.toggle("active", liked);
}

/* ---------------------------------------------------------
   PROGRESSION
--------------------------------------------------------- */

function startProgressTimer() {
  stopProgressTimer();

  progressTimer = setInterval(updateProgress, 500);
}

function stopProgressTimer() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function updateProgress() {
  if (!playerReady || !player || currentTrackIndex === -1) return;

  try {
    const current = player.getCurrentTime() || 0;
    const duration = player.getDuration() || 0;

    if (duration > 0) {
      els.progressBar.value = (current / duration) * 100;
    }

    els.currentTime.textContent = formatTime(current);
    els.duration.textContent = formatTime(duration);
  } catch {
    // Rien à faire.
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, "0");

  return `${minutes}:${secs}`;
}

/* ---------------------------------------------------------
   LIKE / DISLIKE / PLAYLIST
--------------------------------------------------------- */

function toggleArrayItem(array, id) {
  const index = array.indexOf(id);

  if (index === -1) {
    array.push(id);
    return true;
  }

  array.splice(index, 1);
  return false;
}

function toggleLike(id) {
  const liked = toggleArrayItem(state.liked, id);

  if (liked) {
    state.disliked = state.disliked.filter(item => item !== id);
    showToast("Ajouté aux J'aime ♥");
  } else {
    showToast("Retiré des J'aime");
  }

  saveState();
  renderAll();
  updatePlayerLike();
}

function toggleDislike(id) {
  const disliked = toggleArrayItem(state.disliked, id);

  if (disliked) {
    state.liked = state.liked.filter(item => item !== id);
    showToast("Ajouté à Pas aimé");
  } else {
    showToast("Retiré de Pas aimé");
  }

  saveState();
  renderAll();
  updatePlayerLike();
}

function togglePlaylist(id) {
  const added = toggleArrayItem(state.playlist, id);

  saveState();
  renderAll();

  showToast(
    added
      ? "Ajouté à ta playlist +"
      : "Retiré de ta playlist"
  );
}

/* ---------------------------------------------------------
   HISTORIQUE
--------------------------------------------------------- */

function addToHistory(id) {
  state.history = state.history.filter(item => item !== id);
  state.history.unshift(id);

  // On garde les 50 derniers morceaux.
  state.history = state.history.slice(0, 50);

  saveState();
}

/* ---------------------------------------------------------
   CARTES
--------------------------------------------------------- */

function getTrack(id) {
  return tracks.find(track => track.id === id);
}

function renderTrackGrid(container, trackList, emptyTitle, emptyText) {
  container.innerHTML = "";

  if (!trackList.length) {
    container.innerHTML = `
      <div class="empty">
        <strong>${escapeHTML(emptyTitle)}</strong>
        <span>${escapeHTML(emptyText)}</span>
      </div>
    `;
    return;
  }

  trackList.forEach(track => {
    container.appendChild(createTrackCard(track));
  });
}

function createTrackCard(track) {
  const card = document.createElement("article");
  card.className = "track-card";

  const liked = state.liked.includes(track.id);
  const disliked = state.disliked.includes(track.id);
  const inPlaylist = state.playlist.includes(track.id);

  card.innerHTML = `
    <div class="cover-wrap">
      <img
        class="cover"
        src="${escapeAttribute(track.thumbnail)}"
        alt=""
        loading="lazy"
        onerror="this.style.display='none'; this.parentElement.classList.add('fallback')"
      >

      <div class="play-overlay">▶</div>
    </div>

    <div class="track-title">${escapeHTML(track.title)}</div>
    <div class="track-artist">${escapeHTML(track.artist)}</div>

    <div class="card-actions">
      <button
        class="card-action like-action ${liked ? "active" : ""}"
        title="J'aime"
      >${liked ? "♥" : "♡"}</button>

      <button
        class="card-action playlist-action ${inPlaylist ? "active" : ""}"
        title="Ma playlist"
      >${inPlaylist ? "✓" : "+"}</button>
    </div>
  `;

  card.addEventListener("click", event => {
    if (event.target.closest(".card-action")) return;

    playTrack(track.index);
  });

  card.querySelector(".like-action").addEventListener("click", event => {
    event.stopPropagation();
    toggleLike(track.id);
  });

  card.querySelector(".playlist-action").addEventListener("click", event => {
    event.stopPropagation();
    togglePlaylist(track.id);
  });

  return card;
}

/* ---------------------------------------------------------
   RENDU DES SECTIONS
--------------------------------------------------------- */

function renderAll() {
  renderHome();
  renderRecommendations();
  renderLiked();
  renderDisliked();
  renderPlaylist();
  renderHistory();

  if (els.searchInput.value.trim()) {
    renderSearch(els.searchInput.value);
  }
}

function renderHome() {
  renderTrackGrid(
    els.homeTracks,
    tracks,
    "Aucun morceau",
    "Aucun morceau n'est disponible."
  );

  els.trackCount.textContent =
    `${tracks.length} morceaux`;
}

function renderRecommendations() {
  let recommendations = [];

  // Priorité aux morceaux aimés, puis aux morceaux non encore écoutés.
  const likedTracks = state.liked
    .map(getTrack)
    .filter(Boolean);

  const notHeard = tracks.filter(
    track => !state.history.includes(track.id)
  );

  recommendations = [
    ...likedTracks,
    ...notHeard
  ];

  const unique = [];
  const ids = new Set();

  recommendations.forEach(track => {
    if (!ids.has(track.id)) {
      ids.add(track.id);
      unique.push(track);
    }
  });

  renderTrackGrid(
    els.recommendationTracks,
    unique.slice(0, 12),
    "Pas encore de recommandations",
    "Écoute quelques morceaux pour personnaliser tes recommandations."
  );
}

function renderLiked() {
  const list = state.liked
    .map(getTrack)
    .filter(Boolean);

  renderTrackGrid(
    els.likedTracks,
    list,
    "Aucun J'aime",
    "Les morceaux que tu aimes apparaîtront ici."
  );
}

function renderDisliked() {
  const list = state.disliked
    .map(getTrack)
    .filter(Boolean);

  renderTrackGrid(
    els.dislikedTracks,
    list,
    "Aucun morceau",
    "Les morceaux que tu n'aimes pas apparaîtront ici."
  );
}

function renderPlaylist() {
  const list = state.playlist
    .map(getTrack)
    .filter(Boolean);

  renderTrackGrid(
    els.playlistTracks,
    list,
    "Playlist vide",
    "Ajoute des morceaux avec le bouton +."
  );
}

function renderHistory() {
  const list = state.history
    .map(getTrack)
    .filter(Boolean);

  renderTrackGrid(
    els.historyTracks,
    list,
    "Historique vide",
    "Les morceaux que tu écoutes apparaîtront ici."
  );
}

function renderSearch(query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    els.searchTracks.innerHTML = "";
    return;
  }

  const results = tracks.filter(track => {
    return (
      track.title.toLowerCase().includes(normalized) ||
      track.artist.toLowerCase().includes(normalized) ||
      String(track.index + 1).includes(normalized)
    );
  });

  els.searchInfo.textContent =
    `${results.length} résultat${results.length > 1 ? "s" : ""} pour « ${query.trim()} »`;

  renderTrackGrid(
    els.searchTracks,
    results,
    "Aucun résultat",
    "Essaie avec un autre terme de recherche."
  );
}

/* ---------------------------------------------------------
   NAVIGATION
--------------------------------------------------------- */

function showSection(sectionId) {
  els.sections.forEach(section => {
    section.classList.toggle(
      "active",
      section.id === sectionId
    );
  });

  els.navItems.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === sectionId
    );
  });

  els.sidebar.classList.remove("open");

  const content = document.querySelector(".content");

  if (content) {
    content.scrollTop = 0;
  }
}

els.navItems.forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

els.mobileMenu.addEventListener("click", () => {
  els.sidebar.classList.toggle("open");
});

/* ---------------------------------------------------------
   RECHERCHE
--------------------------------------------------------- */

els.searchInput.addEventListener("input", () => {
  const query = els.searchInput.value.trim();

  if (!query) {
    showSection("home");
    return;
  }

  showSection("search");
  renderSearch(query);
});

/* ---------------------------------------------------------
   BOUTONS PLAYER
--------------------------------------------------------- */

els.playBtn.addEventListener("click", togglePlay);
els.previousBtn.addEventListener("click", previousTrack);
els.nextBtn.addEventListener("click", nextTrack);

els.shuffleBtn.addEventListener("click", () => {
  state.shuffle = !state.shuffle;
  els.shuffleBtn.classList.toggle("active", state.shuffle);

  saveState();

  showToast(
    state.shuffle
      ? "Lecture aléatoire activée 🔀"
      : "Lecture aléatoire désactivée"
  );
});

els.repeatBtn.addEventListener("click", () => {
  state.repeat = !state.repeat;
  els.repeatBtn.classList.toggle("active", state.repeat);

  saveState();

  showToast(
    state.repeat
      ? "Répétition activée 🔁"
      : "Répétition désactivée"
  );
});

els.infiniteBtn.addEventListener("click", () => {
  state.infinite = !state.infinite;
  els.infiniteBtn.classList.toggle("active", state.infinite);

  saveState();

  showToast(
    state.infinite
      ? "Mode infini activé ♾"
      : "Mode infini désactivé"
  );
});

els.playerLike.addEventListener("click", () => {
  if (state.currentTrackId) {
    toggleLike(state.currentTrackId);
 
