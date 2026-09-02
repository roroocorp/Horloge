"use strict";

/* =========================
   MUSIQUES YOUTUBE
========================= */

const SONG_IDS = [
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

const SONGS = SONG_IDS.map((id, index) => ({
  id,
  title: `Musique ${String(index + 1).padStart(2, "0")}`,
  artist: "YouTube",
  cover: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}));


/* =========================
   SAUVEGARDE
========================= */

const STORAGE_KEY = "waveify-final-v1";

const defaultState = {
  liked: [],
  disliked: [],
  playlist: [],
  history: [],

  currentId: null,

  queue: [],
  queueIndex: -1,

  infinite: false,
  shuffle: false,
  repeat: false,

  volume: 80
};

let state = loadState();

let currentRoute = getRoute();
let searchTerm = "";

let player = null;
let apiReady = false;

let toastTimer = null;


/* =========================
   OUTILS
========================= */

const $ = selector => document.querySelector(selector);

const $$ = selector => [
  ...document.querySelectorAll(selector)
];


function loadState() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

    if (!saved || typeof saved !== "object") {
      return { ...defaultState };
    }

    return {
      ...defaultState,
      ...saved,

      liked: Array.isArray(saved.liked)
        ? saved.liked
        : [],

      disliked: Array.isArray(saved.disliked)
        ? saved.disliked
        : [],

      playlist: Array.isArray(saved.playlist)
        ? saved.playlist
        : [],

      history: Array.isArray(saved.history)
        ? saved.history
        : [],

      queue: Array.isArray(saved.queue)
        ? saved.queue
        : []
    };

  } catch {

    return { ...defaultState };

  }
}


function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

  updateCounts();
}


function getRoute() {

  const route =
    location.hash
      .replace("#/", "")
      .replace("#", "")
      .trim();

  const valid = [
    "home",
    "recommendations",
    "liked",
    "disliked",
    "playlist",
    "search"
  ];

  return valid.includes(route)
    ? route
    : "home";
}


function navigate(route) {

  if (
    route === "search" &&
    !searchTerm.trim()
  ) {
    route = "home";
  }

  location.hash = `/${route}`;
}


function songById(id) {

  return SONGS.find(
    song => song.id === id
  );
}


function uniqueSongs(ids) {

  return [
    ...new Set(ids)
  ]
    .map(songById)
    .filter(Boolean);
}


function isLiked(id) {
  return state.liked.includes(id);
}


function isDisliked(id) {
  return state.disliked.includes(id);
}


function isInPlaylist(id) {
  return state.playlist.includes(id);
}


function escapeHTML(value) {

  return String(value).replace(
    /[&<>'"]/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]
  );
}


function formatTime(seconds) {

  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return "0:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

  return `${minutes}:${secs}`;
}


function showToast(message) {

  const toast = $("#toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 1800);
}


function updateCounts() {

  $("#likedCount").textContent =
    state.liked.length;

  $("#dislikedCount").textContent =
    state.disliked.length;

  $("#playlistCount").textContent =
    state.playlist.length;
}


/* =========================
   CARTES
========================= */

function songCard(song) {

  const liked =
    isLiked(song.id);

  const disliked =
    isDisliked(song.id);

  const added =
    isInPlaylist(song.id);

  return `
    <article class="song-card">

      <div class="cover-wrap">

        <img
          class="cover"
          src="${song.cover}"
          alt="${escapeHTML(song.title)}"
          loading="lazy">

        <button
          class="cover-play"
          data-action="play"
          data-id="${song.id}">
          ▶
        </button>

      </div>

      <div
        class="song-title"
        title="${escapeHTML(song.title)}">
        ${escapeHTML(song.title)}
      </div>

      <div class="song-meta">
        ${escapeHTML(song.artist)}
      </div>

      <div class="card-actions">

        <button
          class="card-btn ${liked ? "active-like" : ""}"
          data-action="like"
          data-id="${song.id}">
          ${liked ? "♥" : "♡"}
        </button>

        <button
          class="card-btn ${disliked ? "active-dislike" : ""}"
          data-action="dislike"
          data-id="${song.id}">
          ${disliked ? "♥̸" : "♧"}
        </button>

        <button
          class="card-btn"
          data-action="playlist"
          data-id="${song.id}">
          ${added ? "✓" : "+"}
        </button>

      </div>

    </article>
  `;
}


function songList(songs) {

  if (!songs.length) {

    return `
      <div class="empty">
        <strong>Aucune musique ici</strong>
        <span>
          Ajoute des titres avec les boutons
          ♥, 👎 ou +.
        </span>
      </div>
    `;
  }

  return `
    <div class="list">

      ${songs.map((song, index) => `

        <div class="list-row">

          <span class="list-number">
            ${index + 1}
          </span>

          <img
            class="list-cover"
            src="${song.cover}"
            alt=""
            loading="lazy">

          <div class="list-info">

            <strong>
              ${escapeHTML(song.title)}
            </strong>

            <span>
              ${escapeHTML(song.artist)}
            </span>

          </div>

          <div class="list-actions">

            <button
              data-action="play"
              data-id="${song.id}">
              ▶
            </button>

            <button
              data-action="like"
              data-id="${song.id}">
              ${isLiked(song.id) ? "♥" : "♡"}
            </button>

            <button
              data-action="playlist"
              data-id="${song.id}">
              ${isInPlaylist(song.id) ? "✓" : "+"}
            </button>

          </div>

        </div>

      `).join("")}

    </div>
  `;
}


function section(
  title,
  subtitle,
  songs,
  allRoute = null
) {

  return `
    <div class="section-head">

      <div>

        <h2>
          ${escapeHTML(title)}
        </h2>

        ${
          subtitle
            ? `<p>${escapeHTML(subtitle)}</p>`
            : ""
        }

      </div>

      ${
        allRoute
          ? `
            <button data-route="${allRoute}">
              Voir tout →
            </button>
          `
          : ""
      }

    </div>

    <div class="song-grid">

      ${
        songs.length
          ? songs.map(songCard).join("")
          : `
            <div
              class="empty"
              style="grid-column:1/-1">

              <strong>
                Aucune musique
              </strong>

              <span>
                Rien à afficher pour le moment.
              </span>

            </div>
          `
      }

    </div>
  `;
}


/* =========================
   RECOMMANDATIONS
========================= */

function getRecommendations(limit = 12) {

  const liked =
    uniqueSongs(state.liked);

  const available =
    SONGS.filter(
      song => !isDisliked(song.id)
    );

  const unseen =
    available.filter(
      song => !state.history.includes(song.id)
    );

  const pool = [
    ...liked,
    ...unseen,
    ...available
  ];

  const result = [];

  for (const song of pool) {

    if (
      song &&
      !result.some(
        item => item.id === song.id
      )
    ) {
      result.push(song);
    }

  }

  return result.slice(0, limit);
}


/* =========================
   RENDU DES PAGES
========================= */

function renderHome() {

  const recent =
    uniqueSongs(
      state.history
        .slice()
        .reverse()
    ).slice(0, 8);

  const recommended =
    getRecommendations(12);

  $("#pageHome").innerHTML = `

    <div class="hero">

      <div class="eyebrow">
        TA MUSIQUE, TON ESPACE
      </div>

      <h1>
        Bienvenue sur Waveify.
      </h1>

      <p>
        Écoute tes morceaux YouTube,
        crée ta playlist et laisse le
        mode infini choisir la suite.
      </p>

      <div class="hero-actions">

        <button
          class="primary"
          data-action="play-all"
          data-source="all">
          ▶ Tout lire
        </button>

        <button
          class="secondary"
          data-route="recommendations">
          ✦ Découvrir
        </button>

      </div>

    </div>

    ${
      recent.length
        ? section(
            "Reprendre l’écoute",
            "Tes derniers morceaux",
            recent
          )
        : ""
    }

    ${section(
      "Pour toi",
      "Une sélection de tes morceaux",
      recommended,
      "recommendations"
    )}

  `;
}


function renderRecommendations() {

  $("#pageRecommendations").innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          Recommandations
        </h2>

        <p>
          Des morceaux à lancer maintenant.
        </p>

      </div>

      <button
        data-action="play-all"
        data-source="recommendations">
        ▶ Tout lire
      </button>

    </div>

    <div class="song-grid">

      ${getRecommendations(36)
        .map(songCard)
        .join("")}

    </div>

  `;
}


function renderCollection(
  route,
  title,
  subtitle,
  ids
) {

  const songs =
    uniqueSongs(ids);

  const page =
    $(`#page${
      route.charAt(0).toUpperCase()
      + route.slice(1)
    }`);

  page.innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          ${escapeHTML(title)}
        </h2>

        <p>
          ${escapeHTML(subtitle)}
        </p>

      </div>

      ${
        songs.length
          ? `
            <button
              data-action="play-all"
              data-source="${route}">
              ▶ Tout lire
            </button>
          `
          : ""
      }

    </div>

    ${songList(songs)}

  `;
}


function renderSearch() {

  const query =
    searchTerm
      .trim()
      .toLowerCase();

  const songs =
    query
      ? SONGS.filter(song =>
          `${song.title} ${song.artist}`
            .toLowerCase()
            .includes(query)
        )
      : [];

  $("#pageSearch").innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          Résultats
        </h2>

        <p>

          ${
            query
              ? `${songs.length} résultat${
                  songs.length > 1 ? "s" : ""
                } pour « ${escapeHTML(searchTerm)} »`
              : "Tape quelque chose dans la recherche."
          }

        </p>

      </div>

      ${
        songs.length
          ? `
            <button
              data-action="play-all"
              data-source="search">
              ▶ Tout lire
            </button>
          `
          : ""
      }

    </div>

    ${songList(songs)}

  `;
}


function render() {

  currentRoute =
    getRoute();

  const pages = {

    home: "pageHome",

    recommendations:
      "pageRecommendations",

    liked:
      "pageLiked",

    disliked:
      "pageDisliked",

    playlist:
      "pagePlaylist",

    search:
      "pageSearch"

  };


  Object.entries(pages)
    .forEach(
      ([route, id]) => {

        $("#" + id)
          .classList
          .toggle(
            "active-page",
            route === currentRoute
          );

      }
    );


  $$(".nav-link[data-route]")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.route === currentRoute
      );

    });


  renderHome();

  renderRecommendations();

  renderCollection(
    "liked",
    "J’aime",
    "Les morceaux que tu as aimés.",
    state.liked
  );

  renderCollection(
    "disliked",
    "Pas aimé",
    "Tu peux les remettre en favoris quand tu veux.",
    state.disliked
  );

  renderCollection(
    "playlist",
    "Ma playlist",
    "Tous les morceaux que tu as ajoutés.",
    state.playlist
  );

  renderSearch();

  updateCounts();

  updatePlayerUI();
}


/* =========================
   PLAYLIST / FILE
========================= */

function getCurrentPageSongs() {

  if (currentRoute === "liked") {
    return uniqueSongs(state.liked);
  }

  if (currentRoute === "disliked") {
    return uniqueSongs(state.disliked);
  }

  if (currentRoute === "playlist") {
    return uniqueSongs(state.playlist);
  }

  if (currentRoute === "recommendations") {
    return getRecommendations(36);
  }

  if (currentRoute === "search") {

    const q =
      searchTerm
        .trim()
        .toLowerCase();

    return q
      ? SONGS.filter(song =>
          `${song.title} ${song.artist}`
            .toLowerCase()
            .includes(q)
        )
      : [];
  }

  return SONGS;
}


function setQueue(
  songs,
  startIndex = 0
) {

  state.queue =
    songs.map(song => song.id);

  state.queueIndex =
    Math.max(
      0,
      Math.min(
        startIndex,
        state.queue.length - 1
      )
    );
}


/* =========================
   J'AIME / PAS AIMÉ / +
========================= */

function toggleLike(id) {

  const alreadyLiked =
    isLiked(id);

  if (alreadyLiked) {

    state.liked =
      state.liked.filter(
        item => item !== id
      );

  } else {

    state.liked = [
      ...state.liked,
      id
    ];

  }

  state.disliked =
    state.disliked.filter(
      item => item !== id
    );

  saveState();

  render();

  showToast(
    alreadyLiked
      ? "Retiré de J’aime"
      : "Ajouté à J’aime"
  );
}


function toggleDislike(id) {

  const alreadyDisliked =
    isDisliked(id);

  if (alreadyDisliked) {

    state.disliked =
      state.disliked.filter(
        item => item !== id
      );

  } else {

    state.disliked = [
      ...state.disliked,
      id
    ];

    state.liked =
      state.liked.filter(
        item => item !== id
      );
  }

  saveState();

  render();

  showToast(
    alreadyDisliked
      ? "Retiré de Pas aimé"
      : "Ajouté à Pas aimé"
  );
}


function togglePlaylist(id) {

  const added =
    isInPlaylist(id);

  if (added) {

    state.playlist =
      state.playlist.filter(
        item => item !== id
      );

  } else {

    state.playlist = [
      ...state.playlist,
      id
    ];

  }

  saveState();

  render();

  showToast(
    added
      ? "Retiré de Ma playlist"
      : "Ajouté à Ma playlist"
  );
}


/* =========================
   LECTEUR
========================= */

function playSong(
  id,
  queueSongs = null
) {

  const song =
    songById(id);

  if (!song) return;


  const songs =
    queueSongs &&
    queueSongs.length
      ? queueSongs
      : SONGS;


  const index =
    Math.max(
      0,
      songs.findIndex(
        item => item.id === id
      )
    );


  setQueue(
    songs,
    index
  );


  state.currentId = id;


  state.history = [
    ...state.history.filter(
      item => item !== id
    ),
    id
  ].slice(-50);


  saveState();

  updatePlayerUI();


  if (!apiReady || !player) {

    showToast(
      "Lecteur YouTube en cours de chargement…"
    );

    return;
  }


  try {

    player.loadVideoById(id);

    player.setVolume(
      Number(state.volume)
    );

    player.playVideo();

  } catch (error) {

    console.error(error);

    showToast(
      "Impossible de lancer cette vidéo."
    );
  }
}


function playAll(songs) {

  if (!songs.length) {

    showToast(
      "Aucune musique à lire ici."
    );

    return;
  }


  let queue =
    songs.slice();


  if (state.shuffle) {

    queue =
      shuffleArray(queue);

  }


  setQueue(queue, 0);

  playSong(
    queue[0].id,
    queue
  );
}


function shuffleArray(items) {

  const array =
    items.slice();

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      array[i],
      array[j]
    ] = [
      array[j],
      array[i]
    ];
  }

  return array;
}


function nextSong() {

  if (!state.queue.length) {

    setQueue(
      SONGS,
      0
    );
  }


  let nextIndex =
    state.queueIndex + 1;


  if (
    nextIndex >=
    state.queue.length
  ) {

    if (
      state.repeat ||
      state.infinite
    ) {

      if (state.infinite) {

        const next =
          SONGS[
            Math.floor(
              Math.random() *
              SONGS.length
            )
          ];

        playSong(
          next.id,
          SONGS
        );

        return;
      }

      nextIndex = 0;

    } else {

      showToast(
        "Fin de la file"
      );

      return;
    }
  }


  const next =
    songById(
      state.queue[nextIndex]
    );


  if (next) {

    playSong(
      next.id,
      uniqueSongs(state.queue)
    );

  }
}


function previousSong() {

  if (!state.queue.length) {
    return;
  }


  let index =
    state.queueIndex - 1;


  if (index < 0) {

    index =
      state.queue.length - 1;

  }


  const previous =
    songById(
      state.queue[index]
    );


  if (previous) {

    playSong(
      previous.id,
      uniqueSongs(state.queue)
    );

  }
}


function togglePlayPause() {

  if (!state.currentId) {

    playAll(SONGS);

    return;
  }


  if (!player || !apiReady) {
    return;
  }


  const status =
    player.getPlayerState();


  if (
    status ===
    YT.PlayerState.PLAYING
  ) {

    player.pauseVideo();

  } else {

    player.playVideo();

  }
}


/* =========================
   INTERFACE LECTEUR
========================= */

function updatePlayerUI() {

  const song =
    state.currentId
      ? songById(state.currentId)
      : null;


  $("#playerTitle").textContent =
    song
      ? song.title
      : "Aucune musique";


  $("#playerSubtitle").textContent =
    song
      ? song.artist
      : "Choisis une musique";


  $("#playerCover").src =
    song
      ? song.cover
      : SONGS[0].cover;


  $("#playerLike").textContent =
    song && isLiked(song.id)
      ? "♥"
      : "♡";


  $("#playerLike")
    .classList
    .toggle(
      "liked",
      Boolean(
        song &&
        isLiked(song.id)
      )
    );


  $("#infiniteBtn")
    .classList
    .toggle(
      "active",
      state.infinite
    );


  $("#shuffleBtn")
    .classList
    .toggle(
      "active",
      state.shuffle
    );


  $("#repeatBtn")
    .classList
    .toggle(
      "active",
      state.repeat
    );


  $("#volumeBar").value =
    state.volume;
}


function updatePlaybackUI() {

  if (!player || !apiReady) {
    return;
  }


  try {

    const current =
      player.getCurrentTime() || 0;

    const duration =
      player.getDuration() || 0;


    $("#currentTime").textContent =
      formatTime(current);


    $("#duration").textContent =
      formatTime(duration);


    $("#progressBar").value =
      duration
        ? (current / duration) * 100
        : 0;


    const status =
      player.getPlayerState();


    $("#playPauseBtn").textContent =
      status =
