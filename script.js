/* =========================================================
   WAVEIFY
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   TES 36 MUSIQUES YOUTUBE
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



/* =========================================================
   DONNÉES DES MORCEAUX
========================================================= */

const tracks = YOUTUBE_LINKS.map((url, index) => {

    const id =
        new URL(url).searchParams.get("v");

    return {

        id,

        title:
            `Track ${String(index + 1).padStart(2, "0")}`,

        artist:
            "Waveify",

        thumbnail:
            `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

    };

});



/* =========================================================
   ÉTAT DU LECTEUR
========================================================= */

let currentIndex = 0;

let player = null;

let isPlayerReady = false;

let isPlaying = false;

let shuffleEnabled = false;

let repeatEnabled = false;

let progressTimer = null;



/* =========================================================
   ÉLÉMENTS HTML
========================================================= */

const musicGrid =
    document.getElementById("musicGrid");

const libraryGrid =
    document.getElementById("libraryGrid");

const favoritesGrid =
    document.getElementById("favoritesGrid");

const playerCover =
    document.getElementById("playerCover");

const playerTitle =
    document.getElementById("playerTitle");

const playerArtist =
    document.getElementById("playerArtist");

const playerHeart =
    document.getElementById("playerHeart");

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

const currentTimeElement =
    document.getElementById("currentTime");

const durationElement =
    document.getElementById("duration");

const volumeBar =
    document.getElementById("volumeBar");

const heroPlayButton =
    document.getElementById("heroPlayButton");

const seeAllButton =
    document.getElementById("seeAllButton");



/* =========================================================
   YOUTUBE IFRAME API
========================================================= */

const youtubeScript =
    document.createElement("script");

youtubeScript.src =
    "https://www.youtube.com/iframe_api";

document.head.appendChild(youtubeScript);



/* =========================================================
   INITIALISATION YOUTUBE
========================================================= */

window.onYouTubeIframeAPIReady = function () {

    player = new YT.Player(
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

                rel: 0

            },

            events: {

                onReady:
                    onPlayerReady,

                onStateChange:
                    onPlayerStateChange

            }

        }
    );

};



/* =========================================================
   PLAYER READY
========================================================= */

function onPlayerReady(event) {

    isPlayerReady = true;

    event.target.setVolume(
        Number(volumeBar.value)
    );

    updatePlayerUI();

}



/* =========================================================
   ÉTAT YOUTUBE
========================================================= */

function onPlayerStateChange(event) {

    if (!window.YT) {
        return;
    }


    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        isPlaying = true;

        startProgress();

        updatePlayButton();

    }


    else if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        isPlaying = false;

        stopProgress();

        updatePlayButton();

    }


    else if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        isPlaying = false;

        stopProgress();

        if (repeatEnabled) {

            playTrack(
                currentIndex,
                true
            );

        } else {

            nextTrack(true);

        }

    }

}



/* =========================================================
   ID YOUTUBE
========================================================= */

function getYoutubeId(url) {

    try {

        return new URL(url)
            .searchParams
            .get("v");

    } catch {

        return null;

    }

}



/* =========================================================
   CRÉATION DES CARTES
========================================================= */

function createTrackCard(track, index) {

    const card =
        document.createElement("article");

    card.className =
        "music-card";


    const isFavorite =
        getFavorites().includes(index);


    card.innerHTML = `

        <div class="card-cover-wrapper">

            <img
                class="card-cover"
                src="${track.thumbnail}"
                alt="${track.title}"
                loading="lazy"
            >

            <button
                class="card-play"
                data-play="${index}"
                aria-label="Lire"
            >
                ▶
            </button>

            <button
                class="card-heart ${isFavorite ? "active" : ""}"
                data-favorite="${index}"
                aria-label="Favori"
            >
                ${isFavorite ? "♥" : "♡"}
            </button>

        </div>


        <div class="card-content">

            <strong class="card-title">
                ${track.title}
            </strong>

            <span class="card-artist">
                ${track.artist}
            </span>

        </div>

    `;


    const play =
        card.querySelector(
            "[data-play]"
        );


    const heart =
        card.querySelector(
            "[data-favorite]"
        );


    play.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            playTrack(index);

        }
    );


    heart.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleFavorite(index);

        }
    );


    card.addEventListener(
        "dblclick",
        () => {

            playTrack(index);

        }
    );


    return card;

}



/* =========================================================
   AFFICHER LES MORCEAUX
========================================================= */

function renderTracks() {

    musicGrid.innerHTML = "";

    libraryGrid.innerHTML = "";


    tracks.forEach(
        (track, index) => {

            musicGrid.appendChild(
                createTrackCard(
                    track,
                    index
                )
            );


            libraryGrid.appendChild(
                createTrackCard(
                    track,
                    index
                )
            );

        }
    );


    renderFavorites();

}



/* =========================================================
   FAVORIS
========================================================= */

function getFavorites() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "waveifyFavorites"
            )
        ) || [];

    } catch {

        return [];

    }

}



function saveFavorites(favorites) {

    localStorage.setItem(
        "waveifyFavorites",
        JSON.stringify(favorites)
    );

}



/* =========================================================
   AJOUT / SUPPRESSION FAVORI
========================================================= */

function toggleFavorite(index) {

    let favorites =
        getFavorites();


    if (favorites.includes(index)) {

        favorites =
            favorites.filter(
                item => item !== index
            );

    } else {

        favorites.push(index);

    }


    saveFavorites(favorites);


    renderTracks();


    updatePlayerFavorite();

}



/* =========================================================
   AFFICHER FAVORIS
========================================================= */

function renderFavorites() {

    const favorites =
        getFavorites();


    favoritesGrid.innerHTML = "";


    if (favorites.length === 0) {

        favoritesGrid.innerHTML = `

            <div class="empty-message">

                Aucun favori pour le moment ❤️
                <br>
                Ajoute des morceaux avec le cœur.

            </div>

        `;

        return;

    }


    favorites.forEach(
        index => {

            if (
                tracks[index]
            ) {

                favoritesGrid.appendChild(
                    createTrackCard(
                        tracks[index],
                        index
                    )
                );

            }

        }
    );

}



/* =========================================================
   LECTURE D'UN MORCEAU
========================================================= */

function playTrack(
    index,
    forcePlay = true
) {

    if (
        index < 0 ||
        index >= tracks.length
    ) {

        return;

    }


    currentIndex = index;


    const track =
        tracks[index];


    updatePlayerUI();


    if (!isPlayerReady) {

        return;

    }


    if (
        player.getVideoData &&
        player.getVideoData().video_id ===
        track.id
    ) {

        if (forcePlay) {

            player.playVideo();

        }

        return;

    }


    player.loadVideoById(
        track.id
    );

}



/* =========================================================
   MORCEAU SUIVANT
========================================================= */

function nextTrack(auto = false) {

    let nextIndex;


    if (shuffleEnabled) {

        if (tracks.length <= 1) {

            nextIndex =
                currentIndex;

        } else {

            do {

                nextIndex =
                    Math.floor(
                        Math.random()
                        * tracks.length
                    );

            } while (
                nextIndex ===
                currentIndex
            );

        }

    } else {

        nextIndex =
            currentIndex + 1;


        if (
            nextIndex >=
            tracks.length
        ) {

            nextIndex = 0;

        }

    }


    playTrack(
        nextIndex,
        true
    );

}



/* =========================================================
   MORCEAU PRÉCÉDENT
========================================================= */

function previousTrack() {

    if (
        isPlayerReady &&
        player.getCurrentTime() > 3
    ) {

        player.seekTo(
            0,
            true
        );

        return;

    }


    let previousIndex =
        currentIndex - 1;


    if (
        previousIndex < 0
    ) {

        previousIndex =
            tracks.length - 1;

    }


    playTrack(
        previousIndex,
        true
    );

}



/* =========================================================
   PLAY / PAUSE
========================================================= */

function togglePlay() {

    if (!isPlayerReady) {

        playTrack(
            currentIndex
        );

        return;

    }


    if (isPlaying) {

        player.pauseVideo();

    } else {

        player.playVideo();

    }

}



/* =========================================================
   BOUTON PLAY
========================================================= */

function updatePlayButton() {

    playButton.textContent =
        isPlaying
            ? "❚❚"
            : "▶";

}



/* =========================================================
   UI DU PLAYER
========================================================= */

function updatePlayerUI() {

    const track =
        tracks[currentIndex];


    if (!track) {
        return;
    }


    playerCover.src =
        track.thumbnail;


    playerTitle.textContent =
        track.title;


    playerArtist.textContent =
        track.artist;


    updatePlayerFavorite();

    updatePlayButton();

}



/* =========================================================
   FAVORI DU PLAYER
========================================================= */

function updatePlayerFavorite() {

    const favorites =
        getFavorites();


    const active =
        favorites.includes(
            currentIndex
        );


    playerHeart.textContent =
        active
            ? "♥"
            : "♡";


    playerHeart.classList.toggle(
        "active",
        active
    );

}



/* =========================================================
   PROGRESSION
========================================================= */

function startProgress() {

    stopProgress();


    progressTimer =
        setInterval(
            updateProgress,
            500
        );

}



function stopProgress() {

    if (progressTimer) {

        clearInterval(
            progressTimer
        );

        progressTimer = null;

    }

}



function updateProgress() {

    if (
        !isPlayerReady ||
        !player
    ) {

        return;

    }


    const current =
        player.getCurrentTime();


    const duration =
        player.getDuration();


    if (
        !duration ||
        duration <= 0
    ) {

        return;

    }


    progressBar.value =
        (current / duration) * 100;


    currentTimeElement.textContent =
        formatTime(current);


    durationElement.textContent =
        formatTime(duration);

}



/* =========================================================
   FORMAT TEMPS
========================================================= */

function formatTime(seconds) {

    if (
        !seconds ||
        Number.isNaN(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        Math.floor(
            seconds % 60
        );


    return `${minutes}:${String(
        remaining
    ).padStart(2, "0")}`;

}



/* =========================================================
   PROGRESSION MANUELLE
========================================================= */

progressBar.addEventListener(
    "input",
    () => {

        if (
            !isPlayerReady ||
            !player
        ) {

            return;

        }


        const duration =
            player.getDuration();


        if (!duration) {
            return;
        }


        const time =
            (
                Number(
                    progressBar.value
                ) / 100
            ) * duration;


        player.seekTo(
            time,
            true
        );

    }
);



/* =========================================================
   VOLUME
========================================================= */

volumeBar.addEventListener(
    "input",
    () => {

        if (
            !isPlayerReady ||
            !player
        ) {

            return;

        }


        player.setVolume(
            Number(
                volumeBar.value
            )
        );

    }
);



/* =========================================================
   BOUTONS DU PLAYER
========================================================= */

playButton.addEventListener(
    "click",
    togglePlay
);


nextButton.addEventListener(
    "click",
    () => {

        nextTrack();

    }
);


previousButton.addEventListener(
    "click",
    previousTrack
);



/* =========================================================
   ALÉATOIRE
========================================================= */

shuffleButton.addEventListener(
    "click",
    () => {

        shuffleEnabled =
            !shuffleEnabled;


        shuffleButton.classList.toggle(
            "active",
            shuffleEnabled
        );

    }
);



/* =========================================================
   RÉPÉTITION
========================================================= */

repeatButton.addEventListener(
    "click",
    () => {

        repeatEnabled =
            !repeatEnabled;


        repeatButton.classList.toggle(
            "active",
            repeatEnabled
        );

    }
);



/* =========================================================
   FAVORI DU PLAYER
========================================================= */

playerHeart.addEventListener(
    "click",
    () => {

        toggleFavorite(
            currentIndex
        );

    }
);



/* =========================================================
   BOUTON HERO
========================================================= */

heroPlayButton.addEventListener(
    "click",
    () => {

        playTrack(
            currentIndex
        );

    }
);



/* =========================================================
   TOUT VOIR
========================================================= */

seeAllButton.addEventListener(
    "click",
    () => {

        showSection(
            "library"
        );

    }
);



/* =========================================================
   NAVIGATION DESKTOP
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.section;


                showSection(
                    section
                );

            }
        );

    });



/* =================================
