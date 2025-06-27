// Huidige staat van de game
let huidigLevel = 1;
let score = 0;
let tijdOver;
let teller;
let popupType = "waldo";
let isMuted = false;
let moeilijkheid = "medium";

// Maximaal aantal levels
const maxLevel = 5;

// DOM-elementen ophalen
const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");

// Instellingen voor elke moeilijkheidsgraad
const instellingen = {
  easy:   { tijd: 40, schaal: 1.0 },
  medium: { tijd: 30, schaal: 0.7 },
  hard:   { tijd: 20, schaal: 0.5 }
};

// Achtergrondmuziek per pagina laden
const achtergrondMuziek = new Audio(
  window.location.pathname.includes("game.html")
    ? "audio/Where's Waldo (NES) Music - World Map.mp3"
    : "audio/Where's Waldo (NES) Music - Title Theme.mp3"
);
achtergrondMuziek.loop = true;
achtergrondMuziek.volume = 0.2;
achtergrondMuziek.play();

// Geluidseffecten instellen
const klikGeluid = new Audio("audio/game-level-complete-143022.mp3");
klikGeluid.volume = 0.4;

const gameOverGeluid = new Audio("audio/Where's Waldo (NES) Music - Game Over.mp3");
gameOverGeluid.volume = 0.4;

// Alleen uitvoeren op de spelpagina
if (window.location.pathname.includes("game.html")) {
  // Volume/mute knop maken
  const muteButton = document.createElement("img");
  muteButton.src = "images/volume-on.png";
  muteButton.classList.add("mute-knop");
  document.getElementById("hud").appendChild(muteButton);

  // Toggle geluid aan/uit
  muteButton.addEventListener("click", () => {
    isMuted = !isMuted;
    const volume = isMuted ? 0 : 0.4;
    achtergrondMuziek.volume = volume;
    klikGeluid.volume = volume;
    gameOverGeluid.volume = volume;
    muteButton.src = isMuted ? "images/volume-mute.png" : "images/volume-on.png";
  });

  // Moeilijkheidsgraad uit localStorage ophalen
  // Bron: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  const opgeslagenMoeilijkheid = localStorage.getItem("moeilijkheid");
  if (opgeslagenMoeilijkheid && instellingen[opgeslagenMoeilijkheid]) {
    moeilijkheid = opgeslagenMoeilijkheid;
  }

  // Waldo toevoegen aan het speelveld
  const waldo = document.createElement("img");
  waldo.src = "images/waldo.png";
  waldo.classList.add("waldo");
  game.appendChild(waldo);

  // Klik op Waldo = punten verdienen
  waldo.addEventListener("click", () => {
    if (!isMuted) klikGeluid.play();

    // Puntensysteem: gebaseerd op percentage resterende tijd
    let punten = tijdOver / instellingen[moeilijkheid].tijd;
    punten = punten >= 0.66 ? 3 : punten >= 0.33 ? 2 : 1;

    score += punten;
    scoreEl.textContent = `Score: ${score}`;

    // Toon pop-up met sterren
    const popupText = document.getElementById("popupText");
    popupText.innerHTML = `Je hebt Waldo gevonden!<div class="sterren-container"></div>`;

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

  // Start de countdown
  function startTimer() {
    clearInterval(teller);
    teller = setInterval(() => {
      tijdOver--;
      timerEl.textContent = `Tijd: ${tijdOver}`;
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

  // Start een nieuw level
  function nieuwLevel(nr) {
    const inst = instellingen[moeilijkheid];
    tijdOver = Math.max(inst.tijd - (nr - 1) * 2, 10);
    timerEl.textContent = `Tijd: ${tijdOver}`;
    document.getElementById("level").textContent = `Level: ${nr}`;
    game.style.backgroundImage = `url('levels/level${nr}.png')`;

    const schaal = Math.max(inst.schaal - (nr - 1) * 0.1, 0.3);
    waldo.style.left = `${Math.random() * (game.clientWidth - 40)}px`;
    waldo.style.top = `${Math.random() * (game.clientHeight - 40)}px`;
    waldo.style.transform = `scale(${schaal})`;

    if (!isMuted) achtergrondMuziek.play();
    startTimer();
  }

  // Pop-up sluiten en bepalen wat te doen
  function closePopup() {
    document.getElementById("popup").classList.add("hidden");

    if (popupType === "waldo") {
      huidigLevel++;
      if (huidigLevel > maxLevel) {
        window.location.href = "index.html";
      } else {
        popupType = "level";
        document.getElementById("popupText").textContent = `Level ${huidigLevel} begint!`;
        document.getElementById("popup").classList.remove("hidden");
      }
    } else if (popupType === "level") {
      nieuwLevel(huidigLevel);
    } else if (popupType === "restart") {
      window.location.href = "index.html";
    }
  }

  // Start eerste level bij laden
  window.onload = () => nieuwLevel(huidigLevel);
}

// Selectie van moeilijkheidsgraad op index.html
if (document.querySelector('.options')) {
  const selectGeluid = new Audio("audio/video-games-select-337214.mp3");
  selectGeluid.volume = 0.2;

  const opties = document.querySelectorAll(".option");

  // data-* attributes: manier om extra info op te slaan in HTML-elementen
  // Bron: https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes
  opties.forEach(optie => {
    optie.addEventListener("click", () => {
      opties.forEach(o => o.classList.remove("selected"));
      optie.classList.add("selected");

      moeilijkheid = optie.dataset.difficulty || "medium";
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
