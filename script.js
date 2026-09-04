/* =========================================================
   WAVEIFY — SCRIPT COMPLET
   ========================================================= */


/* =========================================================
   YOUTUBE LINKS
   ========================================================= */

const YOUTUBE_LINKS = [
    "https://www.youtube.com/watch?v=5qap5aO4i9A",
    "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    "https://www.youtube.com/watch?v=DWcJFNfaw9c",
    "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    "https://www.youtube.com/watch?v=1fueZCTYkpA",
    "https://www.youtube.com/watch?v=kgx4WGK0oNU",
    "https://www.youtube.com/watch?v=77i_mVf7yC8",
    "https://www.youtube.com/watch?v=5yx6BWlEVcY",
    "https://www.youtube.com/watch?v=2OEL4P1Rz04",
    "https://www.youtube.com/watch?v=YbJOTdZBX1g",
    "https://www.youtube.com/watch?v=9f4GQvJZ7mI",
    "https://www.youtube.com/watch?v=HgzGwKwLmgM",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    "https://www.youtube.com/watch?v=KQ6zr6kCPj8",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=RBumgq5yVrA",
    "https://www.youtube.com/watch?v=uelHwf8o7_U",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=lp-EO5I60KA",
    "https://www.youtube.com/watch?v=SlPhMPnQ58k",
    "https://www.youtube.com/watch?v=ru0K8uYEZWw",
    "https://www.youtube.com/watch?v=PT2_F-1esPk",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=3AtDnEC4zak",
    "https://www.youtube.com/watch?v=papuvlVeZg8",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=uelHwf8o7_U"
];


/* =========================================================
   YOUTUBE ID
   ========================================================= */

function getYouTubeId(url) {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes("youtu.be")) {
            return parsedUrl.pathname.slice(1);
        }

        return parsedUrl.searchParams.get("v");
    } catch (error) {
        return null;
    }
}


/* =========================================================
   TRACKS
   ========================================================= */

const tracks = YOUTUBE_LINKS.map((url, index) => {
    const youtubeId = getYouTubeId(url);

    return {
        id: index + 1,
        title: `Track ${String(index + 1).padStart(2, "0")}`,
        artist: "Waveify",
        youtubeId,
        youtubeUrl: url,
        thumbnail: youtubeId
            ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            : ""
    };
});


/* =========================================================
   STATE
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

let sidebarOverlay = document.querySelector(".sidebar-overlay");


/* =========================================================
   CREATE SIDEBAR OVERLAY IF MISSING
   ========================================================= */

if (!sidebarOverlay) {
    sidebarOverlay = document.createElement("div");
    sidebarOverlay.className = "sidebar-overlay";

    document.body.appendChild(sidebarOverlay);
}


/* =========================================================
   HELPERS
   ========================================================= */

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}


/*
   Important :
   Cette fonction protège le HTML généré par JavaScript.
*/

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   TRACK CARD
   ========================================================= */

function createTrackCard(track) {
    const isFavorite = favorites.includes(track.id);

    return `
        <article
            class="music-card"
            data-track-id="${track.id}"
        >

            <div class="music-cover">

                <img
                    src="${escapeHtml(track.thumbnail)}"
                    alt="${escapeHtml(track.title)}"
                    loading="lazy"
                >

                <button
                    class="music-play"
                    type="button"
                    aria-label="Lire ${escapeHtml(track.title)}"
                    data-play-track="${track.id}"
                >
                    ▶
                </button>

            </div>

            <button
                class="card-favorite ${isFavorite ? "active" : ""}"
                type="button"
                aria-label="Ajouter aux favoris"
                aria-pressed="${isFavorite}"
                data-favorite-track="${track.id}"
            >
                ${isFavorite ? "♥" : "♡"}
            </button>

            <div class="music-title">
                ${escapeHtml(track.title)}
            </div>

            <div class="music-artist">
                ${escapeHtml(track.artist)}
            </div>

        </article>
    `;
}


/* =========================================================
   RENDER TRACKS
   ========================================================= */

function renderTracks() {
    if (libraryGrid) {
        libraryGrid.innerHTML = tracks
            .map(createTrackCard)
            .join("");
    }
}


/* =========================================================
   RENDER FAVORITES
   ========================================================= */

function renderFavorites() {
    if (!favoritesGrid || !favoritesEmpty) {
        return;
    }

    const favoriteTracks = tracks.filter(track =>
        favorites.includes(track.id)
    );

    if (favoritesCount) {
        favoritesCount.textContent = favoriteTracks.length;
    }

    if (favoriteTracks.length === 0) {
        favoritesGrid.innerHTML = "";
        favoritesEmpty.style.display = "flex";
        return;
    }

    favoritesEmpty.style.display = "none";

    favoritesGrid.innerHTML = favoriteTracks
        .map(createTrackCard)
        .join("");
}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {
    renderTracks();
    renderFavorites();
    updatePlayerFavorite();
}


/* =========================================================
   FAVORITES
   ========================================================= */

function toggleFavorite(trackId) {
    const numericId = Number(trackId);

    if (favorites.includes(numericId)) {
        favorites = favorites.filter(id => id !== numericId);
    } else {
        favorites.push(numericId);
    }

    localStorage.setItem(
        "waveifyFavorites",
        JSON.stringify(favorites)
    );

    renderAll();
}


/* =========================================================
   UPDATE PLAYER FAVORITE
   ========================================================= */

function updatePlayerFavorite() {
    if (!playerFavorite) {
        return;
    }

    const track = tracks[currentTrackIndex];

    if (!track) {
        return;
    }

    const active = favorites.includes(track.id);

    playerFavorite.classList.toggle("active", active);

    playerFavorite.textContent = active ? "♥" : "♡";

    playerFavorite.setAttribute(
        "aria-pressed",
        String(active)
    );
}


/* =========================================================
   LOAD TRACK
   ========================================================= */

function loadTrack(index, autoplay = false) {
    if (!tracks.length) {
        return;
    }

    if (index < 0) {
        index = tracks.length - 1;
    }

    if (index >= tracks.length) {
        index = 0;
    }

    currentTrackIndex = index;

    const track = tracks[currentTrackIndex];

    if (playerTitle) {
        playerTitle.textContent = track.title;
    }

    if (playerArtist) {
        playerArtist.textContent = track.artist;
    }

    if (playerCover) {
        playerCover.src = track.thumbnail;
        playerCover.alt = track.title;
    }

    updatePlayerFavorite();
    resetProgress();

    if (player && track.youtubeId) {
        player.loadVideoById(track.youtubeId);

        if (autoplay) {
            player.playVideo();
        }
    }
}


/* =========================================================
   PLAY CURRENT TRACK
   ========================================================= */

function playCurrentTrack() {
    if (!player) {
        return;
    }

    player.playVideo();
}


/* =========================================================
   PAUSE
   ========================================================= */

function pauseCurrentTrack() {
    if (!player) {
        return;
    }

    player.pauseVideo();
}


/* =========================================================
   PLAY / PAUSE
   ========================================================= */

function togglePlayPause() {
    if (!player) {
        return;
    }

    if (isPlaying) {
        pauseCurrentTrack();
    } else {
        playCurrentTrack();
    }
}


/* =========================================================
   UPDATE PLAY BUTTON
   ========================================================= */

function updatePlayButton() {
    if (!playButton) {
        return;
    }

    playButton.textContent = isPlaying ? "❚❚" : "▶";

    playButton.setAttribute(
        "aria-label",
        isPlaying ? "Pause" : "Lecture"
    );
}


/* =========================================================
   NEXT TRACK
   ========================================================= */

function nextTrack() {
    if (!tracks.length) {
        return;
    }

    let nextIndex;

    if (isShuffle && tracks.length > 1) {
        do {
            nextIndex = Math.floor(
                Math.random() * tracks.length
            );
        } while (nextIndex === currentTrackIndex);
    } else {
        nextIndex = currentTrackIndex + 1;

        if (nextIndex >= tracks.length) {
            nextIndex = 0;
        }
    }

    loadTrack(nextIndex, true);
}


/* =========================================================
   PREVIOUS TRACK
   ========================================================= */

function previousTrack() {
    if (!player) {
        return;
    }

    /*
       Si la chanson est déjà avancée de plus de 3 secondes,
       on revient simplement au début.
    */

    if (
        typeof player.getCurrentTime === "function" &&
        player.getCurrentTime() > 3
    ) {
        player.seekTo(0, true);
        return;
    }

    let previousIndex = currentTrackIndex - 1;

    if (previousIndex < 0) {
        previousIndex = tracks.length - 1;
    }

    loadTrack(previousIndex, true);
}


/* =========================================================
   SHUFFLE
   ========================================================= */

function toggleShuffle() {
    isShuffle = !isShuffle;

    if (shuffleButton) {
        shuffleButton.classList.toggle(
            "active",
            isShuffle
        );
    }
}


/* =========================================================
   REPEAT
   ========================================================= */

function toggleRepeat() {
    isRepeat = !isRepeat;

    if (repeatButton) {
        repeatButton.classList.toggle(
            "active",
            isRepeat
        );
    }
}


/* =========================================================
   RESET PROGRESS
   ========================================================= */

function resetProgress() {
    if (progressBar) {
        progressBar.style.width = "0%";
    }

    if (currentTimeElement) {
        currentTimeElement.textContent = "0:00";
    }

    if (durationElement) {
        durationElement.textContent = "0:00";
    }
}


/* =========================================================
   UPDATE PROGRESS
   ========================================================= */

function updateProgress() {
    if (!player) {
        return;
    }

    if (
        typeof player.getCurrentTime !== "function" ||
        typeof player.getDuration !== "function"
    ) {
        return;
    }

    const current = player.getCurrentTime();
    const duration = player.getDuration();

    if (!Number.isFinite(duration) || duration <= 0) {
        return;
    }

    const percentage =
        Math.min(100, Math.max(0, (current / duration) * 100));

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (currentTimeElement) {
        currentTimeElement.textContent =
            formatTime(current);
    }

    if (durationElement) {
        durationElement.textContent =
            formatTime(duration);
    }
}


/* =========================================================
   SEEK
   ========================================================= */

function seek(event) {
    if (!player || !progressContainer) {
        return;
    }

    const duration = player.getDuration();

    if (!Number.isFinite(duration) || duration <= 0) {
        return;
    }

    const rect =
        progressContainer.getBoundingClientRect();

    const clickPosition =
        Math.min(
            Math.max(event.clientX - rect.left, 0),
            rect.width
        );

    const percentage =
        clickPosition / rect.width;

    player.seekTo(
        duration * percentage,
        true
    );
}


/* =========================================================
   VOLUME
   ========================================================= */

function updateVolume() {
    if (!player || !volumeSlider) {
        return;
    }

    const volume = Number(volumeSlider.value);

    player.setVolume(volume);
}


/* =========================================================
   PLAY ALL
   ========================================================= */

function playAll() {
    if (!tracks.length) {
        return;
    }

    loadTrack(0, true);
}


/* =========================================================
   PLAY TRACK BY ID
   ========================================================= */

function playTrackById(trackId) {
    const index = tracks.findIndex(
        track => track.id === Number(trackId)
    );

    if (index === -1) {
        return;
    }

    loadTrack(index, true);
}


/* =========================================================
   EVENT DELEGATION FOR TRACK CARDS
   ========================================================= */

document.addEventListener("click", event => {

    const playTarget =
        event.target.closest("[data-play-track]");

    if (playTarget) {
        event.stopPropagation();

        playTrackById(
            playTarget.dataset.playTrack
        );

        return;
    }


    const favoriteTarget =
        event.target.closest("[data-favorite-track]");

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
            card.dataset.trackId;

        if (trackId) {
            playTrackById(trackId);
        }
    }
});


/* =========================================================
   PLAYER EVENTS
   ========================================================= */

if (playButton) {
    playButton.addEventListener(
        "click",
        togglePlayPause
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
        toggleShuffle
    );
}

if (repeatButton) {
    repeatButton.addEventListener(
        "click",
        toggleRepeat
    );
}

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

if (playerFavorite) {
    playerFavorite.addEventListener(
        "click",
        () => {
            const track = tracks[currentTrackIndex];

            if (track) {
                toggleFavorite(track.id);
            }
        }
    );
}


/* =========================================================
   PLAY ALL BUTTON
   ========================================================= */

const playAllButton =
    document.getElementById("playAll");

if (playAllButton) {
    playAllButton.addEventListener(
        "click",
        playAll
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

const navItems =
    document.querySelectorAll(".nav-item");

const pageSections =
    document.querySelectorAll(".page-section");


function showPage(pageName) {
    pageSections.forEach(section => {
        section.classList.toggle(
            "active",
            section.id === pageName
        );
    });

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

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;

            if (page) {
                showPage(page);
            }
        }
    );

});


/* ===============================================
