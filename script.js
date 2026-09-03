const YOUTUBE_LINKS = [
    "https://www.youtube.com/watch?v=ZbZSe6N_BXs",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=fLexgOxsZu0",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=lp-EO5I60KA",
    "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    "https://www.youtube.com/watch?v=bo_efYhYU2A",
    "https://www.youtube.com/watch?v=hT_nvWreIhg",
    "https://www.youtube.com/watch?v=RBumgq5yVrA",
    "https://www.youtube.com/watch?v=ru0K8uYEZWw",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=7wtfhZwyrcc",
    "https://www.youtube.com/watch?v=VbfpW0pbvaU",
    "https://www.youtube.com/watch?v=YykjpeuMNEk",
    "https://www.youtube.com/watch?v=6Ejga4kJUts",
    "https://www.youtube.com/watch?v=9bZkp7q19f0",
    "https://www.youtube.com/watch?v=60og9gwKh1o",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=fRh_vgS2dFE",
    "https://www.youtube.com/watch?v=ktvTqknDobU",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=450p7goxZqg",
    "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    "https://www.youtube.com/watch?v=KQ6zr6kCPj8",
    "https://www.youtube.com/watch?v=uelHwf8o7_U",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=3JZ_D3ELwOQ"
];

function getYouTubeId(url) {
    try {
        const parsed = new URL(url);
        return parsed.searchParams.get("v") || "";
    } catch {
        return "";
    }
}

const tracks = YOUTUBE_LINKS.map((url, index) => {
    const id = getYouTubeId(url);

    return {
        id,
        url,
        title: `Track ${String(index + 1).padStart(2, "0")}`,
        artist: "Waveify",
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
});

let currentTrackIndex = 0;
let player = null;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

let shuffleQueue = [];

let favorites = JSON.parse(
    localStorage.getItem("waveifyFavorites") || "[]"
);

const tracksContainer = document.getElementById("tracksContainer");
const favoritesContainer = document.getElementById("favoritesContainer");

const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerThumbnail = document.getElementById("playerThumbnail");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const shuffleButton = document.getElementById("shuffleButton");
const repeatButton = document.getElementById("repeatButton");

const progressBar = document.getElementById("progressBar");
const currentTimeElement = document.getElementById("currentTime");
const totalTimeElement = document.getElementById("totalTime");

const volumeSlider = document.getElementById("volumeSlider");
const favoriteButton = document.getElementById("favoriteButton");

const mobileMenuButton = document.getElementById("mobileMenuButton");
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".sidebar-overlay");

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".content-section");

const playAllButton = document.getElementById("playAllButton");
const seeAllButton = document.getElementById("seeAllButton");


// =========================
// RENDU DES TRACKS
// =========================

function createTrackCard(track, index) {
    const card = document.createElement("div");
    card.className = "track-card";

    card.innerHTML = `
        <div class="track-image">
            <img src="${track.thumbnail}" alt="${track.title}">
            <button class="track-play-button" aria-label="Lire ${track.title}">
                <span>▶</span>
            </button>
        </div>

        <div class="track-info">
            <h3>${track.title}</h3>
            <p>${track.artist}</p>
        </div>

        <button class="track-favorite-button" aria-label="Ajouter aux favoris">
            ${favorites.includes(index) ? "♥" : "♡"}
        </button>
    `;

    card.addEventListener("click", (event) => {
        if (event.target.closest(".track-favorite-button")) {
            return;
        }

        playTrack(index);
    });

    const playTrackButton = card.querySelector(".track-play-button");

    playTrackButton.addEventListener("click", (event) => {
        event.stopPropagation();
        playTrack(index);
    });

    const favoriteTrackButton = card.querySelector(".track-favorite-button");

    favoriteTrackButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleFavorite(index);
    });

    return card;
}


function renderTracks() {
    if (!tracksContainer) return;

    tracksContainer.innerHTML = "";

    tracks.forEach((track, index) => {
        tracksContainer.appendChild(
            createTrackCard(track, index)
        );
    });
}


// =========================
// FAVORIS
// =========================

function renderFavorites() {
    if (!favoritesContainer) return;

    favoritesContainer.innerHTML = "";

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">♡</div>
                <h3>No favorites yet</h3>
                <p>Add tracks to your favorites to find them here.</p>
            </div>
        `;

        return;
    }

    favorites.forEach((index) => {
        if (!tracks[index]) return;

        favoritesContainer.appendChild(
            createTrackCard(tracks[index], index)
        );
    });
}


function toggleFavorite(index) {
    if (favorites.includes(index)) {
        favorites = favorites.filter(
            favoriteIndex => favoriteIndex !== index
        );
    } else {
        favorites.push(index);
    }

    localStorage.setItem(
        "waveifyFavorites",
        JSON.stringify(favorites)
    );

    renderTracks();
    renderFavorites();
    updatePlayerFavorite();
}


function updatePlayerFavorite() {
    if (!favoriteButton) return;

    favoriteButton.textContent =
        favorites.includes(currentTrackIndex) ? "♥" : "♡";

    favoriteButton.classList.toggle(
        "active",
        favorites.includes(currentTrackIndex)
    );
}


// =========================
// SHUFFLE AMÉLIORÉ
// =========================

function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [
            result[j],
            result[i]
        ];
    }

    return result;
}


function resetShuffleQueue() {
    shuffleQueue = tracks
        .map((_, index) => index)
        .filter(index => index !== currentTrackIndex);

    shuffleQueue = shuffleArray(shuffleQueue);
}


function getShuffleNextIndex() {
    if (shuffleQueue.length === 0) {
        resetShuffleQueue();
    }

    return shuffleQueue.shift();
}


// =========================
// LECTURE
// =========================

function loadTrack(index, autoplay = true) {
    if (!tracks[index]) return;

    const track = tracks[index];

    currentTrackIndex = index;

    if (player) {
        player.loadVideoById(track.id);

        if (!autoplay) {
            player.pauseVideo();
        }
    }

    if (playerTitle) {
        playerTitle.textContent = track.title;
    }

    if (playerArtist) {
        playerArtist.textContent = track.artist;
    }

    if (playerThumbnail) {
        playerThumbnail.src = track.thumbnail;
    }

    updatePlayerFavorite();
}


function playTrack(index, fromShuffle = false) {
    if (!tracks[index]) return;

    currentTrackIndex = index;

    // Si l'utilisateur choisit manuellement un morceau,
    // on recommence un nouveau cycle aléatoire.
    if (isShuffle && !fromShuffle) {
        shuffleQueue = [];
    }

    loadTrack(index, true);

    if (player) {
        player.playVideo();
    }

    isPlaying = true;
    updatePlayButton();
    updatePlayerFavorite();
}


function togglePlay() {
    if (!player) return;

    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}


function nextTrack() {
    if (tracks.length === 0) return;

    if (isShuffle) {
        const nextIndex = getShuffleNextIndex();

        if (nextIndex !== undefined) {
            playTrack(nextIndex, true);
        }

        return;
    }

    let nextIndex = currentTrackIndex + 1;

    if (nextIndex >= tracks.length) {
        nextIndex = 0;
    }

    playTrack(nextIndex);
}


function previousTrack() {
    if (tracks.length === 0) return;

    if (isShuffle) {
        // En mode aléatoire, on revient simplement au morceau précédent
        // dans le cycle lorsque cela est possible.
        const previousIndex =
            currentTrackIndex - 1 >= 0
                ? currentTrackIndex - 1
                : tracks.length - 1;

        playTrack(previousIndex);
        return;
    }

    let previousIndex = currentTrackIndex - 1;

    if (previousIndex < 0) {
        previousIndex = tracks.length - 1;
    }

    playTrack(previousIndex);
}


function playAll() {
    if (tracks.length === 0) return;

    playTrack(0);
}


// =========================
// BOUTONS
// =========================

function updatePlayButton() {
    if (!playButton) return;

    playButton.textContent = isPlaying ? "❚❚" : "▶";
}


if (playButton) {
    playButton.addEventListener("click", togglePlay);
}


if (previousButton) {
    previousButton.addEventListener("click", previousTrack);
}


if (nextButton) {
    nextButton.addEventListener("click", nextTrack);
}


if (shuffleButton) {
    shuffleButton.addEventListener("click", () => {
        isShuffle = !isShuffle;

        shuffleButton.classList.toggle(
            "active",
            isShuffle
        );

        // Nouveau cycle aléatoire à chaque activation.
        shuffleQueue = [];

        if (isShuffle) {
            resetShuffleQueue();
        }
    });
}


if (repeatButton) {
    repeatButton.addEventListener("click", () => {
        isRepeat = !isRepeat;

        repeatButton.classList.toggle(
            "active",
            isRepeat
        );
    });
}


if (favoriteButton) {
    favoriteButton.addEventListener("click", () => {
        toggleFavorite(currentTrackIndex);
    });
}


// =========================
// PROGRESSION
// =========================

function updateProgress() {
    if (!player || !player.getCurrentTime) return;

    try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();

        if (!duration || duration <= 0) return;

        const percentage =
            (currentTime / duration) * 100;

        if (progressBar) {
            progressBar.value = percentage;
        }

        if (currentTimeElement) {
            currentTimeElement.textContent =
                formatTime(currentTime);
        }

        if (totalTimeElement) {
            totalTimeElement.textContent =
                formatTime(duration);
        }
    } catch (error) {
        // Le player YouTube n'est pas encore prêt.
    }
}


function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}


function seek() {
    if (!player || !player.getDuration) return;

    const duration = player.getDuration();

    if (!duration || duration <= 0) return;

    const time =
        (Number(progressBar.value) / 100) * duration;

    player.seekTo(time, true);
}


if (progressBar) {
    progressBar.addEventListener("input", seek);
}


setInterval(updateProgress, 500);


// =========================
// VOLUME
// =========================

function updateVolume() {
    if (!player || !volumeSlider) return;

    player.setVolume(
        Number(volumeSlider.value)
    );
}


if (volumeSlider) {
    volumeSlider.addEventListener(
        "input",
        updateVolume
    );
}


// =========================
// NAVIGATION
// =========================

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.toggle(
            "active",
            section.id === sectionId
        );
    });

    navItems.forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.section === sectionId
        );
    });
}


navItems.forEach(item => {
    item.addEventListener("click", () => {
        const sectionId = item.dataset.section;

        if (sectionId) {
            showSection(sectionId);
        }

        if (window.innerWidth <= 900) {
            closeMobileMenu();
        }
    });
});


if (playAllButton) {
    playAllButton.addEventListener(
        "click",
        playAll
    );
}


if (seeAllButton) {
    seeAllButton.addEventListener("click", () => {
        showSection("allTracks");
    });
}


// =========================
// MENU MOBILE
// =========================

function openMobileMenu() {
    if (sidebar) {
        sidebar.classList.add("open");
    }

    if (overlay) {
        overlay.classList.add("active");
    }

    document.body.classList.add("menu-open");
}


function closeMobileMenu() {
    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

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
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }
    );
}


if (overlay) {
    overlay.addEventListener(
        "click",
        closeMobileMenu
    );
}


// =========================
// YOUTUBE API
// =========================

const youtubeScript =
    document.createElement("script");

youtubeScript.src =
    "https://www.youtube.com/iframe_api";

document.head.appendChild(youtubeScript);


window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("youtubePlayer", {
        height: "1",
        width: "1",
        videoId: tracks[0].id,

        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0
        },

        events: {
            onReady: function (event) {
                if (volumeSlider) {
                    event.target.setVolume(
                        Number(volumeSlider.value)
                    );
                }

                loadTrack(0, false);
            },

            onStateChange: function (event) {
                handlePlayerState(event.data);
            }
        }
    });
};


// =========================
// ÉTAT DU PLAYER YOUTUBE
// =========================

function handlePlayerState(state) {
    if (state === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updatePlayButton();
    }

    if (state === YT.PlayerState.PAUSED) {
        isPlaying = false;
        updatePlayButton();
    }

    if (state === YT.PlayerState.ENDED) {
        isPlaying = false;

        if (isRepeat) {
            player.seekTo(0, true);
            player.playVideo();
            isPlaying = true;
            updatePlayButton();
        } else {
            nextTrack();
        }
    }
}


// =========================
// INITIALISATION
// =========================

renderTracks();
renderFavorites();
updatePlayButton();
updatePlayerFavorite();
