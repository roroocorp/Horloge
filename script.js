/* =========================================
   WAVEIFY - SCRIPT
========================================= */

/*
    TES VIDÉOS
*/

const videoLinks = [
    "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=lp-EO5I60KA",
    "https://www.youtube.com/watch?v=hT_nvWreIhg",
    "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    "https://www.youtube.com/watch?v=7wtfhZwyrcc",
    "https://www.youtube.com/watch?v=KQ6zr6kCPj8",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    "https://www.youtube.com/watch?v=60ItHLz5WEA",
    "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=hT_nvWreIhg",
    "https://www.youtube.com/watch?v=lp-EO5I60KA",
    "https://www.youtube.com/watch?v=7wtfhZwyrcc",
    "https://www.youtube.com/watch?v=KQ6zr6kCPj8",
    "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    "https://www.youtube.com/watch?v=RgKAFK5djSk",
    "https://www.youtube.com/watch?v=09R8_2nJtjg",
    "https://www.youtube.com/watch?v=YQHsXMglC9A",
    "https://www.youtube.com/watch?v=OPf0YbXqDm0",
    "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    "https://www.youtube.com/watch?v=kJQP7kiw5Fk"
];


/* =========================================
   CONFIGURATION
========================================= */

const STORAGE_KEY = "waveify-favorites";


/* =========================================
   VARIABLES
========================================= */

let player = null;

let currentIndex = -1;

let currentPage = "home";

let favorites = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);


/* =========================================
   CRÉATION DE LA LISTE
========================================= */

/*
    On retire les doublons.

    Les mêmes vidéos apparaissent plusieurs fois
    dans ta liste originale.
*/

const uniqueLinks = [...new Set(videoLinks)];


/*
    Conversion URL YouTube -> ID
*/

function getYouTubeId(url) {

    try {

        const parsedURL = new URL(url);

        if (parsedURL.hostname.includes("youtu.be")) {
            return parsedURL.pathname.substring(1);
        }

        return parsedURL.searchParams.get("v");

    } catch (error) {

        return null;
    }
}


/*
    Création des musiques
*/

const tracks = uniqueLinks
    .map((url, index) => {

        const id = getYouTubeId(url);

        if (!id) {
            return null;
        }

        return {
            id: id,
            url: url,
            title: `Musique ${index + 1}`,
            artist: "Waveify",
            thumbnail:
                `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        };

    })
    .filter(Boolean);


/* =========================================
   DOM
========================================= */

const homeGrid =
    document.getElementById("home-music-grid");

const libraryGrid =
    document.getElementById("library-music-grid");

const favoritesGrid =
    document.getElementById("favorites-music-grid");

const emptyFavorites =
    document.getElementById("empty-favorites");

const playerTitle =
    document.getElementById("player-title");

const playerArtist =
    document.getElementById("player-artist");

const playerThumbnail =
    document.getElementById("player-thumbnail");

const playButton =
    document.getElementById("play-btn");

const previousButton =
    document.getElementById("previous-btn");

const nextButton =
    document.getElementById("next-btn");

const progressBar =
    document.getElementById("progress-bar");

const volumeBar =
    document.getElementById("volume-bar");

const currentTimeElement =
    document.getElementById("current-time");

const durationElement =
    document.getElementById("duration");


/* =========================================
   AFFICHAGE DES MUSIQUES
========================================= */

function renderTracks(container, list) {

    container.innerHTML = "";

    list.forEach((track) => {

        const originalIndex =
            tracks.findIndex(
                item => item.id === track.id
            );

        const card =
            document.createElement("article");

        card.className = "music-card";

        const isFavorite =
            favorites.includes(track.id);

        card.innerHTML = `

            <div class="music-thumbnail">

                <img
                    src="${track.thumbnail}"
                    alt="${track.title}"
                    loading="lazy"
                >

                <button
                    class="card-play"
                    aria-label="Lire ${track.title}"
                >
                    ▶️
                </button>

            </div>

            <button
                class="favorite-btn ${
                    isFavorite ? "is-favorite" : ""
                }"
                aria-label="Ajouter aux favoris"
            >
                ${isFavorite ? "❤️" : "♡"}
            </button>

            <div class="music-title">
                ${track.title}
            </div>

            <div class="music-artist">
                ${track.artist}
            </div>
        `;


        /*
            Lecture
        */

        const play =
            card.querySelector(".card-play");

        play.addEventListener("click", (event) => {

            event.stopPropagation();

            playTrack(originalIndex);

        });


        /*
            Clic sur la carte
        */

        card.addEventListener("click", () => {

            playTrack(originalIndex);

        });


        /*
            Favori
        */

        const favorite =
            card.querySelector(".favorite-btn");

        favorite.addEventListener("click", (event) => {

            event.stopPropagation();

            toggleFavorite(track.id);

        });


        container.appendChild(card);

    });
}


/* =========================================
   RAFRAÎCHIR LES LISTES
========================================= */

function renderAll() {

    renderTracks(
        homeGrid,
        tracks
    );

    renderTracks(
        libraryGrid,
        tracks
    );

    const favoriteTracks =
        tracks.filter(track =>
            favorites.includes(track.id)
        );

    renderTracks(
        favoritesGrid,
        favoriteTracks
    );


    if (favoriteTracks.length === 0) {

        emptyFavorites.classList.add("visible");

    } else {

        emptyFavorites.classList.remove("visible");

    }
}


/* =========================================
   FAVORIS
========================================= */

function toggleFavorite(id) {

    if (favorites.includes(id)) {

        favorites =
            favorites.filter(
                favoriteId => favoriteId !== id
            );

    } else {

        favorites.push(id);

    }


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(favorites)
    );


    renderAll();
}


/* =========================================
   NAVIGATION
========================================= */

const navigationButtons =
    document.querySelectorAll(".nav-btn");

const pages =
    document.querySelectorAll(".page");


navigationButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page =
            button.dataset.page;

        changePage(page);

    });

});


function changePage(pageName) {

    currentPage = pageName;


    navigationButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );

    });


    pages.forEach(page => {

        page.classList.remove("active");

    });


    const selectedPage =
        document.getElementById(
            `${pageName}-page`
        );

    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    /*
        Sur mobile, revenir en haut
    */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   YOUTUBE API
========================================= */

function onYouTubeIframeAPIReady() {

    player = new YT.Player(
        "youtube-player",
        {

            height: "1",
            width: "1",

            videoId: "",

            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                rel: 0
            },

            events: {

                onReady: onPlayerReady,

                onStateChange:
                    onPlayerStateChange

            }

        }
    );
}


/*
    Player prêt
*/

function onPlayerReady() {

    volumeBar.value = 100;

    player.setVolume(100);

}


/* =========================================
   LECTURE
========================================= */

function playTrack(index) {

    if (!tracks[index]) {
        return;
    }

    currentIndex = index;

    const track =
        tracks[currentIndex];


    /*
        Informations du lecteur
    */

    playerTitle.textContent =
        track.title;

    playerArtist.textContent =
        track.artist;

    playerThumbnail.src =
        track.thumbnail;


    /*
        YouTube
    */

    if (!player) {
        return;
    }


    player.loadVideoById(
        track.id
    );


    updatePlayButton(true);

}


/* =========================================
   PLAY / PAUSE
========================================= */

playButton.addEventListener(
    "click",
    () => {

        if (!player) {
            return;
        }


        if (currentIndex === -1) {

            playTrack(0);

            return;
        }


        const state =
            player.getPlayerState();


        if (
            state === YT.PlayerState.PLAYING
        ) {

            player.pauseVideo();

        } else {

            player.playVideo();

        }

    }
);


/* =========================================
   BOUTON PRÉCÉDENT
========================================= */

previousButton.addEventListener(
    "click",
    () => {

        if (tracks.length === 0) {
            return;
        }


        if (currentIndex <= 0) {

            currentIndex =
                tracks.length - 1;

        } else {

            currentIndex--;

        }


        playTrack(currentIndex);

    }
);


/* =========================================
   BOUTON SUIVANT
========================================= */

nextButton.addEventListener(
    "click",
    () => {

        if (tracks.length === 0) {
            return;
        }


        if (
            currentIndex === -1 ||
            currentIndex >= tracks.length - 1
        ) {

            currentIndex = 0;

        } else {

            currentIndex++;

        }


        playTrack(currentIndex);

    }
);


/* =========================================
   ÉTAT DU PLAYER
========================================= */

function onPlayerStateChange(event) {

    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        updatePlayButton(true);

    }


    if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        updatePlayButton(false);

    }


    /*
        Quand la musique est terminée,
        passer automatiquement à la suivante.
    */

    if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        nextButton.click();

    }

}


/* =========================================
   BOUTON PLAY
========================================= */

function updatePlayButton(isPlaying) {

    playButton.textContent =
        isPlaying ? "⏸️" : "▶️";

    playButton.setAttribute(
        "aria-label",
        isPlaying ? "Pause" : "Lecture"
    );

}


/* =========================================
   BARRE DE PROGRESSION
========================================= */

setInterval(() => {

    if (
        !player ||
        currentIndex === -1
    ) {
        return;
    }


    try {

        const current =
            player.getCurrentTime();

        const duration =
            player.getDuration();


        if (
            duration &&
            duration > 0
        ) {

            const percentage =
                (current / duration) * 100;

            progressBar.value =
                percentage;

            currentTimeElement.textContent =
                formatTime(current);

            durationElement.textContent =
                formatTime(duration);

        }

    } catch (error) {

        // Player pas encore prêt.

    }

}, 500);


/* =========================================
   CHANGEMENT DE POSITION
========================================= */

progressBar.addEventListener(
    "input",
    () => {

        if (!player) {
            return;
        }


        try {

            const duration =
                player.getDuration();

            const newTime =
                (progressBar.value / 100)
                * duration;

            player.seekTo(
                newTime,
                true
            );

        } catch (error) {

            // Player pas encore prêt.

        }

    }
);


/* =========================================
   VOLUME
========================================= */

volumeBar.addEventListener(
    "input",
    () => {

        if (!player) {
            return;
        }


        player.setVolume(
            Number(volumeBar.value)
        );

    }
);


/* =========================================
   FORMAT DU TEMPS
========================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }


    seconds =
        Math.floor(seconds);


    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;


    return `${minutes}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;

}


/* =========================================
   INITIALISATION
========================================= */

renderAll();

changePage("home");
