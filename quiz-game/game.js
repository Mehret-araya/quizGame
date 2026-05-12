/* =========================
   QUIZ VARIABLES
========================= */
let currentIndex = 0;
let score = 0;
let time = 10;
let timer;

let gameMode = 'classic'; // 'classic' or 'survival'
let currentQuestions = [];
let userAnswers = [];

/* =========================
   SOUND EFFECTS (Place mp3 files in your folder)
========================= */
const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');

/* =========================
   REACTION GAME
========================= */
let reactionStartTime;
let reactionTimeout;

/* =========================
   QUESTIONS DATABASE
========================= */
const allQuestions = {
  general: [
    {
      question: "What is the capital of Ethiopia?",
      options: ["Addis Ababa", "Nairobi", "Cairo", "London"],
      answer: "Addis Ababa"
    },
    {
      question: "Which continent is Ethiopia in?",
      options: ["Asia", "Africa", "Europe", "America"],
      answer: "Africa"
    },
    {
      question: "How many continents are there?",
      options: ["5", "6", "7", "8"],
      answer: "7"
    },
    {
      question: "Which planet do we live on?",
      options: ["Mars", "Earth", "Venus", "Jupiter"],
      answer: "Earth"
    }
  ],

  math: [
    { question: "2 + 2 = ?", options: ["3", "4", "5", "6"], answer: "4" },
    { question: "5 × 3 = ?", options: ["15", "10", "20", "25"], answer: "15" },
    { question: "10 ÷ 2 = ?", options: ["2", "5", "10", "8"], answer: "5" },
    { question: "7 + 6 = ?", options: ["12", "13", "14", "15"], answer: "13" }
  ],

  computer: [
    {
      question: "Which language runs in the browser?",
      options: ["Python", "C", "Java", "JavaScript"],
      answer: "JavaScript"
    },
    {
      question: "HTML stands for?",
      options: [
        "Hyper Text Markup Language",
        "Hot Mail",
        "High Text Machine Language",
        "None"
      ],
      answer: "Hyper Text Markup Language"
    }
  ],

  geography: [
    {
      question: "What is the largest continent?",
      options: ["Africa", "Asia", "Europe", "Australia"],
      answer: "Asia"
    },
    {
      question: "Which ocean is the largest?",
      options: ["Atlantic", "Indian", "Pacific", "Arctic"],
      answer: "Pacific"
    }
  ],

  science: [
    { question: "Water formula is?", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O" },
    { question: "Sun is a?", options: ["Planet", "Star", "Moon", "Asteroid"], answer: "Star" }
  ]
};


document.getElementById("start-btn").addEventListener("click", async () => {
  const type = document.getElementById("quiz-type").value;
  const difficultyElement = document.getElementById("difficulty");
  const difficulty = difficultyElement ? difficultyElement.value : "medium";

  if (type === "api") {
    document.getElementById("start-btn").textContent = "Loading Questions...";
    await fetchAPIQuestions();
    document.getElementById("start-btn").textContent = "Start Quiz";
  } else {
    let pool = [...allQuestions[type]];
    shuffle(pool); // Randomize questions

    if (difficulty === "easy") {
        currentQuestions = pool.slice(0, 2);
    } else if (difficulty === "medium") {
        currentQuestions = pool.slice(0, 3);
    } else {
        currentQuestions = pool;
    }
  }

  currentIndex = 0;
  score = 0;
  userAnswers = new Array(currentQuestions.length).fill(null);

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");

  showQuestion();
});

async function fetchAPIQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=5&type=multiple');
        const data = await response.json();
        currentQuestions = data.results.map(q => ({
            question: q.question,
            options: shuffle([...q.incorrect_answers, q.correct_answer]),
            answer: q.correct_answer
        }));
    } catch (error) {
        alert("Failed to load API questions. Using General Knowledge instead.");
        currentQuestions = allQuestions.general;
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/* =========================
   SHOW QUESTION
========================= */
function showQuestion() {
  clearInterval(timer);

  const q = currentQuestions[currentIndex];

  document.getElementById("question").textContent = q.question;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;

    if (userAnswers[currentIndex] === option) {
      btn.style.background = "#ffc107";
    }

    btn.onclick = function() {
      userAnswers[currentIndex] = option;
      const buttons = document.querySelectorAll("#options button");

      buttons.forEach(b => {
        b.style.pointerEvents = "none";
        if (b.textContent === q.answer) {
          b.classList.add("correct-anim");
          if (option === q.answer) correctSound.play().catch(()=>{});
        } else if (b.textContent === option) {
          b.classList.add("wrong-anim");
          wrongSound.play().catch(()=>{});
        }
      });

      if (gameMode === 'survival' && option !== q.answer) {
          setTimeout(() => showResult(), 1000);
          return;
      }

      setTimeout(() => {
        if (currentIndex < currentQuestions.length - 1) {
          currentIndex++;
          showQuestion();
        } else {
          showResult();
        }
      }, 1200);
    };

    optionsDiv.appendChild(btn);
  });

  document.getElementById("progress").textContent =
    `Question ${currentIndex + 1} / ${currentQuestions.length}`;

  updateNavButtons();
  startTimer();
}

/* =========================
   NAVIGATION
========================= */
document.getElementById("next-btn").addEventListener("click", () => {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    showResult();
  }
});

document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
});

function updateNavButtons() {
  document.getElementById("prev-btn").disabled = currentIndex === 0;

  document.getElementById("next-btn").textContent =
    currentIndex === currentQuestions.length - 1 ? "Finish 🎉" : "Next ➡";
}

/* =========================
   TIMER
========================= */
function startTimer() {
  clearInterval(timer);
  time = 10;

  document.getElementById("timer").textContent = `⏱ Time: ${time}`;

  timer = setInterval(() => {
    time--;
    document.getElementById("timer").textContent = `⏱ Time: ${time}`;

    if (time <= 0) {
      clearInterval(timer);
      userAnswers[currentIndex] = "TIMEOUT"; // Auto-end logic
      if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        showQuestion();
      } else {
        showResult();
      }
    }
  }, 1000);
}

/* =========================
   RESULT SCREEN
========================= */
function showResult() {
  clearInterval(timer);

  score = 0;

  currentQuestions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) {
      score++;
    }
  });

  let percent = Math.round((score / currentQuestions.length) * 100);

  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("result-screen").innerHTML = `
    <h2>Quiz Finished 🎉</h2>
    <div class="final-score">Score: ${score} / ${currentQuestions.length}</div>
    <p>Percentage: ${percent}%</p>
    <button onclick="restartQuiz()">Try Again</button>
    <button onclick="location.reload()">Main Menu</button>
  `;

  // save history
  let history = JSON.parse(localStorage.getItem("quizHistory")) || [];

  history.push({
    date: new Date().toLocaleString(),
    score,
    total: currentQuestions.length,
    percent
  });

  localStorage.setItem("quizHistory", JSON.stringify(history));
}

function backToMenuFromQuiz() {
  clearInterval(timer);
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("menu-screen").classList.remove("hidden");
}

/* =========================
   RESTART
========================= */
function restartQuiz() {
  clearInterval(timer);

  currentIndex = 0;
  score = 0;
  time = 10;

  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
}

/* =========================
   LEADERBOARD & THEME
========================= */
function showLeaderboard() {
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("leaderboard-screen").classList.remove("hidden");
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    const list = document.getElementById("leaderboard-list");
    // Sort by best score
    history.sort((a, b) => (b.score/b.total) - (a.score/a.total));
    list.innerHTML = history.slice(0, 5).map(entry => 
        `<div class="entry">${entry.date}: <b>${entry.score}/${entry.total}</b> (${entry.percent}%)</div>`
    ).join('');
}

function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
        body.classList.replace('light-theme', 'dark-theme');
        document.getElementById('theme-toggle').textContent = "☀️ Light Mode";
    } else {
        body.classList.replace('dark-theme', 'light-theme');
        document.getElementById('theme-toggle').textContent = "🌙 Dark Mode";
    }
}

function backToMenuFromLeaderboard() {
    document.getElementById("leaderboard-screen").classList.add("hidden");
    document.getElementById("menu-screen").classList.remove("hidden");
}

/* =========================
   GAME HUB NAVIGATION
========================= */
function openQuiz(mode = 'classic') {
  gameMode = mode;
  document.getElementById("menu-screen").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
}

function openReaction() {
  document.getElementById("menu-screen").classList.add("hidden");
  document.getElementById("reaction-screen").classList.remove("hidden");
  startReactionGame();
}

function backToMenu() {
  clearTimeout(reactionTimeout);
  document.getElementById("reaction-screen").classList.add("hidden");
  document.getElementById("menu-screen").classList.remove("hidden");
}

/* =========================
   REACTION GAME
========================= */
function startReactionGame() {
  const btn = document.getElementById("reaction-btn");
  const text = document.getElementById("reaction-text");
  const result = document.getElementById("reaction-result");

  // Reset UI State
  text.textContent = "Wait for Green...";
  btn.disabled = true;
  btn.textContent = "WAIT...";
  btn.style.background = "red";
  
  clearTimeout(reactionTimeout);
  let delay = Math.random() * 3000 + 2000;

  reactionTimeout = setTimeout(() => {
    text.textContent = "NOW CLICK!";
    btn.disabled = false;
    btn.style.background = "green";
    reactionStartTime = Date.now();
  }, delay);

  btn.onclick = () => {
    const reactionTime = Date.now() - reactionStartTime;
    result.textContent = `Your reaction time: ${reactionTime} ms!`;
    
    text.textContent = "Nice work!";
    btn.disabled = true;
    btn.textContent = "WAITING...";
    btn.style.background = "#6c757d";

    // Start a new round after a short delay
    reactionTimeout = setTimeout(startReactionGame, 2000);
  };
}

/* =========================
   MEMORY MATCH GAME LOGIC
========================= */
let flippedCards = [];
let matchedCount = 0;
const emojis = ['🍎', '🍎', '🍌', '🍌', '🍇', '🍇', '🍓', '🍓', '🍒', '🍒', '🍍', '🍍', '🥝', '🥝', '🍉', '🍉'];

function openMemoryGame() {
  document.getElementById("menu-screen").classList.add("hidden");
  document.getElementById("memory-screen").classList.remove("hidden");
  startMemoryGame();
}

function startMemoryGame() {
  const grid = document.getElementById("memory-grid");
  grid.innerHTML = "";
  flippedCards = [];
  matchedCount = 0;
  
  const shuffledEmojis = shuffle([...emojis]);
  
  shuffledEmojis.forEach((emoji) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.value = emoji;
    card.textContent = emoji;
    card.onclick = () => handleCardClick(card);
    grid.appendChild(card);
  });
}

function handleCardClick(card) {
  if (flippedCards.length < 2 && !card.classList.contains("flipped") && !card.classList.contains("matched")) {
    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        matchedCount += 2;
        flippedCards = [];
        if (matchedCount === emojis.length) {
          setTimeout(() => alert("You found all pairs! 🎉"), 500);
        }
      } else {
        setTimeout(() => {
          card1.classList.remove("flipped");
          card2.classList.remove("flipped");
          flippedCards = [];
        }, 1000);
      }
    }
  }
}

function backToMenuFromMemory() {
  document.getElementById("memory-screen").classList.add("hidden");
  document.getElementById("menu-screen").classList.remove("hidden");
}