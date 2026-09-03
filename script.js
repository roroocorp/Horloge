/* =========================================================
   WAVEIFY — SCRIPT COMPLET
========================================================= */


/* =========================================================
   YOUTUBE
========================================================= */

const YOUTUBE_LINKS = [
    "https://www.youtube.com/watch?v=4NRXx6U8ABQ",
    "https://www.youtube.com/watch?v=1G4isv_Fylg",
    "https://www.youtube.com/watch?v=RB-RcX5DS5A",
    "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    "https://www.youtube.com/watch?v=YVkUvmDQ3HY",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=lp-EO5I60KA",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=hT_nvWreIhg",
    "https://www.youtube.com/watch?v=SlPhMPnQ58k",
    "https://www.youtube.com/watch?v=PT2_F-1esPk",
    "https://www.youtube.com/watch?v=ru0K8uYEZWw",
    "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=7wtfhZwyrcc",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=uelHwf8o7_U",
    "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    "https://www.youtube.com/watch?v=bo_efYhYU2A",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=3AtDnEC4zak",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=fRh_vgS2dFE",
    "https://www.youtube.com/watch?v=YVkUvmDQ3HY",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=hT_nvWreIhg",
    "https://www.youtube.com/watch?v=1G4isv_Fylg",
    "https://www.youtube.com/watch?v=4NRXx6U8ABQ"
];


/* =========================================================
   OUTILS
========================================================= */

function getYouTubeId(url) {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes("youtu.be")) {
            return parsedUrl.pathname.substring(1);
        }

        return parsedUrl.searchParams.get("v");
    } catch {
        return null;
    }
}


/* =========================================================
   TRACKS
========================================================= */

const tracks = YOUTUBE_LINKS.map((url, index) => {
    const id = getYouTubeId(url);

    return {
        id,
        title: `Track ${String(index + 1).padStart(2, "0")}`,
        artist: "Waveify",
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
});


/* =========================================================
   ÉTAT
========================================================= */

let currentTrackIndex = 0;
let player = null;

let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

let favorites = JSON.parse(
    localStorage.getItem("waveifyFavorites") || "[]"
);


/* =========================================================
   DOM
========================================================= */

const musicGrid = document.getElementById("musicGrid");
const libraryGrid = document.getElementById("libraryGrid");
const favoritesGrid = document.getElementById("favoritesGrid");

const emptyFavorites = document.getElementById("emptyFavorites");

const playerCover = document.getElementById("playerCover");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");

const playerFavorite = document.getElementById("playerFavorite");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const shuffleButton = document.getElementById("shuffleButton");
const repeatButton = document.getElementById("repeatButton");

const progressBar = document.getElementById("progressBar");
const progress = document.getElementById("progress");

const currentTimeElement = document.getElementById("currentTime");
const durationElement = document.getElementById("duration");

const volumeControl = document.getElementById("volumeControl");

const playAllButton = document.getElementById("playAllButton");

const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobileMenu");

const notificationButton =
    document.getElementById("notificationButton");

const backButton =
    document.getElementById("backButton");

const forwardButton =
    document.getElementById("forwardButton");


/* =========================================================
   FORMAT TEMPS
========================================================= */

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}


/* =========================================================
   CARTES MUSIQUE
========================================================= */

function createTrackCard(track, index) {

    const card = document.createElement("article");

    card.className = "music-card";

    card.dataset.index = index;

    const isFavorite = favorites.includes(index);

    card.innerHTML = `
        <div class="music-card-image">

            <img
                src="${track.thumbnail}"
                alt="${track.title}"
                loading="lazy"
            >

            <button
                class="music-card-play"
                aria-label="Lire ${track.title}"
            >
                ▶
            </button>

            <button
                class="music-card-favorite ${isFavorite ? "active" : ""}"
                aria-label="Ajouter aux favoris"
            >
                ${isFavorite ? "♥" : "♡"}
            </button>

        </div>

        <div class="music-card-info">

            <strong class="music-card-title">
                ${track.title}
            </strong>

            <span class="music-card-artist">
                ${track.artist}
            </span>

        </div>
    `;


    /* Lecture */

    const playCardButton =
        card.querySelector(".music-card-play");

    playCardButton.addEventListener("click", (event) => {
        event.stopPropagation();

        playTrack(index);
    });


    /* Favori */

    const favoriteButton =
        card.querySelector(".music-card-favorite");

    favoriteButton.addEventListener("click", (event) => {
        event.stopPropagation();

        toggleFavorite(index);
    });


    /* Double clic */

    card.addEventListener("dblclick", () => {
        playTrack(index);
    });


    return card;
}


/* =========================================================
   RENDU DES MORCEAUX
========================================================= */

function renderTracks() {

    if (!musicGrid || !libraryGrid) {
        return;
    }

    musicGrid.innerHTML = "";
    libraryGrid.innerHTML = "";

    tracks.forEach((track, index) => {

        musicGrid.appendChild(
            createTrackCard(track, index)
        );

        libraryGrid.appendChild(
            createTrackCard(track, index)
        );

    });
}


/* =========================================================
   FAVORIS
========================================================= */

function renderFavorites() {

    if (!favoritesGrid) {
        return;
    }

    favoritesGrid.innerHTML = "";

    const favoriteTracks = favorites
        .map(index => tracks[index])
        .filter(Boolean);

    favoriteTracks.forEach(track => {

        const index = tracks.indexOf(track);

        favoritesGrid.appendChild(
            createTrackCard(track, index)
        );

    });


    if (emptyFavorites) {
        emptyFavorites.classList.toggle(
            "visible",
            favoriteTracks.length === 0
        );
    }
}


function saveFavorites() {

    localStorage.setItem(
        "waveifyFavorites",
        JSON.stringify(favorites)
    );
}


function toggleFavorite(index) {

    if (favorites.includes(index)) {

        favorites = favorites.filter(
            favoriteIndex => favoriteIndex !== index
        );

    } else {

        favorites.push(index);

    }

    saveFavorites();

    renderTracks();
    renderFavorites();

    updatePlayerFavorite();
}


function updatePlayerFavorite() {

    if (!playerFavorite) {
        return;
    }

    const active =
        favorites.includes(currentTrackIndex);

    playerFavorite.classList.toggle(
        "active",
        active
    );

    playerFavorite.textContent =
        active ? "♥" : "♡";
}


/* =========================================================
   CHARGER UN MORCEAU
========================================================= */

function loadTrack(index, autoplay = true) {

    if (!tracks[index]) {
        return;
    }

    currentTrackIndex = index;

    const track = tracks[index];

    if (playerCover) {
        playerCover.src = track.thumbnail;
        playerCover.alt = track.title;
    }

    if (playerTitle) {
        playerTitle.textContent = track.title;
    }

    if (playerArtist) {
        playerArtist.textContent = track.artist;
    }

    updatePlayerFavorite();

    if (player) {

        if (autoplay) {
            player.loadVideoById(track.id);
        } else {
            player.cueVideoById(track.id);
        }

    }

    updatePlayButton(false);
}


/* =========================================================
   LECTURE
========================================================= */

function playTrack(index) {

    if (!tracks[index]) {
        return;
    }

    currentTrackIndex = index;

    if (!player) {
        loadTrack(index, false);
        return;
    }

    player.loadVideoById(
        tracks[index].id
    );

    isPlaying = true;

    updatePlayButton(true);
    updatePlayerFavorite();
}


function togglePlay() {

    if (!player) {
        return;
    }

    if (isPlaying) {

        player.pauseVideo();

    } else {

        player.playVideo();

    }
}


function updatePlayButton(playing = isPlaying) {

    if (!playButton) {
        return;
    }

    playButton.textContent =
        playing ? "❚❚" : "▶";

    playButton.setAttribute(
        "aria-label",
        playing ? "Pause" : "Lecture"
    );
}


/* =========================================================
   MORCEAU SUIVANT
========================================================= */

function nextTrack() {

    let nextIndex;

    if (isShuffle) {

        if (tracks.length <= 1) {
            nextIndex = currentTrackIndex;
        } else {

            do {
                nextIndex =
                    Math.floor(
                        Math.random() * tracks.length
                    );
            } while (
                nextIndex === currentTrackIndex
            );

        }

    } else {

        nextIndex =
            (currentTrackIndex + 1) %
            tracks.length;

    }

    playTrack(nextIndex);
}


/* =========================================================
   MORCEAU PRÉCÉDENT
========================================================= */

function previousTrack() {

    if (player) {

        const currentTime =
            player.getCurrentTime();

        if (currentTime > 3) {

            player.seekTo(0, true);

            return;
        }
    }

    const previousIndex =
        (currentTrackIndex - 1 + tracks.length) %
        tracks.length;

    playTrack(previousIndex);
}


/* =========================================================
   LECTURE DE TOUS LES MORCEAUX
========================================================= */

function playAll() {

    if (!tracks.length) {
        return;
    }

    playTrack(0);
}


/* =========================================================
   PROGRESSION
========================================================= */

function updateProgress() {

    if (!player) {
        return;
    }

    try {

        const current =
            player.getCurrentTime();

        const duration =
            player.getDuration();

        if (
            !Number.isFinite(current) ||
            !Number.isFinite(duration) ||
            duration <= 0
        ) {
            return;
        }

        const percentage =
            (current / duration) * 100;

        if (progress) {
            progress.style.width =
                `${percentage}%`;
        }

        if (currentTimeElement) {
            currentTimeElement.textContent =
                formatTime(current);
        }

        if (durationElement) {
            durationElement.textContent =
                formatTime(duration);
        }

    } catch {
        /* Le lecteur peut ne pas être prêt */
    }
}


/* =========================================================
   RECHERCHE DANS LA BARRE DE PROGRESSION
========================================================= */

if (progressBar) {

    progressBar.addEventListener(
        "click",
        event => {

            if (!player) {
                return;
            }

            const duration =
                player.getDuration();

            if (!duration) {
                return;
            }

            const rect =
                progressBar.getBoundingClientRect();

            const position =
                (event.clientX - rect.left) /
                rect.width;

            const time =
                Math.max(
                    0,
                    Math.min(
                        duration,
                        position * duration
                    )
                );

            player.seekTo(time, true);
        }
    );
}


/* =========================================================
   VOLUME
========================================================= */

if (volumeControl) {

    volumeControl.addEventListener(
        "input",
        () => {

            if (!player) {
                return;
            }

            player.setVolume(
                Number(volumeControl.value)
            );
        }
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(sectionName) {

    const sections = {
        home: document.getElementById("homeSection"),
        library: document.getElementById("librarySection"),
        favorites: document.getElementById("favoritesSection")
    };

    Object.values(sections).forEach(section => {

        if (section) {
            section.classList.remove("active");
        }

    });


    if (sections[sectionName]) {
        sections[sectionName].classList.add("active");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionName
            );

        });


    /* Retour en haut de la partie droite */

    if (document.querySelector(".main-content")) {

        document
            .querySelector(".main-content")
            .scrollTo({
                top: 0,
                behavior: "smooth"
            });

    }


    closeMobileMenu();
}


/* =========================================================
   NAV ITEMS
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener("click", () => {

            const section =
                item.dataset.section;

            showSection(section);

        });

    });


/* =========================================================
   MENU MOBILE
========================================================= */

function openMobileMenu() {

    if (!sidebar || !mobileMenu) {
        return;
    }

    sidebar.classList.add("open");
    mobileMenu.classList.add("active");

    mobileMenu.setAttribute(
        "aria-label",
        "Fermer le menu"
    );
}


function closeMobileMenu() {

    if (!sidebar || !mobileMenu) {
        return;
    }

    sidebar.classList.remove("open");
    mobileMenu.classList.remove("active");

    mobileMenu.setAttribute(
        "aria-label",
        "Ouvrir le menu"
    );
}


function toggleMobileMenu() {

    if (!sidebar) {
        return;
    }

    if (sidebar.classList.contains("open")) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleMobileMenu();

        }
    );
}


/* Fermer le menu si on clique sur la page */

document.addEventListener(
    "click",
    event => {

        if (
            window.innerWidth <= 767 &&
            sidebar &&
            mobileMenu &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !mobileMenu.contains(event.target)
        ) {
            closeMobileMenu();
        }

    }
);


/* =========================================================
   NOTIFICATION
========================================================= */

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

            alert(
                "Bienvenue sur Waveify 🎵"
            );

        }
    );
}


/* =========================================================
   BOUTON ÉCOUTER
========================================================= */

if (playAllButton) {

    playAllButton.addEventListener(
        "click",
        playAll
    );
}


/* =========================================================
   CONTRÔLES DU LECTEUR
========================================================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        togglePlay
    );
}

if (nextButton) {

    nextButton.addEventListener(
        "click",
        nextTrack
    );
}

if (previousButton) {

    previousButton.addEventListener(
        "click",
        previousTrack
    );
}


if (shuffleButton) {

    shuffleButton.addEventListener(
        "click",
        () => {

            isShuffle = !isShuffle;

            shuffleButton.classList.toggle(
                "active",
                isShuffle
            );

        }
    );
}


if (repeatButton) {

    repeatButton.addEventListener(
        "click",
        () => {

            isRepeat = !isRepeat;

            repeatButton.classList.toggle(
                "active",
                isRepeat
            );

        }
    );
}


if (playerFavorite) {

    playerFavorite.addEventListener(
        "click",
        () => {

            toggleFavorite(
                currentTrackIndex
            );

        }
    );
}


/* =========================================================
   BOUTONS RETOUR / SUIVANT
========================================================= */

if (backButton) {

    backButton.addEventListener(
        "click",
        () => {
            window.history.back();
        }
    );
}

if (forwardButton) {

    forwardButton.addEventListener(
        "click",
        () => {
            window.history.forward();
        }
    );
}


/* =========================================================
   ÉTAT DU LECTEUR YOUTUBE
========================================================= */

function handlePlayerState(event) {

    /*
       1 = PLAYING
       2 = PAUSED
       0 = ENDED
    */

    if (event.data === 1) {

 
