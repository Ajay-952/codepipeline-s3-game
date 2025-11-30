document.addEventListener('DOMContentLoaded', () => {
    /*
      Core game script with:
      - scoring
      - countdown timer that starts on first flip
      - support for additional cards (pairs generated from image list)
    */

    // Update the filenames below to match the files in your images/ folder
    const IMAGE_FILES = [
      "images/meme1.png",
      "images/meme2.png",
      "images/meme3.png",
      "images/meme4.png",
      "images/meme5.png",
      "images/meme6.png",
      "images/meme7.png",
      "images/meme8.png",
      "images/meme9.png",
      "images/meme10.webp",
      "images/meme11.webp",
      "images/meme12.png"
    ];

    // Number of unique pairs to use (set to IMAGE_FILES.length to use all)
    const UNIQUE_PAIRS = Math.min(8, IMAGE_FILES.length); // default 8 pairs (16 cards)

    const gameBoard = document.getElementById("game-board");
    const scoreEl = document.getElementById("score");
    const movesEl = document.getElementById("moves");
    const timerEl = document.getElementById("timer");
    const restartBtn = document.getElementById("restartBtn");
    const messageEl = document.getElementById("message");

    let deck = [];
    let flipped = [];
    let matchedCount = 0;
    let moves = 0;
    let score = 0;
    let timerSeconds = 120; // 2 minutes
    let timerInterval = null;
    let timerRunning = false;

    function pickImages() {
      // pick first UNIQUE_PAIRS images from IMAGE_FILES
      return IMAGE_FILES.slice(0, UNIQUE_PAIRS);
    }

    function createDeck() {
      const imgs = pickImages();
      const pairs = imgs.flatMap(src => [src, src]);
      // create objects with id and src to help with DOM mapping
      deck = pairs.map((src, i) => ({ id: i + "-" + src, src, matched: false }));
      shuffle(deck);
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function renderBoard() {
      gameBoard.innerHTML = "";
      deck.forEach((card, index) => {
        const cardEl = document.createElement("div");
        cardEl.className = "card";
        cardEl.dataset.index = index;

        cardEl.innerHTML = `
          <div class="card-inner">
            <div class="card-front"></div>
            <div class="card-back"><img src="${card.src}" alt="card" /></div>
          </div>
        `;
        cardEl.addEventListener("click", onCardClick);
        gameBoard.appendChild(cardEl);
      });
    }

    function startTimer() {
      if (timerRunning) return;
      timerRunning = true;
      updateTimerDisplay();
      timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          endGame(false);
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
      const seconds = String(timerSeconds % 60).padStart(2, "0");
      timerEl.textContent = `${minutes}:${seconds}`;
    }

    function onCardClick(e) {
      const idx = Number(e.currentTarget.dataset.index);
      const card = deck[idx];

      if (card.matched) return;
      if (flipped.includes(idx)) return;
      if (flipped.length === 2) return;

      // start timer on first flip
      if (!timerRunning) startTimer();

      flipCard(idx);

      flipped.push(idx);
      if (flipped.length === 2) {
        moves++;
        movesEl.textContent = moves;
        checkMatch();
      }
    }

    function flipCard(index) {
      const cardEl = gameBoard.querySelector(`.card[data-index="${index}"]`);
      if (!cardEl) return;
      cardEl.classList.add("flipped");
    }

    function unflipCard(index) {
      const cardEl = gameBoard.querySelector(`.card[data-index="${index}"]`);
      if (!cardEl) return;
      cardEl.classList.remove("flipped");
    }

    function checkMatch() {
      const [a, b] = flipped;
      const cardA = deck[a];
      const cardB = deck[b];

      if (cardA.src === cardB.src) {
        // match
        deck[a].matched = true;
        deck[b].matched = true;
        matchedCount++;
        score += 10;
        scoreEl.textContent = score;
        flipped = [];

        // disable clicks on matched cards visually
        setTimeout(() => {
          const elA = gameBoard.querySelector(`.card[data-index="${a}"]`);
          const elB = gameBoard.querySelector(`.card[data-index="${b}"]`);
          if (elA) elA.classList.add("matched");
          if (elB) elB.classList.add("matched");
        }, 200);

        // win condition
        if (matchedCount === UNIQUE_PAIRS) {
          clearInterval(timerInterval);
          endGame(true);
        }
      } else {
        // mismatch
        score = Math.max(0, score - 1);
        scoreEl.textContent = score;
        setTimeout(() => {
          unflipCard(a);
          unflipCard(b);
          flipped = [];
        }, 800);
      }
    }

    function endGame(won) {
      timerRunning = false;
      clearInterval(timerInterval);
      showMessage(won ? `You won! Score: ${score}, Moves: ${moves}` : `Time's up! Score: ${score}, Moves: ${moves}`);
    }

    function showMessage(text) {
      messageEl.textContent = text;
      messageEl.classList.remove("hidden");
      setTimeout(() => {
        messageEl.classList.add("hidden");
      }, 5000);
    }

    function resetGame() {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning = false;
      timerSeconds = 120;
      updateTimerDisplay();

      matchedCount = 0;
      moves = 0;
      score = 0;
      movesEl.textContent = moves;
      scoreEl.textContent = score;

      createDeck();
      renderBoard();
      flipped = [];
      messageEl.classList.add("hidden");
    }

    restartBtn.addEventListener("click", resetGame);

    // initialize
    resetGame();
});
