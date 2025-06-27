// Alle belangrijke spelvariabelen
let huidigLevel = 1;
let score = 0;
let tijdOver;
let teller;
let popupType = "waldo";
let isMuted = false;
let moeilijkheid = "medium"; // standaard

const maxLevel = 5;
const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");

// Instellingen voor moeilijkheidsgraad
const instellingen = {
  easy:   { tijd: 40, schaal: 1.0 },
  medium: { tijd: 30, schaal: 0.7 },
  hard:   { tijd: 20, schaal: 0.5 }
};

// Kies de juiste muziek op basis van de pagina
let achtergrondMuziek;
if (window.location.pathname.includes("game.html")) {
  achtergrondMuziek = new Audio("audio/Where's Waldo (NES) Music - World Map.mp3");
} else {
  achtergrondMuziek = new Audio("audio/Where's Waldo (NES) Music - Title Theme.mp3");
}
achtergrondMuziek.loop = true;
achtergrondMuziek.volume = 0.2;
achtergrondMuziek.play();

// Speelgeluiden
const klikGeluid = new Audio("audio/game-level-complete-143022.mp3");
klikGeluid.volume = 0.4;

const gameOverGeluid = new Audio("audio/Where's Waldo (NES) Music - Game Over.mp3");
gameOverGeluid.volume = 0.4;

// Alleen logica voor game.html
if (window.location.pathname.includes("game.html")) {
  const muteButton = document.createElement("img");
  muteButton.src = "images/volume-on.png";
  muteButton.classList.add("mute-knop");
  document.getElementById("hud").appendChild(muteButton);

  // Mute functie
  muteButton.addEventListener("click", () => {
    isMuted = !isMuted;
    let volume;
    if (isMuted) {
      volume = 0;
    } else {
      volume = 0.4;
    }

    achtergrondMuziek.volume = volume;
    klikGeluid.volume = volume;
    gameOverGeluid.volume = volume;
    if (isMuted) {
      muteButton.src = "images/volume-mute.png";
    } else {
      muteButton.src = "images/volume-on.png";
    }
  });

  // Moeilijkheid ophalen uit localStorage
  const opgeslagenMoeilijkheid = localStorage.getItem("moeilijkheid");
  if (opgeslagenMoeilijkheid !== null) {
    if (instellingen[opgeslagenMoeilijkheid]) {
      moeilijkheid = opgeslagenMoeilijkheid;
    }
  }

  // Waldo toevoegen
  const waldo = document.createElement("img");
  waldo.src = "images/waldo.png";
  waldo.classList.add("waldo");
  game.appendChild(waldo);

  // Als speler Waldo vindt
  waldo.addEventListener("click", () => {
    if (!isMuted) klikGeluid.play();

    let puntenVerhouding = tijdOver / instellingen[moeilijkheid].tijd;
    let punten;

    if (puntenVerhouding >= 0.66) {
      punten = 3;
    } else if (puntenVerhouding >= 0.33) {
      punten = 2;
    } else {
      punten = 1;
    }

    score += punten;
    scoreEl.textContent = "Score: " + score;

    const popupText = document.getElementById("popupText");
    popupText.innerHTML = "Je hebt Waldo gevonden!<div class=\"sterren-container\"></div>";

    const sterContainer = popupText.querySelector(".sterren-container");
    for (let i = 0; i < punten; i++) {
      const ster = document.createElement("img");
      ster.src = "images/star.png";
      ster.classList.add("ster");
      sterContainer.appendChild(ster);
    }

    popupType = "waldo";
    document.getElementById("popup").classList.remove("hidden");
    clearInterval(teller);
  });

  // Start de timer
  function startTimer() {
    clearInterval(teller);
    teller = setInterval(() => {
      tijdOver--;
      timerEl.textContent = "Tijd: " + tijdOver;
      if (tijdOver <= 0) {
        clearInterval(teller);
        popupType = "restart";

        if (!isMuted) {
          achtergrondMuziek.pause();
          gameOverGeluid.play();
        }

        document.getElementById("popupText").textContent = "Game Over!";
        document.getElementById("popup").classList.remove("hidden");
      }
    }, 1000);
  }

  // Laad een nieuw level
  function nieuwLevel(nr) {
    const inst = instellingen[moeilijkheid];
    tijdOver = inst.tijd - (nr - 1) * 2;
    if (tijdOver < 10) {
      tijdOver = 10;
    }

    timerEl.textContent = "Tijd: " + tijdOver;
    document.getElementById("level").textContent = "Level: " + nr;
    game.style.backgroundImage = "url('levels/level" + nr + ".png')";

    let schaal = inst.schaal - (nr - 1) * 0.1;
    if (schaal < 0.3) {
      schaal = 0.3;
    }

    waldo.style.left = Math.random() * (game.clientWidth - 40) + "px";
    waldo.style.top = Math.random() * (game.clientHeight - 40) + "px";
    waldo.style.transform = "scale(" + schaal + ")";

    if (!isMuted) achtergrondMuziek.play();
    startTimer();
  }

  // Popup sluiten en actie bepalen
  function closePopup() {
    document.getElementById("popup").classList.add("hidden");

    if (popupType === "waldo") {
      huidigLevel++;
      if (huidigLevel > maxLevel) {
        window.location.href = "index.html";
      } else {
        popupType = "level";
        document.getElementById("popupText").textContent = "Level " + huidigLevel + " begint!";
        document.getElementById("popup").classList.remove("hidden");
      }
    } else if (popupType === "level") {
      nieuwLevel(huidigLevel);
    } else if (popupType === "restart") {
      window.location.href = "index.html";
    }
  }

  window.onload = function () {
    nieuwLevel(huidigLevel);
  };
}

// Moeilijkheidsgraad selecteren op index.html
if (window.location.pathname.includes("index.html")) {
  const selectGeluid = new Audio("audio/video-games-select-337214.mp3");
  selectGeluid.volume = 0.2;

  const opties = document.querySelectorAll(".option");

  opties.forEach(function (optie) {
    optie.addEventListener("click", function () {
      opties.forEach(function (o) {
        o.classList.remove("selected");
      });

      optie.classList.add("selected");

      if (optie.classList.contains("easy")) {
        moeilijkheid = "easy";
      } else if (optie.classList.contains("hard")) {
        moeilijkheid = "hard";
      } else {
        moeilijkheid = "medium";
      }

      localStorage.setItem("moeilijkheid", moeilijkheid);

      if (!isMuted) {
        selectGeluid.currentTime = 0;
        selectGeluid.play();
      }
    });
  });
}


/*
  Bronvermelding assets en geluiden:

  Opmerking over het formaat van de achtergrondafbeeldingen:
    Ik weet niet zeker of de bestanden nog te groot zijn, maar ik heb geprobeerd ze zo klein mogelijk te houden.
    Toen ik het formaat verder verlaagde, ging dit ten koste van de kwaliteit. 
    Bijvoorbeeld: level 4 heb ik van 30 MB naar 1,6 MB kunnen terugbrengen.
    Als de kwaliteit nog lager werd, kon je Waldo te makkelijk vinden, waardoor de levels te eenvoudig werden.


  Achtergrondafbeeldingen:
    - Achtergrond 1: https://www.spriters-resource.com/fullview/221982/
    - Achtergrond 2: https://www.spriters-resource.com/fullview/221983/
    - Achtergrond 3: https://medium.com/hackernoon/wheres-waldo-terminator-edition-8b3bd0805741
    - Achtergrond 4: https://consequence.net/wp-content/uploads/2016/06/festival-wheres-waldo.jpg
    - Achtergrond 5: https://www.reddit.com/r/wallpapers/comments/mi01hk/wheres_waldo_beach_addition_for_warmer_wallpaper/

  Waldo:
    - https://www.stickpng.com/cat/cartoons/wally?page=1

  Ster (gegenereerd via ChatGPT):
    - Prompt: "Kun je in de NES stijl een ster genereren?"
  Volume (gegenereerd via ChatGPT):
    - Prompt: "kun je een png genereren van een volume speaker op vol volume en een gemute dan wil ik die gebruiken en dat die veranderd per klik"

  Geluidseffecten:
    - game-level-complete-143022.mp3: https://pixabay.com/sound-effects/game-level-complete-143022/
    - Select geluid (moeilijkheid kiezen): https://pixabay.com/sound-effects/video-games-select-337214/

  Muziek uit de NES game:
    - World Map Theme: https://www.youtube.com/watch?v=fPsUyxM14Gw
    - Game Over Theme: https://www.youtube.com/watch?v=7k1u8E8-s2w
    - Title Theme: https://www.youtube.com/watch?v=3VQZuWNf5OA
*/


