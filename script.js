/* =========================================================
WAVEIFY — SCRIPT COMPLET
========================================================= */

const tracks = [
"https://www.youtube.com/watch?v=6bJZ0Y2K5kI",
"https://www.youtube.com/watch?v=2Vv-BfVoq4g",
"https://www.youtube.com/watch?v=RgKAFK5djSk",
"https://www.youtube.com/watch?v=JGwWNGJdvx8",
"https://www.youtube.com/watch?v=OPf0YbXqDm0",
"https://www.youtube.com/watch?v=09R8_2nJtjg",
"https://www.youtube.com/watch?v=kJQP7kiw5Fk",
"https://www.youtube.com/watch?v=60ItHLz5WEA",
"https://www.youtube.com/watch?v=YQHsXMglC9A",
"https://www.youtube.com/watch?v=fRh_vgS2dFE",
"https://www.youtube.com/watch?v=lp-EO5I60KA",
"https://www.youtube.com/watch?v=450p7goxZqg",
"https://www.youtube.com/watch?v=2Vv-BfVoq4g",
"https://www.youtube.com/watch?v=uelHwf8o7_U",
"https://www.youtube.com/watch?v=PT2_F-1esPk",
"https://www.youtube.com/watch?v=RB-RcX5DS5A",
"https://www.youtube.com/watch?v=KQ6zr6kCPj8",
"https://www.youtube.com/watch?v=Zi_XLOBDo_Y",
"https://www.youtube.com/watch?v=hT_nvWreIhg",
"https://www.youtube.com/watch?v=ktvTqknDobU",
"https://www.youtube.com/watch?v=09R8_2nJtjg",
"https://www.youtube.com/watch?v=ru0K8uYEZWw",
"https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
"https://www.youtube.com/watch?v=YqeW9_5kURI",
"https://www.youtube.com/watch?v=RgKAFK5djSk",
"https://www.youtube.com/watch?v=OPf0YbXqDm0",
"https://www.youtube.com/watch?v=JGwWNGJdvx8",
"https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
"https://www.youtube.com/watch?v=Zi_XLOBDo_Y",
"https://www.youtube.com/watch?v=60ItHLz5WEA",
"https://www.youtube.com/watch?v=YQHsXMglC9A",
"https://www.youtube.com/watch?v=kJQP7kiw5Fk",
"https://www.youtube.com/watch?v=uelHwf8o7_U",
"https://www.youtube.com/watch?v=PT2_F-1esPk",
"https://www.youtube.com/watch?v=RB-RcX5DS5A",
"https://www.youtube.com/watch?v=KQ6zr6kCPj8"
];

/* =========================================================
DONNÉES DES MORCEAUX
========================================================= */

const trackData = tracks.map((url, index) => {

const videoId = getYouTubeId(url);  

const titles = [  
    "Blinding Lights",  
    "Perfect",  
    "See You Again",  
    "Shape of You",  
    "Uptown Funk",  
    "Sugar",  
    "Despacito",  
    "Faded",  
    "Hello",  
    "Cheap Thrills",  
    "Photograph",  
    "Closer"  
];  

const artists = [  
    "The Weeknd",  
    "Ed Sheeran",  
    "Wiz Khalifa",  
    "Ed Sheeran",  
    "Mark Ronson",  
    "Maroon 5",  
    "Luis Fonsi",  
    "Alan Walker",  
    "Adele",  
    "Sia",  
    "Ed Sheeran",  
    "The Chainsmokers"  
];  

return {  
    id: index,  
    videoId,  
    title: titles[index % titles.length],  
    artist: artists[index % artists.length],  
    cover: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`  
};

});

/* =========================================================
FAVORIS
========================================================= */

let favoriteTracks = JSON.parse(
localStorage.getItem("waveifyFavorites") || "[]"
);

function saveFavorites() {
localStorage.setItem(
"waveifyFavorites",
JSON.stringify(favoriteTracks)
);
}

function isFavorite(id) {
return favoriteTracks.includes(id);
}

function toggleFavorite(id) {

if (isFavorite(id)) {  

    favoriteTracks = favoriteTracks.filter(  
        trackId => trackId !== id  
    );  

} else {  

    favoriteTracks.push(id);  
}  

saveFavorites();  

renderAll();  

if (currentTrackIndex === id) {  
    updatePlayerFavorite();  
}

}

/* =========================================================
DOM
========================================================= */

const musicGrid = document.getElementById("musicGrid");
const libraryGrid = document.getElementById("libraryGrid");
const favoritesGrid = document.getElementById("favoritesGrid");

const emptyFavorites =
document.getElementById("emptyFavorites");

const favoriteCount =
document.getElementById("favoriteCount");

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

const playAllButton =
document.getElementById("playAllButton");

const seeAllButton =
document.getElementById("seeAllButton");

const mobileMenu =
document.getElementById("mobileMenu");

/* =========================================================
ÉTAT DU LECTEUR
========================================================= */

let currentTrackIndex = null;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let player = null;
let playerReady = false;

/* =========================================================
UTILITAIRES
========================================================= */

function getYouTubeId(url) {

try {  

    const parsed = new URL(url);  

    if (parsed.hostname.includes("youtu.be")) {  
        return parsed.pathname.substring(1);  
    }  

    return parsed.searchParams.get("v");  

} catch {  
    return "";  
}

}

function formatTime(seconds) {

if (!Number.isFinite(seconds)) {  
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

/* =========================================================
CARTES MUSIQUE
========================================================= */

function createTrackCard(track) {

const favorite = isFavorite(track.id);  

return `  
    <article class="music-card" data-track-id="${track.id}">  

        <div class="card-cover">  

            <img  
                src="${track.cover}"  
                alt="${escapeHtml(track.title)}"  
                loading="lazy"  
            >  

            <button  
                class="card-play"  
                data-action="play"  
                data-id="${track.id}"  
                aria-label="Lire ${escapeHtml(track.title)}"  
            >  
                ▶  
            </button>  

            <button  
                class="favorite-button ${favorite ? "active" : ""}"  
                data-action="favorite"  
                data-id="${track.id}"  
                aria-label="Ajouter aux favoris"  
            >  
                ${favorite ? "♥" : "♡"}  
            </button>  

        </div>  

        <div class="card-info">  

            <strong class="card-title">  
                ${escapeHtml(track.title)}  
            </strong>  

            <span class="card-artist">  
                ${escapeHtml(track.artist)}  
            </span>  

        </div>  

    </article>  
`;

}

/* =========================================================
RENDU
========================================================= */

function renderGrid(container, items) {

if (!container) {  
    return;  
}  

container.innerHTML = items  
    .map(createTrackCard)  
    .join("");

}

function renderFavorites() {

const favorites = trackData.filter(track =>  
    favoriteTracks.includes(track.id)  
);  

renderGrid(favoritesGrid, favorites);  

if (favoriteCount) {  

    favoriteCount.textContent =  
        `${favorites.length} morceau${favorites.length > 1 ? "x" : ""}`;  
}  

if (emptyFavorites) {  

    emptyFavorites.style.display =  
        favorites.length === 0 ? "flex" : "none";  
}

}

function renderAll() {

renderGrid(musicGrid, trackData);  
renderGrid(libraryGrid, trackData);  
renderFavorites();

}

/* =========================================================
LECTURE
========================================================= */

function loadTrack(index, autoplay = true) {

if (!trackData[index]) {  
    return;  
}  

currentTrackIndex = index;  

const track = trackData[index];  

playerTitle.textContent = track.title;  
playerArtist.textContent = track.artist;  
playerCover.src = track.cover;  

updatePlayerFavorite();  

if (playerReady && player) {  

    player.loadVideoById(track.videoId);  

    if (!autoplay) {  
        player.pauseVideo();  
    }  
}

}

function playTrack(index) {

loadTrack(index, true);  

if (playerReady && player) {  
    player.playVideo();  
}  

isPlaying = true;  

updatePlayButton();  
updatePlayerState();

}

function togglePlay() {

if (currentTrackIndex === null) {  

    playTrack(0);  
    return;  
}  

if (!playerReady || !player) {  
    return;  
}  

if (isPlaying) {  

    player.pauseVideo();  

} else {  

    player.playVideo();  
}

}

function updatePlayButton() {

if (!playButton) {  
    return;  
}  

playButton.textContent =  
    isPlaying ? "❚❚" : "▶";

}

function updatePlayerState() {

const playerElement =  
    document.querySelector(".player");  

if (!playerElement) {  
    return;  
}  

playerElement.classList.toggle(  
    "playing",  
    isPlaying  
);

}

/* =========================================================
FAVORI DU LECTEUR
========================================================= */

function updatePlayerFavorite() {

if (  
    !playerFavorite ||  
    currentTrackIndex === null  
) {  
    return;  
}  

const favorite =  
    isFavorite(currentTrackIndex);  

playerFavorite.textContent =  
    favorite ? "♥" : "♡";  

playerFavorite.classList.toggle(  
    "active",  
    favorite  
);

}

/* =========================================================
PISTES SUIVANTES / PRÉCÉDENTES
========================================================= */

function getNextTrackIndex() {

if (currentTrackIndex === null) {  
    return 0;  
}  

if (isShuffle) {  

    if (trackData.length <= 1) {  
        return currentTrackIndex;  
    }  

    let nextIndex;  

    do {  
        nextIndex =  
            Math.floor(  
                Math.random() * trackData.length  
            );  
    } while (  
        nextIndex === currentTrackIndex  
    );  

    return nextIndex;  
}  

return (  
    (currentTrackIndex + 1) %  
    trackData.length  
);

}

function getPreviousTrackIndex() {

if (currentTrackIndex === null) {  
    return 0;  
}  

return (  
    (currentTrackIndex - 1 + trackData.length) %  
    trackData.length  
);

}

function nextTrack() {

playTrack(getNextTrackIndex());

}

function previousTrack() {

if (  
    playerReady &&  
    player &&  
    player.getCurrentTime() > 3  
) {  

    player.seekTo(0, true);  
    return;  
}  

playTrack(getPreviousTrackIndex());

}

/* =========================================================
SHUFFLE / REPEAT
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
PROGRESSION
========================================================= */

function updateProgress() {

if (  
    !playerReady ||  
    !player ||  
    currentTrackIndex === null  
) {  
    return;  
}  

const current =  
    player.getCurrentTime();  

const total =  
    player.getDuration();  

if (!Number.isFinite(total) || total <= 0) {  
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

/* =========================================================
SEEK
========================================================= */

function seek(event) {

if (  
    !playerReady ||  
    !player ||  
    !player.getDuration  
) {  
    return;  
}  

const rect =  
    progressBar.getBoundingClientRect();  

const percentage =  
    Math.min(  
        Math.max(  
            (event.clientX - rect.left) /  
            rect.width,  
            0  
        ),  
        1  
    );  

const time =  
    percentage *  
    player.getDuration();  

player.seekTo(time, true);

}

/* =========================================================
VOLUME
========================================================= */

function updateVolume() {

if (!playerReady || !player) {  
    return;  
}  

const value =  
    Number(volumeSlider.value);  

player.setVolume(value);

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
        section.classList.add("hidden-section");  
    }  
});  

if (sections[sectionName]) {  
    sections[sectionName]  
        .classList.remove("hidden-section");  
}  

document  
    .querySelectorAll(".nav-item")  
    .forEach(item => {  

        item.classList.toggle(  
            "active",  
            item.dataset.section === sectionName  
        );  
    });  

window.scrollTo({  
    top: 0,  
    behavior: "smooth"  
});  

closeMobileSidebar();

}

/* =========================================================
SIDEBAR MOBILE
========================================================= */

function openMobileSidebar() {

if (!document.querySelector(".sidebar")) {  
    return;  
}  

document  
    .querySelector(".sidebar")  
    .classList.add("open");

}

function closeMobileSidebar() {

const sidebar =  
    document.querySelector(".sidebar");  

if (sidebar) {  
    sidebar.classList.remove("open");  
}

}

if (mobileMenu) {

mobileMenu.addEventListener(  
    "click",  
    openMobileSidebar  
);

}

/* Fermer la sidebar en cliquant sur un lien */

document
.querySelectorAll(".nav-item")
.forEach(item => {

item.addEventListener(  
        "click",  
        () => {  

            showSection(  
                item.dataset.section  
            );  
        }  
    );  
});

/* =========================================================
CLICS SUR LES CARTES
========================================================= */

document.addEventListener("click", event => {

const playElement =  
    event.target.closest(  
        '[data-action="play"]'  
    );  

if (playElement) {  

    event.stopPropagation();  

    const id =  
        Number(playElement.dataset.id);  

    playTrack(id);  

    return;  
}  

const favoriteElement =  
    event.target.closest(  
        '[data-action="favorite"]'  
    );  

if (favoriteElement) {  

    event.stopPropagation();  

    const id =  
        Number(favoriteElement.dataset.id);  

    toggleFavorite(id);  

    return;  
}  

const card =  
    event.target.closest(".music-card");  

if (card) {  

    const id =  
        Number(card.dataset.trackId);  

    playTrack(id);  
}

});

/* =========================================================
BOUTONS DU PLAYER
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
    toggleShuffle  
);

}

if (repeatButton) {

repeatButton.addEventListener(  
    "click",  
    toggleRepeat  
);

}

if (playerFavorite) {

playerFavorite.addEventListener(  
    "click",  
    () => {  

        if (currentTrackIndex !== null) {  
            toggleFavorite(  
                currentTrackIndex  
            );  
        }  
    }  
);

}

if (progressBar) {

progressBar.addEventListener(  
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

/* =========================================================
TOUT ÉCOUTER
========================================================= */

if (playAllButton) {

playAllButton.addEventListener(  
    "click",  
    () => {  
        playTrack(0);  
    }  
);

}

/* =========================================================
TOUT VOIR
========================================================= */

if (seeAllButton) {

seeAllButton.addEventListener(  
    "click",  
    () => {  
        showSection("library");  
    }  
);

}

/* =========================================================
YOUTUBE API
========================================================= */

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
            rel: 0,  
            modestbranding: 1  
        },  

        events: {  
            onReady: onPlayerReady,  
            onStateChange: onPlayerStateChange  
        }  
    }  
);

}

function onPlayerReady(event) {

playerReady = true;  

event.target.setVolume(  
    Number(volumeSlider?.value || 80)  
);  

updateProgress();

}

function onPlayerStateChange(event) {

if (!window.YT) {  
    return;  
}  

switch (event.data) {  

    case YT.PlayerState.PLAYING:  

        isPlaying = true;
