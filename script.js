const YOUTUBE_LINKS = [
    "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    "https://www.youtube.com/watch?v=5qap5aO4i9A",
    "https://www.youtube.com/watch?v=DWcJFNfaw9c",
    "https://www.youtube.com/watch?v=kgx4WGK0oNU",
    "https://www.youtube.com/watch?v=7NOSDKb0HlU",
    "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    "https://www.youtube.com/watch?v=FjHGZj2IjBk",
    "https://www.youtube.com/watch?v=7wtfhZwyrcc",
    "https://www.youtube.com/watch?v=YykjpeuMNEk",
    "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    "https://www.youtube.com/watch?v=ktvTqknDobU",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    "https://www.youtube.com/watch?v=lp-EO5I60KA",
    "https://www.youtube.com/watch?v=hT_nvWreIhg",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=fRh_vgS2dFE",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=3AtDnEC4zak",
    "https://www.youtube.com/watch?v=ru0K8uYEZWw",
    "https://www.youtube.com/watch?v=PT2_F-1esPk",
    "https://www.youtube.com/watch?v=7OrLroFa0AI",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=SlPhMPnQ58k",
    "https://www.youtube.com/watch?v=DyDfgMOUjCI",
    "https://www.youtube.com/watch?v=RBumgq5yVrA",
    "https://www.youtube.com/watch?v=2zNSgSzhBfM",
    "https://www.youtube.com/watch?v=UceaB4D0jpo",
    "https://www.youtube.com/watch?v=QJO3ROT-A4E",
    "https://www.youtube.com/watch?v=VbfpW0pbvaU",
    "https://www.youtube.com/watch?v=RgKAFK5djSk"
];

function getYouTubeId(url) {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.slice(1);
        }

        return parsed.searchParams.get("v");
    } catch {
        return null;
    }
}


const tracks = YOUTUBE_LINKS.map((url, index) => {
    const youtubeId = getYouTubeId(url);

    return {
        id: index + 1,
        title: `Track ${String(index + 1).padStart(2, "0")}`,
        artist: "Waveify",
        youtubeId,
        url,
        cover: youtubeId
            ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            : ""
    };
});


/* =========================
   ÉTAT
========================= */

let currentTrackIndex = -1;
let player = null;
let isPlayerReady = false;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

let favorites = JSON.parse(
    localStorage.getItem("waveifyFavorites") || "[]"
);


/* =========================
   DOM
========================= */

const homeGrid = document.getElementById("homeGrid");
const libraryGrid = document.getElementById("libraryGrid");

const favoritesGrid = document.getElementById("favoritesGrid");
const favoritesCount = document.getElementById("favoritesCount");
const favoritesEmpty = document.getElementById("favoritesEmpty");

const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerCover = document.getElementById("playerCover");
const playerFavorite = document.getElementById("playerFavorite");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const shuffleButton = document.getElementById("shuffleButton");
const repeatButton = document.getElementById("repeatButton");

const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");

const currentTimeElement = document.getElementById("currentTime");
const durationElement = document.getElementById("duration");

const volumeSlider = document.getElementById("volumeSlider");

const mobileMenuButton = document.getElementById("mobileMenu");
const sidebar = document.querySelector(".sidebar");


/* =========================
   UTILITAIRES
========================= */

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function saveFavorites() {
    localStorage.setItem(
        "waveifyFavorites",
        JSON.stringify(favorites)
    );
}


function isFavorite(trackId) {
    return favorites.includes(trackId);
}


/* =========================
   CARTES MUSIQUE
========================= */

function createTrackCard(track) {
    const favorite = isFavorite(track.id);

    return `
        <article
            class="music-card"
            data-track-id="${track.id}"
        >

            <div class="music-cover">

                <img
                    src="${escapeHtml(track.cover)}"
                    alt="${escapeHtml(track.title)}"
                    loading="lazy"
                >

                <button
                    class="card-play"
                    type="button"
                    data-play-track="${track.id}"
                    aria-label="Lire ${escapeHtml(track.title)}"
                >
                    ▶
                </button>

                <button
                    class="card-favorite ${favorite ? "active" : ""}"
                    type="button"
                    data-favorite-track="${track.id}"
                    aria-label="Ajouter aux favoris"
                >
                    ${favorite ? "♥" : "♡"}
                </button>

            </div>

            <div class="music-card-info">

                <strong>
                    ${escapeHtml(track.title)}
                </strong>

                <span>
                    ${escapeHtml(track.artist)}
                </span>

            </div>

        </article>
    `;
}


/* =========================
   AFFICHAGE
========================= */

function renderHome() {
    if (!homeGrid) return;

    const homeTracks = tracks.slice(0, 12);

    homeGrid.innerHTML = homeTracks
        .map(createTrackCard)
        .join("");
}


function renderLibrary() {
    if (!libraryGrid) return;

    libraryGrid.innerHTML = tracks
        .map(createTrackCard)
        .join("");
}


function renderFavorites() {
    if (!favoritesGrid) return;

    const favoriteTracks = tracks.filter(track =>
        favorites.includes(track.id)
    );

    favoritesGrid.innerHTML = favoriteTracks
        .map(createTrackCard)
        .join("");

    if (favoritesCount) {
        favoritesCount.textContent = favoriteTracks.length;
    }

    if (favoritesEmpty) {
        favoritesEmpty.style.display =
            favoriteTracks.length === 0 ? "flex" : "none";
    }
}


function renderAll() {
    renderHome();
    renderLibrary();
    renderFavorites();
}


/* =========================
   FAVORIS
========================= */

function toggleFavorite(trackId) {
    const numericId = Number(trackId);

    if (favorites.includes(numericId)) {
        favorites = favorites.filter(id => id !== numericId);
    } else {
        favorites.push(numericId);
    }

    saveFavorites();
    renderAll();
    updatePlayerFavorite();
}


function updatePlayerFavorite() {
    if (!playerFavorite || currentTrackIndex < 0) {
        return;
    }

    const track = tracks[currentTrackIndex];

    if (!track) return;

    const active = isFavorite(track.id);

    playerFavorite.textContent = active ? "♥" : "♡";
    playerFavorite.classList.toggle("active", active);
}


/* =========================
   LECTEUR
========================= */

function loadTrack(index, autoplay = true) {
    if (!tracks[index]) return;

    currentTrackIndex = index;

    const track = tracks[index];

    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerCover.src = track.cover;

    updatePlayerFavorite();

    progressBar.style.width = "0%";
    currentTimeElement.textContent = "0:00";
    durationElement.textContent = "0:00";

    if (!isPlayerReady || !player) {
        return;
    }

    player.loadVideoById(track.youtubeId);

    if (autoplay) {
        player.playVideo();
    }
}


function playCurrentTrack() {
    if (currentTrackIndex < 0) {
        loadTrack(0, true);
        return;
    }

    if (!player || !isPlayerReady) {
        return;
    }

    player.playVideo();
}


function pauseCurrentTrack() {
    if (!player || !isPlayerReady) {
        return;
    }

    player.pauseVideo();
}


function togglePlay() {
    if (currentTrackIndex < 0) {
        loadTrack(0, true);
        return;
    }

    if (isPlaying) {
        pauseCurrentTrack();
    } else {
        playCurrentTrack();
    }
}


function playNext() {
    if (!tracks.length) return;

    let nextIndex;

    if (isShuffle) {
        if (tracks.length === 1) {
            nextIndex = 0;
        } else {
            do {
                nextIndex = Math.floor(
                    Math.random() * tracks.length
                );
            } while (nextIndex === currentTrackIndex);
        }
    } else {
        nextIndex = currentTrackIndex + 1;

        if (nextIndex >= tracks.length) {
            nextIndex = 0;
        }
    }

    loadTrack(nextIndex, true);
}


function playPrevious() {
    if (!tracks.length) return;

    if (currentTrackIndex <= 0) {
        loadTrack(tracks.length - 1, true);
        return;
    }

    loadTrack(currentTrackIndex - 1, true);
}


/* =========================
   PLAY ALL
========================= */

function playAll() {
    if (!tracks.length) return;

    loadTrack(0, true);
}


/* =========================
   PROGRESSION
========================= */

function updateProgress() {
    if (!player || !isPlayerReady) {
        return;
    }

    try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();

        if (!Number.isFinite(duration) || duration <= 0) {
            return;
        }

        const percentage =
            (currentTime / duration) * 100;

        progressBar.style.width =
            `${Math.min(100, Math.max(0, percentage))}%`;

        currentTimeElement.textContent =
            formatTime(currentTime);

        durationElement.textContent =
            formatTime(duration);

    } catch {
        // YouTube peut ne pas être encore totalement initialisé.
    }
}


function seek(event) {
    if (!player || !isPlayerReady) return;

    const rect =
        progressContainer.getBoundingClientRect();

    const position =
        (event.clientX - rect.left) / rect.width;

    const duration = player.getDuration();

    if (!Number.isFinite(duration)) return;

    player.seekTo(
        Math.max(0, Math.min(1, position)) * duration,
        true
    );
}


/* =========================
   VOLUME
========================= */

function updateVolume() {
    if (!player || !isPlayerReady) return;

    const volume = Number(volumeSlider.value);

    player.setVolume(volume);
}


/* =========================
   NAVIGATION
========================= */

const navItems =
    document.querySelectorAll(".nav-item");

const pageSections =
    document.querySelectorAll(".page-section");


function showPage(pageName) {
    let pageFound = false;

    pageSections.forEach(section => {
        const active =
            section.id === pageName;

        section.classList.toggle(
            "active",
            active
        );

        if (active) {
            pageFound = true;
        }
    });

    if (!pageFound) {
        return;
    }

    navItems.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    closeMobileSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navItems.forEach(button => {
    button.addEventListener("click", () => {
        const page =
            button.getAttribute("data-page");

        if (page) {
            showPage(page);
        }
    });
});


/* =========================
   BOUTONS ACCUEIL
========================= */

const playAllButton =
    document.getElementById("playAll");

if (playAllButton) {
    playAllButton.addEventListener(
        "click",
        playAll
    );
}


const seeAllButton =
    document.getElementById("seeAll");

if (seeAllButton) {
    seeAllButton.addEventListener(
        "click",
        () => showPage("library")
    );
}


const emptyFavoritesButton =
    document.getElementById(
        "emptyFavoritesButton"
    );

if (emptyFavoritesButton) {
    emptyFavoritesButton.addEventListener(
        "click",
        () => showPage("home")
    );
}


/* =========================
   CLICS SUR LES CARTES
========================= */

document.addEventListener("click", event => {

    const playTarget =
        event.target.closest(
            "[data-play-track]"
        );

    if (playTarget) {
        event.stopPropagation();

        const trackId =
            Number(
                playTarget.dataset.playTrack
            );

        const index =
            tracks.findIndex(
                track => track.id === trackId
            );

        if (index !== -1) {
            loadTrack(index, true);
        }

        return;
    }


    const favoriteTarget =
        event.target.closest(
            "[data-favorite-track]"
        );

    if (favoriteTarget) {
        event.stopPropagation();

        toggleFavorite(
            favoriteTarget.dataset.favoriteTrack
        );

        return;
    }


    const card =
        event.target.closest(".music-card");

    if (card) {
        const trackId =
            Number(card.dataset.trackId);

        const index =
            tracks.findIndex(
                track => track.id === trackId
            );

        if (index !== -1) {
            loadTrack(index, true);
        }
    }
});


/* =========================
   CONTRÔLES DU PLAYER
========================= */

if (playButton) {
    playButton.addEventListener(
        "click",
        togglePlay
    );
}


if (previousButton) {
    previousButton.addEventListener(
        "click",
        playPrevious
    );
}


if (nextButton) {
    nextButton.addEventListener(
        "click",
        playNext
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
            if (currentTrackIndex < 0) return;

            const track =
                tracks[currentTrackIndex];

            if (track) {
                toggleFavorite(track.id);
            }
        }
    );
}


/* =========================
   PROGRESSION / VOLUME
========================= */

if (progressContainer) {
    progressContainer.addEventListener(
        "click",
        seek
    );
}


if (volumeSlider) {
    volumeSlider.addEventListener(
        "input",
        updateVolume
    );
}


/* =========================
   MENU MOBILE
========================= */

let sidebarOverlay =
    document.querySelector(
        ".sidebar-overlay"
    );

if (!sidebarOverlay) {
    sidebarOverlay =
        document.createElement("div");

    sidebarOverlay.className =
        "sidebar-overlay";

    document.body.appendChild(
        sidebarOverlay
    );
}


function openMobileSidebar() {
    if (!sidebar) return;

    sidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
    document.body.classList.add("menu-open");
}


function closeMobileSidebar() {
    if (!sidebar) return;

    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
    document.body.classList.remove("menu-open");
}


if (mobileMenuButton) {
    mobileMenuButton.addEventListener(
        "click",
        () => {
            if (
                sidebar &&
                sidebar.classList.contains("open")
            ) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        }
    );
}


sidebarOverlay.addEventListener(
    "click",
    closeMobileSidebar
);


/* =========================
   YOUTUBE API
========================= */

function onYouTubeIframeAPIReady() {

    player = new YT.Player(
        "youtubePlayer",
        {
            height: "1",
            width: "1",

            videoId: "",

            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                playsinline: 1,
                rel: 0
            },

            events: {

                onReady: event => {
                    isPlayerReady = true;

                    event.target.setVolume(
                        Number(volumeSlider?.value || 80)
                    );
                },

                onStateChange: event => {

                    if (
                        event.data ===
                        YT.PlayerState.PLAYING
                    ) {
                        isPlaying = true;

                        if (playButton) {
                            playButton.textContent =
                                "❚❚";
                        }
                    }

                    else if (
                        event.data ===
                        YT.PlayerState.PAUSED
                    ) {
                        isPlaying = false;

                        if (playButton) {
                            playButton.textContent =
                                "▶";
                        }
                    }

                    else if (
                        event.data ===
                        YT.PlayerState.ENDED
                    ) {

                        isPlaying = false;

                        if (isRepeat) {
                            playCurrentTrack();
                        } else {
                            playNext();
                        }
                    }
                }
            }
        }
    );
}


/* =========================
   CHARGEMENT YOUTUBE
========================= */

function loadYouTubeAPI() {

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


/* =========================
   INITIALISATION
========================= */

renderAll();

if (currentTrackIndex === -1) {
    playerTitle.textContent =
        "Choisis un morceau";

    playerArtist.textContent =
        "Waveify";

    playerFavorite.textContent =
        "♡";
}

setInterval(
    updateProgress,
    500
);

loadYouTubeAPI();


/* =========================
   RESPONSIVE
========================= */

window.addEventListener(
    "resize",
    () => {
        if (window.innerWidth > 700) {
            closeMobileSidebar();
        }
    }
);
