/* =====================================================
   WAVEIFY
   Application musicale YouTube
===================================================== */


/* =====================================================
   MUSIQUES
===================================================== */

const SONGS = [
  { id: 1, videoId: "Pl1d5YSEg2w", title: "Musique 01", artist: "À personnaliser" },
  { id: 2, videoId: "y1T2LQ2bym4", title: "Musique 02", artist: "À personnaliser" },
  { id: 3, videoId: "SX0u0s5h4as", title: "Musique 03", artist: "À personnaliser" },
  { id: 4, videoId: "mdcBqqWj3kY", title: "Musique 04", artist: "À personnaliser" },
  { id: 5, videoId: "n2THLWjJ3Wo", title: "Musique 05", artist: "À personnaliser" },
  { id: 6, videoId: "Snhn9wB-z1w", title: "Musique 06", artist: "À personnaliser" },
  { id: 7, videoId: "xlmyDTa_S6M", title: "Musique 07", artist: "À personnaliser" },
  { id: 8, videoId: "rDrIRNUaE6s", title: "Musique 08", artist: "À personnaliser" },
  { id: 9, videoId: "EXYj9wecau4", title: "Musique 09", artist: "À personnaliser" },
  { id: 10, videoId: "ShR_fQrqsdA", title: "Musique 10", artist: "À personnaliser" },
  { id: 11, videoId: "pN-TLYBDkWc", title: "Musique 11", artist: "À personnaliser" },
  { id: 12, videoId: "00ff2UcGLu0", title: "Musique 12", artist: "À personnaliser" },
  { id: 13, videoId: "c8qXCL-ElfA", title: "Musique 13", artist: "À personnaliser" },
  { id: 14, videoId: "pEBFJI-g9AA", title: "Musique 14", artist: "À personnaliser" },
  { id: 15, videoId: "63fJnwefxBk", title: "Musique 15", artist: "À personnaliser" },
  { id: 16, videoId: "gZXijVptbic", title: "Musique 16", artist: "À personnaliser" },
  { id: 17, videoId: "QzZflH4liuU", title: "Musique 17", artist: "À personnaliser" },
  { id: 18, videoId: "MFHiEocxkdM", title: "Musique 18", artist: "À personnaliser" },
  { id: 19, videoId: "2uM9ZIS-v0w", title: "Musique 19", artist: "À personnaliser" },
  { id: 20, videoId: "Qq7Q6CLCfvs", title: "Musique 20", artist: "À personnaliser" },
  { id: 21, videoId: "cYi1jI7uLa0", title: "Musique 21", artist: "À personnaliser" },
  { id: 22, videoId: "MqiljVyq_1o", title: "Musique 22", artist: "À personnaliser" },
  { id: 23, videoId: "KTYp4guSwLg", title: "Musique 23", artist: "À personnaliser" },
  { id: 24, videoId: "vaeio3idHzU", title: "Musique 24", artist: "À personnaliser" },
  { id: 25, videoId: "FaXqep3IsZw", title: "Musique 25", artist: "À personnaliser" },
  { id: 26, videoId: "VIs9zdNq_IU", title: "Musique 26", artist: "À personnaliser" },
  { id: 27, videoId: "JwVm-DHKH_U", title: "Musique 27", artist: "À personnaliser" },
  { id: 28, videoId: "zNEU9VExoWE", title: "Musique 28", artist: "À personnaliser" },
  { id: 29, videoId: "WudXzTex5JQ", title: "Musique 29", artist: "À personnaliser" },
  { id: 30, videoId: "pxjsZK_fkO4", title: "Musique 30", artist: "À personnaliser" },
  { id: 31, videoId: "dIJuNqS9c3w", title: "Musique 31", artist: "À personnaliser" },
  { id: 32, videoId: "BJwovrr6XzI", title: "Musique 32", artist: "À personnaliser" },
  { id: 33, videoId: "yx9WQ0hrsdk", title: "Musique 33", artist: "À personnaliser" },
  { id: 34, videoId: "0uLp-tejcSo", title: "Musique 34", artist: "À personnaliser" },
  { id: 35, videoId: "w4CI96-D2Zg", title: "Musique 35", artist: "À personnaliser" },
  { id: 36, videoId: "HqJ1qP05Si0", title: "Musique 36", artist: "À personnaliser" }
];


/* =====================================================
   SAUVEGARDE
===================================================== */

const STORAGE_KEY = "waveify-final-v1";

const DEFAULT_STATE = {
  liked: [],
  disliked: [],
  playlist: [],
  history: [],

  infinite: false,
  shuffle: false,
  repeat: false,

  volume: 70,
  currentId: null
};

let state = loadState();

function loadState() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

    return {
      ...DEFAULT_STATE,
      ...(saved || {})
    };

  } catch {

    return {
      ...DEFAULT_STATE
    };

  }
}

function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}


/* =====================================================
   VARIABLES
===================================================== */

let currentPage = "home";
let searchTerm = "";

let queue = [];
let queuePosition = 0;

let player = null;
let playerReady = false;

let progressInterval = null;


/* =====================================================
   UTILITAIRES
===================================================== */

function $(selector) {
  return document.querySelector(selector);
}

function getSong(id) {

  return SONGS.find(
    song => song.id === Number(id)
  );

}

function isLiked(id) {

  return state.liked.includes(
    Number(id)
  );

}

function isDisliked(id) {

  return state.disliked.includes(
    Number(id)
  );

}

function isInPlaylist(id) {

  return state.playlist.includes(
    Number(id)
  );

}

function cover(song) {

  return `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;

}

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
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

function toast(message) {

  const element = $("#toast");

  if (!element) return;

  element.textContent = message;

  element.classList.add("show");

  clearTimeout(
    toast.timer
  );

  toast.timer =
    setTimeout(() => {

      element.classList.remove(
        "show"
      );

    }, 1800);

}


/* =====================================================
   COMPTEURS
===================================================== */

function updateCounts() {

  $("#likedCount").textContent =
    state.liked.length;

  $("#dislikedCount").textContent =
    state.disliked.length;

  $("#playlistCount").textContent =
    state.playlist.length;

}


/* =====================================================
   RECHERCHE
===================================================== */

function searchSongs() {

  const query =
    searchTerm
      .trim()
      .toLowerCase();

  if (!query) {
    return SONGS;
  }

  return SONGS.filter(song =>

    song.title
      .toLowerCase()
      .includes(query)

    ||

    song.artist
      .toLowerCase()
      .includes(query)

  );

}


/* =====================================================
   RECOMMANDATIONS
===================================================== */

function getRecommendations() {

  const liked =
    new Set(state.liked);

  const disliked =
    new Set(state.disliked);

  const playlist =
    new Set(state.playlist);

  const history =
    new Set(state.history);

  return SONGS

    .filter(
      song =>
        !disliked.has(song.id)
    )

    .map(song => {

      let score =
        Math.random() * 4;

      if (
        liked.has(song.id)
      ) {
        score += 5;
      }

      if (
        playlist.has(song.id)
      ) {
        score += 3;
      }

      if (
        history.has(song.id)
      ) {
        score += 1;
      }

      return {
        song,
        score
      };

    })

    .sort(
      (a, b) =>
        b.score - a.score
    )

    .map(
      item => item.song
    );

}


/* =====================================================
   MUSIQUES DE LA PAGE
===================================================== */

function getPageSongs() {

  if (searchTerm.trim()) {
    return searchSongs();
  }

  switch (currentPage) {

    case "liked":

      return SONGS.filter(
        song => isLiked(song.id)
      );


    case "disliked":

      return SONGS.filter(
        song => isDisliked(song.id)
      );


    case "playlist":

      return SONGS.filter(
        song =>
          isInPlaylist(song.id)
      );


    case "recommendations":

      return getRecommendations();


    default:

      return SONGS;

  }

}


/* =====================================================
   CARTE MUSIQUE
===================================================== */

function createSongCard(song) {

  const liked =
    isLiked(song.id);

  const disliked =
    isDisliked(song.id);

  const playlist =
    isInPlaylist(song.id);

  return `

    <article class="song-card">

      <div class="cover-wrap">

        <img
          class="cover"
          src="${cover(song)}"
          alt=""
          loading="lazy"
        >

        <button
          class="card-play"
          data-action="play"
          data-id="${song.id}"
          aria-label="Lire"
        >
          ▶
        </button>

      </div>


      <div class="song-title">
        ${escapeHTML(song.title)}
      </div>

      <div class="song-artist">
        ${escapeHTML(song.artist)}
      </div>


      <div class="card-actions">

        <button
          class="card-action like ${
            liked ? "active" : ""
          }"
          data-action="like"
          data-id="${song.id}"
          title="J'aime"
        >
          ${liked ? "♥" : "♡"}
        </button>


        <button
          class="card-action dislike ${
            disliked ? "active" : ""
          }"
          data-action="dislike"
          data-id="${song.id}"
          title="Pas aimé"
        >
          👎
        </button>


        <button
          class="card-action ${
            playlist ? "active" : ""
          }"
          data-action="playlist"
          data-id="${song.id}"
          title="Ma playlist"
        >
          ${playlist ? "✓" : "+"}
        </button>

      </div>

    </article>

  `;

}


/* =====================================================
   ÉTAT VIDE
===================================================== */

function emptyState(
  icon,
  title,
  description
) {

  return `

    <div class="empty">

      <div class="empty-icon">
        ${icon}
      </div>

      <strong>
        ${title}
      </strong>

      <p>
        ${description}
      </p>

    </div>

  `;

}


/* =====================================================
   RENDER
===================================================== */

function render() {

  const page =
    $("#page");

  if (!page) return;


  updateCounts();


  /* RECHERCHE */

  if (searchTerm.trim()) {

    const songs =
      searchSongs();

    page.innerHTML = `

      <div class="page-heading">

        <div>

          <h1>
            Résultats
          </h1>

          <p>
            ${songs.length}
            résultat(s) pour
            « ${escapeHTML(searchTerm)} »
          </p>

        </div>

      </div>


      ${
        songs.length

          ? `
            <div class="song-grid">
              ${songs
                .map(createSongCard)
                .join("")}
            </div>
          `

          : emptyState(
              "⌕",
              "Aucun résultat",
              "Essaie avec un autre titre ou artiste."
            )
      }

    `;

    return;

  }


  /* ACCUEIL */

  if (
    currentPage === "home"
  ) {

    const recommendations =
      getRecommendations()
        .slice(0, 6);


    page.innerHTML = `

      <section class="hero">

        <div class="eyebrow">
          WAVEIFY
        </div>

        <h1>
          Ta musique.
          <br>
          Ton espace.
        </h1>

        <p>
          Écoute tes morceaux préférés,
          crée ta playlist et découvre
          de nouvelles musiques.
        </p>

        <div class="hero-actions">

          <button
            class="primary-btn"
            data-action="play-all"
          >
            ▶ Tout lire
          </button>

          <button
            class="secondary-btn"
            data-action="page"
            data-page-target="recommendations"
          >
            ✦ Découvrir
          </button>

        </div>

      </section>


      <div class="section-heading">

        <div>

          <h2>
            Pour toi
          </h2>

          <p>
            Une sélection personnalisée
          </p>

        </div>

      </div>


      <div class="song-grid">

        ${
          recommendations
            .map(createSongCard)
            .join("")
        }

      </div>


      <div class="section-heading">

        <div>

          <h2>
            Toutes les musiques
          </h2>

          <p>
            ${SONGS.length} morceaux
          </p>

        </div>

        <button
          class="primary-btn"
          data-action="play-all"
        >
          ▶ Tout lire
        </button>

      </div>


      <div class="song-grid">

        ${
          SONGS
            .map(createSongCard)
            .join("")
        }

      </div>

    `;

    return;

  }


  /* RECOMMANDATIONS */

  if (
    currentPage ===
    "recommendations"
  ) {

    const songs =
      getRecommendations();

    page.innerHTML = `

      <div class="page-heading">

        <div>

          <h1>
            Recommandations ✦
          </h1>

          <p>
            Des morceaux sélectionnés
            pour toi.
          </p>

        </div>

        ${
          songs.length
            ? `
              <button
                class="primary-btn"
                data-action="play-all"
              >
                ▶ Tout lire
              </button>
            `
            : ""
        }

      </div>


      ${
        songs.length

          ? `
            <div class="song-grid">
              ${songs
                .map(createSongCard)
                .join("")}
            </div>
          `

          : emptyState(
              "✦",
              "Pas encore de recommandations",
              "Écoute quelques morceaux pour commencer."
            )
      }

    `;

    return;

  }


  /* J'AIME */

  if (
    currentPage === "liked"
  ) {

    const songs =
      getPageSongs();

    page.innerHTML = `

      <div class="page-heading">

        <div>

          <h1>
            J'aime ❤️
          </h1>

          <p>
            ${songs.length}
            musique(s) aimée(s).
          </p>

        </div>

        ${
          songs.length
            ? `
              <button
                class="primary-btn"
                data-action="play-all"
              >
                ▶ Tout lire
              </button>
            `
            : ""
        }

      </div>


      ${
        songs.length

          ? `
            <div class="song-grid">
              ${songs
                .map(createSongCard)
                .join("")}
            </div>
          `

          : emptyState(
              "♡",
              "Aucune musique aimée",
              "Clique sur le cœur d'une musique pour l'ajouter."
            )
      }

    `;

    return;

  }


  /* PAS AIMÉ */

  if (
    currentPage === "disliked"
  ) {

    const songs =
      getPageSongs();

    page.innerHTML = `

      <div class="page-heading">

        <div>

          <h1>
            Pas aimé 👎
          </h1>

          <p>
            ${songs.length}
            musique(s).
          </p>

        </div>

      </div>


      ${
        songs.length

          ? `
            <div class="song-grid">
              ${songs
                .map(createSongCard)
                .join("")}
            </div>
          `

          : emptyState(
              "👎",
              "Aucune musique",
              "Les musiques que tu n'aimes pas apparaîtront ici."
            )
      }

    `;

    return;

  }


  /* PLAYLIST */

  if (
    currentPage === "playlist"
  ) {

    const songs =
      getPageSongs();

    page.innerHTML = `

      <div class="page-heading">

        <div>

          <h1>
            Ma playlist ♫
          </h1>

          <p>
            ${songs.length}
            musique(s) dans ta playlist.
          </p>

        </div>

        ${
          songs.length
            ? `
              <button
                class="primary-btn"
                data-action="play-all"
              >
                ▶ Tout lire
              </button>
            `
            : ""
        }

      </div>


      ${
        songs.length

          ? `
            <div class="song-grid">
              ${songs
                .map(createSongCard)
                .join("")}
            </div>
          `

          : emptyState(
              "♫",
              "Ta playlist est vide",
              "Clique sur + pour ajouter une musique."
            )
      }

    `;

  }

}


/* =====================================================
   NAVIGATION
===================================================== */

function setPage(page) {

  currentPage = page;

  searchTerm = "";

  const search =
    $("#searchInput");

  if (search) {
    search.value = "";
  }


  document
    .querySelectorAll(".nav-item[data-page]")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === page
      );

    });


  render();


  $("#sidebar")
    ?.classList
    .remove("open");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   LIKE
===================================================== */

function toggleLike(id) {

  id = Number(id);


  if (isLiked(id)) {

    state.liked =
      state.liked.filter(
        value => value !== id
      );

    toast(
      "Retiré de J'aime"
    );

  } else {

    state.liked.push(id);

    state.disliked =
      state.disliked.filter(
        value => value !== id
      );

    toast(
      "Ajouté à J'aime ❤️"
    );

  }


  saveState();

  render();

  updatePlayer();

}


/* =====================================================
   DISLIKE
===================================================== */

function toggleDislike(id) {

  id = Number(id);


  if (isDisliked(id)) {

    state.disliked =
      state.disliked.filter(
        value => value !== id
      );

    toast(
      "Retiré de Pas aimé"
    );

  } else {

    state.disliked.push(id);

    state.liked =
      state.liked.filter(
        value => value !== id
      );

    toast(
      "Ajouté à Pas aimé 👎"
    );

  }


  saveState();

  render();

  updatePlayer();

}


/* =====================================================
   PLAYLIST
===================================================== */

function togglePlaylist(id) {

  id = Number(id);


  if (isInPlaylist(id)) {

    state.playlist =
      state.playlist.filter(
        value => value !== id
      );

    toast(
      "Retiré de Ma playlist"
    );

  } else {

    state.playlist.push(id);

    toast(
      "Ajouté à Ma playlist ♫"
    );

  }


  saveState();

  render();

  updatePlayer();

}


/* =====================================================
   LECTURE
===================================================== */

function playSong(
  id,
  customQueue = null
) {

  id = Number(id);

  const song =
    getSong(id);

  if (!song) return;


  currentId = id;


  if (
    customQueue &&
    customQueue.length
  ) {

    queue =
      customQueue.map(Number);

  } else {

    queue =
      SONGS
        .filter(
          song =>
            !isDisliked(song.id)
        )
        .map(
          song => song.id
        );

  }


  queuePosition =
    Math.max(
      0,
      queue.indexOf(id)
    );


  if (
    !state.history.includes(id)
  ) {

    state.history.push(id);

  }


  if (
    state.history.length > 50
  ) {

    state.history.shift();

  }


  saveState();

  updatePlayer();


  if (
    playerReady &&
    player
  ) {

    player.loadVideoById(
      song.videoId
    );

  } else {

    toast(
      "Le lecteur se prépare..."
    );

  }

}


/* =====================================================
   TOUT LIRE
====================
