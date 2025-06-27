let huidigLevel = 1;
let score = 0;
let tijdOver = 30;
let teller;
let popupType = "waldo";
let isMuted = false;
const maxLevel = 3;

const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");

const achtergrondMuziek = new Audio("audio/Where's Waldo (NES) Music - Title Theme.mp3");
achtergrondMuziek.loop = true;
achtergrondMuziek.volume = 0.4;
achtergrondMuziek.play();

const klikGeluid = new Audio("audio/game-level-complete-143022.mp3");
klikGeluid.volume = 0.4;

const muteButton = document.createElement("img");
muteButton.src = "images/volume-on.png";
muteButton.style.cssText = "position:absolute;top:10px;right:10px;width:30px;cursor:pointer;";
document.body.appendChild(muteButton);

muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
  const volume = isMuted ? 0 : 0.4;
  achtergrondMuziek.volume = volume;
  klikGeluid.volume = volume;
  muteButton.src = isMuted ? "images/volume-mute.png" : "images/volume-on.png";
});

const waldo = document.createElement("img");
waldo.src = "images/waldo.png";
waldo.classList.add("waldo");
game.appendChild(waldo);

waldo.addEventListener("click", () => {
  if (!isMuted) klikGeluid.play();

  let punten = tijdOver >= 20 ? 3 : tijdOver >= 10 ? 2 : 1;
  score += punten;
  scoreEl.textContent = `Score: ${score}`;

  const popupText = document.getElementById("popupText");
  popupText.innerHTML = `Je hebt Waldo gevonden!<div class="sterren-container"></div>`;

  const sterContainer = popupText.querySelector(".sterren-container");
  for (let i = 0; i < punten; i++) {
    const ster = document.createElement("img");
    ster.src = "images/star.png";
    ster.alt = "Ster";
    ster.classList.add("ster");
    sterContainer.appendChild(ster);
  }

  popupType = "waldo";
  document.getElementById("popup").classList.remove("hidden");
  clearInterval(teller);
});

function startTimer() {
  clearInterval(teller);
  teller = setInterval(() => {
    tijdOver--;
    timerEl.textContent = `Tijd: ${tijdOver}`;
    if (tijdOver <= 0) {
        clearInterval(teller);
        popupType = "restart";
        document.getElementById("popupText").textContent = "Game Over! Klik om terug te keren naar het startscherm.";
        document.getElementById("popup").classList.remove("hidden");
      }
      
      
    
  }, 1000);
}

function nieuwLevel(levelNummer) {
  tijdOver = Math.max(30 - levelNummer * 2, 10);
  timerEl.textContent = `Tijd: ${tijdOver}`;
  document.getElementById("level").textContent = `Level: ${levelNummer}`;
  game.style.backgroundImage = `url('levels/level${levelNummer}.png')`;

  waldo.style.left = `${Math.random() * (game.clientWidth - 40)}px`;
  waldo.style.top = `${Math.random() * (game.clientHeight - 40)}px`;
  waldo.style.transform = `scale(${Math.max(0.7 - levelNummer * 0.1, 0.3)})`;

  startTimer();
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");

  if (popupType === "waldo") {
    popupType = "level";
    huidigLevel++;

    if (huidigLevel > maxLevel) {
      window.location.href = "index.html";
      return;
    }

    document.getElementById("popupText").textContent = `Level ${huidigLevel} begint!`;
    document.getElementById("popup").classList.remove("hidden");
  } else if (popupType === "level") {
    nieuwLevel(huidigLevel);
    popupType = "";
  }
  else if (popupType === "restart") {
    window.location.href = "index.html"; // Zorg ervoor als de tijd voorbij is dat je terug naar start gaat
  }
  
}

window.onload = () => nieuwLevel(huidigLevel);

/*
  Bronnen:

  Achtergrond 1: https://www.spriters-resource.com/fullview/221982/
  Achtergrond 2: https://www.spriters-resource.com/fullview/221983/
  Prompt voor genereren ster (kon online niet een goeie vinden) : kun je in de nes stijl een ster genereren

  Sounds:
    game-level-complete-143022.mp3 : https://pixabay.com/sound-effects/game-start-6104/
    game-over-arcade-6435.mp3 : https://pixabay.com/sound-effects/game-over-arcade-6435/
    8-bit-video-game-lose-sound-version-1-145828.mp3 : https://pixabay.com/sound-effects/8-bit-video-game-lose-sound-version-1-145828/
    level-win-6416.mp3 : https://pixabay.com/sound-effects/level-win-6416/
    game-level-complete-143022.mp3 : https://pixabay.com/sound-effects/game-level-complete-143022/

  
*/
