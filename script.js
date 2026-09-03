/* =========================================================
   WAVEIFY
   Music player
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


/* ================= YOUTUBE ID ================= */

function getYouTubeId(url) {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname
                .replace("/", "")
                .split("?")[0];
        }

        if (
            parsed.hostname.includes("youtube.com") &&
            parsed.searchParams.get("v")
        ) {
            return parsed.searchParams.get("v");
        }

        return "";
    } catch (error) {
        console.error("URL YouTube invalide :", url);
        return "";
    }
}


/* ================= TRACK DATA ================= */

const tracks = YOUTUBE_LINKS
    .map((url, index) => {
        const id = getYouTubeId(url);

        return {
            id,
            url,

            title:
                `Track ${String(index + 1).padStart(2, "0")}`,

            artist: "Waveify",

            thumbnail:
                `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        };
    })
    .filter(track => track.id);


/* ================= STATE ================= */

let currentTrackIndex = 0;

let player = null;

let isPlaying = false;
let isShuffle = false;
let isRepeat = false;


/* ================= FAVORITES ================= */

let favorites = [];

try {
    favorites = JSON.parse(
        localStorage.getItem("waveifyFavorites") || "[]"
    );
} catch (error) {
    favorites = [];
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

const progressBar =
    document.getElementById("progressBar");

const progressFill =
    document.getElementById("progressFill");

const progressThumb =
    document.getElementById("progressThumb");

const currentTimeElement =
    document.getElementById("currentTime");

const durationElement =
    document.getElementById("duration");

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

const notificationButton =
    document.getElementById("notificationButton");

const playAllButton =
    document.getElementById("playAllButton");

const seeAllButton =
    document.getElementById("seeAllButton");


/* ================= FORMAT TIME ================= */

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}


/* ================= ESCAPE HTML ================= */

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ================= CREATE CARD ================= */

function createTrackCard(track, index) {

    const isFavorite =
        favorites.includes(track.id);

    const card =
        document.createElement("article");

    card.className = "music-card";

    card.dataset.index = index;

    card.innerHTML = `
        <div class="card-cover">

            <img
                src="${escapeHtml(track.thumbnail)}"
                alt="${escapeHtml(track.title)}"
                loading="lazy"
            >

            <button
                class="card-play"
                aria-label="Lire ${escapeHtml(track.title)}"
            >
                ▶
            </button>

        </div>

        <div class="card-content">

            <div class="card-title-row">

                <strong class="card-title">
                    ${escapeHtml(track.title)}
                </strong>

                <button
                    class="card-heart ${isFavorite ? "favorite" : ""}"
                    data-favorite="${escapeHtml(track.id)}"
                    aria-label="${
                        isFavorite
                            ? "Retirer des favoris"
                            : "Ajouter aux favoris"
                    }"
                >
                    ${isFavorite ? "♥" : "♡"}
                </button>

            </div>

            <div class="card-artist">
                ${escapeHtml(track.artist)}
            </div>

        </div>
    `;


    /* ===== BOUTON PLAY ===== */

    const play =
        card.querySelector(".card-play");

    if (play) {
        play.addEventListener(
            "click",
            event => {
                event.stopPropagation();
                playTrack(index);
            }
        );
    }


    /* ===== BOUTON FAVORI ===== */

    const heart =
        card.querySelector(".card-heart");

    if (heart) {
        heart.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                toggleFavorite(track.id);
            }
        );
    }


    /* ===== DOUBLE CLIC ===== */

    card.addEventListener(
        "dblclick",
        () => {
            playTrack(index);
        }
    );


    return card;
}


/* ================= RENDER TRACKS ================= */

function renderTracks() {

    if (musicGrid) {
        musicGrid.innerHTML = "";

        tracks.forEach((track, index) => {

            musicGrid.appendChild(
                createTrackCard(track, index)
            );

        });
    }


    if (libraryGrid) {
        libraryGrid.innerHTML = "";

        tracks.forEach((track, index) => {

            libraryGrid.appendChild(
                createTrackCard(track, index)
            );

        });
    }
}


/* ================= RENDER FAVORITES ================= */

function renderFavorites() {

    if (!favoritesGrid) {
        return;
    }

    favoritesGrid.innerHTML = "";

    const favoriteTracks =
        tracks.filter(track =>
            favorites.includes(track.id)
        );


    /* ===== COMPTEUR ===== */

    if (favoriteCount) {

        favoriteCount.textContent =
            `${favoriteTracks.length} morceau${
                favoriteTracks.length > 1
                    ? "x"
                    : ""
            }`;
    }


    /* ===== AUCUN FAVORI ===== */

    if (favoriteTracks.length === 0) {

        if (emptyFavorites) {
            emptyFavorites.classList.add("show");
        }

        return;
    }


    /* ===== FAVORIS PRÉSENTS ===== */

    if (emptyFavorites) {
        emptyFavorites.classList.remove("show");
    }


    favoriteTracks.forEach(track => {

        const index =
            tracks.findIndex(
                item => item.id === track.id
            );

        favoritesGrid.appendChild(
            createTrackCard(track, index)
        );

    });
}


/* ================= FAVORITES ================= */

function toggleFavorite(trackId) {

    if (favorites.includes(trackId)) {

        favorites =
            favorites.filter(
                id => id !== trackId
            );

    } else {

        favorites.push(trackId);

    }


    localStorage.setItem(
        "waveifyFavorites",
        JSON.stringify(favorites)
    );


    renderTracks();
    renderFavorites();

    updatePlayerFavorite();
}


/* ================= PLAYER FAVORITE ================= */

function updatePlayerFavorite() {

    if (!playerFavorite) {
        return;
    }

    const track =
        tracks[currentTrackIndex];

    if (!track) {
        return;
    }

    const isFavorite =
        favorites.includes(track.id);


    playerFavorite.textContent =
        isFavorite ? "♥" : "♡";


    playerFavorite.classList.toggle(
        "favorite",
        isFavorite
    );


    playerFavorite.setAttribute(
        "aria-label",
        isFavorite
            ? "Retirer des favoris"
            : "Ajouter aux favoris"
    );


    playerFavorite.title =
        isFavorite
            ? "Retirer des favoris"
            : "Ajouter aux favoris";
}


/* ================= LOAD TRACK ================= */

function loadTrack(index, autoplay = false) {

    if (!tracks[index]) {
        return;
    }

    currentTrackIndex = index;

    const track =
        tracks[currentTrackIndex];


    /* ===== INFORMATIONS ===== */

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

        playerCover.alt =
            track.title;
    }


    /* ===== RESET PROGRESSION ===== */

    if (currentTimeElement) {
        currentTimeElement.textContent =
            "0:00";
    }

    if (durationElement) {
        durationElement.textContent =
            "0:00";
    }

    if (progressFill) {
        progressFill.style.width =
            "0%";
    }

    if (progressThumb) {
        progressThumb.style.left =
            "0%";
    }


    updatePlayerFavorite();


    /* ===== YOUTUBE ===== */

    if (!player) {
        return;
    }


    if (autoplay) {

        player.loadVideoById(
            track.id
        );

        isPlaying = true;

    } else {

        player.cueVideoById(
            track.id
        );

        isPlaying = false;
    }


    updatePlayButton();
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

        playerCover.alt =
            track.title;
    }


    updatePlayerFavorite();


    if (player) {

        player.loadVideoById(
            track.id
        );

        isPlaying = true;

    }


    updatePlayButton();
}


/* ================= PLAY / PAUSE ================= */

function togglePlay() {

    if (!player) {
        return;
    }

    if (!tracks[currentTrackIndex]) {
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

    if (!tracks.length) {
        return;
    }


    /* ===== MODE ALÉATOIRE ===== */

    if (isShuffle) {

        let nextIndex;

        do {

            nextIndex =
                Math.floor(
                    Math.random() *
                    tracks.length
                );

        } while (
            nextIndex === currentTrackIndex &&
            tracks.length > 1
        );


        playTrack(nextIndex);

        return;
    }


    /* ===== MODE NORMAL ===== */

    let nextIndex =
        currentTrackIndex + 1;


    if (nextIndex >= tracks.length) {
        nextIndex = 0;
    }


    playTrack(nextIndex);
}


/* ================= PREVIOUS ================= */

function previousTrack() {

    if (player) {

        try {

            const currentTime =
                player.getCurrentTime();


            if (currentTime > 3) {

                player.seekTo(
                    0,
                    true
                );

                return;
            }

        } catch (error) {
            console.warn(
                "Impossible de récupérer le temps actuel."
            );
        }
    }


    let previousIndex =
        currentTrackIndex - 1;


    if (previousIndex < 0) {

        previousIndex =
            tracks.length - 1;
    }


    playTrack(previousIndex);
}


/* ================= PLAY ALL ================= */

function playAll() {

    if (!tracks.length) {
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
        isPlaying
            ? "Ⅱ"
            : "▶";


    if (playerElement) {

        playerElement.classList.toggle(
            "playing",
            isPlaying
        );
    }


    playButton.setAttribute(
        "aria-label",
        isPlaying
            ? "Pause"
            : "Lecture"
    );


    playButton.title =
        isPlaying
            ? "Pause"
            : "Lecture";
}


/* ================= PROGRESS ================= */

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
            !Number.isFinite(duration) ||
            duration <= 0
        ) {
            return;
        }


        const percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    (current / duration) * 100
                )
            );


        if (progressFill) {

            progressFill.style.width =
                `${percentage}%`;
        }


        if (progressThumb) {

            progressThumb.style.left =
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


    } catch (error) {

        // Le player YouTube n'est pas encore prêt.

    }
}


/* ================= SEEK ================= */

function seek(event) {

    if (!player || !progressBar) {
        return;
    }


    try {

        const rect =
            progressBar.getBoundingClientRect();


        if (!rect.width) {
            return;
        }


        const percentage =
            Math.min(
                1,
                Math.max(
                    0,
                    (event.clientX - rect.left) /
                    rect.width
                )
            );


        const duration =
            player.getDuration();


        if (
            Number.isFinite(duration) &&
            duration > 0
        ) {

            player.seekTo(
                duration * percentage,
                true
            );
        }


    } catch (error) {

        console.warn(
            "Impossible de déplacer la lecture."
        );
    }
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


/* ================= NAVIGATION ================= */

function showSection(section) {

    const home =
        document.getElementById(
            "homeSection"
        );

    const library =
        document.getElementById(
            "librarySection"
        );

    const favoritesSection =
        document.getElementById(
            "favoritesSection"
        );


    if (!home || !library || !favoritesSection) {
        return;
    }


    home.style.display = "none";
    library.style.display = "none";
    favoritesSection.style.display = "none";


    if (section === "home") {

        home.style.display =
            "block";
    }


    if (section === "library") {

        library.style.display =
            "block";
    }


    if (section === "favorites") {

        favoritesSection.style.display =
            "block";

        renderFavorites();
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === section
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= NAV BUTTONS ================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showSection(
                    button.dataset.section
                );


                /* Fermer le menu mobile */

                if (sidebar) {

                    sidebar.classList.remove(
                        "open"
                    );
                }

            }
        );

    });


/* ================= PLAY ALL ================= */

if (playAllButton) {

    playAllButton.addEventListener(
        "click",
        playAll
    );
}


/* ================= SEE ALL ================= */

if (seeAllButton) {

    seeAllButton.addEventListener(
        "click",
        () => {

            showSection("library");

        }
    );
}


/* ================= PLAYER BUTTONS ================= */

if (playButton) {

    playButton.addEventListener(
        "click",
        togglePlay
    );
}


if (nextButton) {

  
