/* =========================================================
WAVEIFY — JAVASCRIPT
========================================================= */

/* ================= YOUTUBE LINKS ================= */

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

/* ================= HELPERS ================= */

function getYouTubeId(url) {
    try {
        return new URL(url).searchParams.get("v");
    } catch {
        return "";
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

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* ================= TRACKS ================= */

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

/* ================= STATE ================= */

let currentTrackIndex = 0;
let player = null;

let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

let favoriteTracks = [];

try {
    favoriteTracks =
        JSON.parse(
            localStorage.getItem("waveifyFavorites")
        ) || [];
} catch {
    favoriteTracks = [];
}

/* ================= DOM ================= */

const musicGrid =
    document.getElementById("musicGrid");

const libraryGrid =
    document.getElementById("libraryGrid");

const favoritesGrid =
    document.getElementById("favoritesGrid");

const playerElement =
    document.querySelector(".player");

const playerCover =
    document.getElementById("playerCover");

const playerTitle =
    document.getElementById("playerTitle");

const playerArtist =
    document.getElementById("playerArtist");

const playerFavorite =
    document.getElementById("playerFavorite");

const playButton =
    document.getElementById("playButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const shuffleButton =
    document.getElementById("shuffleButton");

const repeatButton =
    document.getElementById("repeatButton");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const progressBar =
    document.getElementById("progressBar");

const progressFill =
    document.getElementById("progressFill");

const progressThumb =
    document.getElementById("progressThumb");

const volumeSlider =
    document.getElementById("volumeSlider");

const favoriteCount =
    document.getElementById("favoriteCount");

const emptyFavorites =
    document.getElementById("emptyFavorites");

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.querySelector(".sidebar");

/* ================= CARD ================= */

function createTrackCard(track, index) {

    const card =
        document.createElement("article");

    card.className = "music-card";

    const isFavorite =
        favoriteTracks.includes(track.id);

    card.innerHTML = `
        <div class="card-cover">

            <img
                src="${escapeHtml(track.thumbnail)}"
                alt="${escapeHtml(track.title)}"
                loading="lazy"
            >

            <button
                class="card-play"
                type="button"
                aria-label="Lire ${escapeHtml(track.title)}"
            >
                ▶
            </button>

        </div>

        <div class="card-content">

            <div class="card-title-row">

                <div class="card-title">
                    ${escapeHtml(track.title)}
                </div>

                <button
                    class="card-heart ${isFavorite ? "favorite" : ""}"
                    type="button"
                    aria-label="Ajouter aux favoris"
                >
                    ${isFavorite ? "♥" : "♡"}
                </button>

            </div>

            <div class="card-artist">
                ${escapeHtml(track.artist)}
            </div>

        </div>
    `;

    const play =
        card.querySelector(".card-play");

    const heart =
        card.querySelector(".card-heart");

    play.addEventListener("click", (event) => {
        event.stopPropagation();
        playTrack(index);
    });

    heart.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleFavorite(track.id);
    });

    card.addEventListener("dblclick", () => {
        playTrack(index);
    });

    return card;
}

/* ================= RENDER TRACKS ================= */

function renderTracks() {

    musicGrid.innerHTML = "";

    tracks.forEach((track, index) => {
        musicGrid.appendChild(
            createTrackCard(track, index)
        );
    });
}

/* ================= FAVORITES ================= */

function renderFavorites() {

    favoritesGrid.innerHTML = "";

    const favoriteList =
        tracks.filter(track =>
            favoriteTracks.includes(track.id)
        );

    favoriteList.forEach(track => {

        const index =
            tracks.findIndex(
                item => item.id === track.id
            );

        favoritesGrid.appendChild(
            createTrackCard(track, index)
        );
    });

    if (favoriteCount) {
        favoriteCount.textContent =
            `${favoriteList.length} morceau${
                favoriteList.length > 1 ? "x" : ""
            }`;
    }

    if (emptyFavorites) {
        emptyFavorites.classList.toggle(
            "show",
            favoriteList.length === 0
        );
    }
}

function toggleFavorite(trackId) {

    const index =
        favoriteTracks.indexOf(trackId);

    if (index >= 0) {
        favoriteTracks.splice(index, 1);
    } else {
        favoriteTracks.push(trackId);
    }

    localStorage.setItem(
        "waveifyFavorites",
        JSON.stringify(favoriteTracks)
    );

    renderTracks();
    renderFavorites();
    updatePlayerFavorite();
}

function updatePlayerFavorite() {

    if (!playerFavorite || !tracks[currentTrackIndex]) {
        return;
    }

    const track =
        tracks[currentTrackIndex];

    const isFavorite =
        favoriteTracks.includes(track.id);

    playerFavorite.textContent =
        isFavorite ? "♥" : "♡";

    playerFavorite.classList.toggle(
        "favorite",
        isFavorite
    );
}

/* ================= LOAD TRACK ================= */

function loadTrack(index, autoplay = true) {

    if (!tracks[index]) {
        return;
    }

    currentTrackIndex = index;

    const track =
        tracks[currentTrackIndex];

    if (playerTitle) {
        playerTitle.textContent =
            track.title;
    }

    if (playerArtist) {
        playerArtist.textContent =
            track.artist;
    }

    if (playerCover) {
        playerCover.src =
            track.thumbnail;
    }

    updatePlayerFavorite();

    if (player) {
        player.loadVideoById(track.id);

        if (!autoplay) {
            player.pauseVideo();
        }
    }
}

/* ================= PLAY TRACK ================= */

function playTrack(index) {

    if (!tracks[index]) {
        return;
    }

    currentTrackIndex = index;

    const track =
        tracks[currentTrackIndex];

    if (playerTitle) {
        playerTitle.textContent =
            track.title;
    }

    if (playerArtist) {
        playerArtist.textContent =
            track.artist;
    }

    if (playerCover) {
        playerCover.src =
            track.thumbnail;
    }

    updatePlayerFavorite();

    if (player) {
        player.loadVideoById(track.id);
        player.playVideo();
    }
}

/* ================= PLAY / PAUSE ================= */

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

/* ================= NEXT ================= */

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

/* ================= PREVIOUS ================= */

function previousTrack() {

    if (!player) {
        return;
    }

    const current =
        player.getCurrentTime();

    if (current > 3) {
        player.seekTo(0, true);
        return;
    }

    const previousIndex =
        (currentTrackIndex - 1 + tracks.length) %
        tracks.length;

    playTrack(previousIndex);
}

/* ================= PLAY ALL ================= */

function playAll() {

    if (tracks.length === 0) {
        return;
    }

    playTrack(0);
}

/* ================= PLAY BUTTON ================= */

function updatePlayButton() {

    if (!playButton) {
        return;
    }

    playButton.textContent =
        isPlaying ? "❚❚" : "▶";

    if (playerElement) {
        playerElement.classList.toggle(
            "playing",
            isPlaying
        );
    }
}

/* ================= PROGRESS ================= */

function updateProgress() {

    if (
        !player ||
        typeof player.getCurrentTime !== "function"
    ) {
        return;
    }

    const current =
        player.getCurrentTime();

    const total =
        player.getDuration();

    if (!total || isNaN(total)) {
        return;
    }

    const percentage =
        (current / total) * 100;

    if (currentTime) {
        currentTime.textContent =
            formatTime(current);
    }

    if (duration) {
        duration.textContent =
            formatTime(total);
    }

    if (progressFill) {
        progressFill.style.width =
            `${percentage}%`;
    }

    if (progressThumb) {
        progressThumb.style.left =
            `${percentage}%`;
    }
}

/* ================= SEEK ================= */

function seek(event) {

    if (
        !player ||
        !progressBar ||
        typeof player.getDuration !== "function"
    ) {
        return;
    }

    const rect =
        progressBar.getBoundingClientRect();

    const position =
        Math.min(
            Math.max(
                (event.clientX - rect.left) /
                rect.width,
                0
            ),
            1
        );

    const total =
        player.getDuration();

    player.seekTo(
        total * position,
        true
    );
}

/* ================= VOLUME ================= */

function updateVolume() {

    if (!player || !volumeSlider) {
        return;
    }

    player.setVolume(
        Number(volumeSlider.value)
    );
}

/* ================= SECTIONS ================= */

function showSection(section) {

    const homeSection =
        document.getElementById("homeSection");

    const librarySection =
        document.getElementById("librarySection");

    const favoritesSection =
        document.getElementById("favoritesSection");

    if (homeSection) {
        homeSection.style.display =
            section === "home" ? "" : "none";
    }

    if (librarySection) {
        librarySection.style.display =
            section === "library" ? "" : "none";
    }

    if (favoritesSection) {
        favoritesSection.style.display =
            section === "favorites" ? "" : "none";
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === section
            );

        });

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* ================= NAVIGATION ================= */

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

/* ================= PLAY ALL BUTTON ================= */

const playAllButton =
    document.getElementById("playAllButton");

if (playAllButton) {
    playAllButton.addEventListener(
        "click",
        playAll
    );
}

/* ================= SEE ALL ================= */

const seeAllButton =
    document.getElementById("seeAllButton");

if (seeAllButton) {
    seeAllButton.addEventListener(
        "click",
        () => showSection("library")
    );
}

/* ================= PLAYER BUTTONS ================= */

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

/* ================= SHUFFLE ================= */

if (shuffleButton) {

    shuffleButton.addEventListener(
        "click",
        () => {

            isShuffle =
                !isShuffle;

            shuffleButton.classList.toggle(
                "active",
                isShuffle
            );

        }
    );

}

/* ================= REPEAT ================= */

if (repeatButton) {

    repeatButton.addEventListener(
        "click",
        () => {

            isRepeat =
                !isRepeat;

            repeatButton.classList.toggle(
                "active",
                isRepeat
            );

        }
    );

}

/* ================= PROGRESS ================= */

if (progressBar) {

    progressBar.addEventListener(
        "click",
        seek
    );

}

/* ================= VOLUME ================= */

if (volumeSlider) {

    volumeSlider.addEventListener(
        "input",
        updateVolume
    );

}

/* ================= PLAYER FAVORITE ================= */

if (playerFavorite) {

    playerFavorite.addEventListener(
        "click",
        () => {

            if (!tracks[currentTrackIndex]) {
                return;
            }

            toggleFavorite(
                tracks[currentTrackIndex].id
            );

        }
    );

}

/* ================= MOBILE MENU ================= */

if (mobileMenu && sidebar) {

    mobileMenu.addEventListener(
        "click",
        () => {
            sidebar.classList.toggle("open");
        }
    );

}

/* ================= YOUTUBE API ================= */

window.onYouTubeIframeAPIReady =
function () {

    player =
        new YT.Player(
            "youtubePlayer",
            {
                height: "1",
                width: "1",

                videoId:
                    tracks[0].id,

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

                    onReady:
                    function (event) {

                        if (volumeSlider) {
                            event.target.setVolume(
                                Number(
                                    volumeSlider.value
                                )
                            );
                        }

                        loadTrack(
                            0,
                            false
                        );
                    },

                    onStateChange:
                    function (event) {
                        handlePlayerState(
                            event.data
                        );
                    }

                }
            }
        );

};

/* ================= PLAYER STATE ================= */

function handlePlayerState(state) {

    if (!window.YT) {
        return;
    }

    if (state === YT.PlayerState.PLAYING) {

        isPlaying = true;

    } else if (
        state === YT.PlayerState.PAUSED
    ) {

        isPlaying = false;

    } else if (
        state === YT.PlayerState.ENDED
    ) {

        isPlaying = false;

        if (isRepeat) {

            if (player) {
                player.seekTo(0, true);
                player.playVideo();
            }

        } else {

            nextTrack();

        }

    }

    updatePlayButton();
}

/* ================= INIT ================= */

renderTracks();
renderFavorites();
updatePlayButton();

setInterval(
    updateProgress,
    500
);

/* ================= YOUTUBE SCRIPT ================= */

const youtubeScript =
    document.createElement("script");

youtubeScript.src =
    "https://www.youtube.com/iframe_api";

document.body.appendChild(
    youtubeScript
);
