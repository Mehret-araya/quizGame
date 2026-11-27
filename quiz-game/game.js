/* Quiz state */
let currentIndex = 0;
let score = 0;
let time = 10;
let questionTimeLimit = 15;
let timer;
let gameMode = 'classic';
let currentQuestions = [];
let userAnswers = [];
let answerLocked = false;
let feedbackTimeout;
let reactionStartTime;
let reactionTimeout;
let flippedCards = [];
let matchedCount = 0;
let memoryMoves = 0;
let memoryLocked = false;
let memoryTimeout;

const allQuestions = {
  general: [
    { question: 'What is the capital of Ethiopia?', options: ['Addis Ababa', 'Nairobi', 'Cairo', 'London'], answer: 'Addis Ababa' },
    { question: 'Which continent is Ethiopia in?', options: ['Asia', 'Africa', 'Europe', 'America'], answer: 'Africa' },
    { question: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: '7' },
    { question: 'Which planet do we live on?', options: ['Mars', 'Earth', 'Venus', 'Jupiter'], answer: 'Earth' }
  ],
  math: [
    { question: '2 + 2 = ?', options: ['3', '4', '5', '6'], answer: '4' },
    { question: '5 × 3 = ?', options: ['15', '10', '20', '25'], answer: '15' },
    { question: '10 ÷ 2 = ?', options: ['2', '5', '10', '8'], answer: '5' },
    { question: '7 + 6 = ?', options: ['12', '13', '14', '15'], answer: '13' }
  ],
  computer: [
    { question: 'Which language runs in the browser?', options: ['Python', 'C', 'Java', 'JavaScript'], answer: 'JavaScript' },
    { question: 'HTML stands for?', options: ['Hyper Text Markup Language', 'Hot Mail', 'High Text Machine Language', 'None'], answer: 'Hyper Text Markup Language' }
  ],
  geography: [
    { question: 'What is the largest continent?', options: ['Africa', 'Asia', 'Europe', 'Australia'], answer: 'Asia' },
    { question: 'Which ocean is the largest?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 'Pacific' }
  ],
  science: [
    { question: 'Water formula is?', options: ['H₂O', 'CO₂', 'O₂', 'NaCl'], answer: 'H₂O' },
    { question: 'The Sun is a…', options: ['Planet', 'Star', 'Moon', 'Asteroid'], answer: 'Star' }
  ]
};

const memoryEmojis = ['🍎', '🍎', '🍌', '🍌', '🍇', '🍇', '🍓', '🍓', '🍒', '🍒', '🍍', '🍍', '🥝', '🥝', '🍉', '🍉'];
const byId = id => document.getElementById(id);

/* Persist the player's theme preference. */
function applyTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  document.body.classList.toggle('light-theme', theme !== 'dark');
  const button = byId('theme-toggle');
  button.textContent = theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode';
  button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}
function toggleTheme() {
  const next = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
  localStorage.setItem('quizTheme', next);
  applyTheme(next);
}
applyTheme(localStorage.getItem('quizTheme') || 'light');
byId('theme-toggle').addEventListener('click', toggleTheme);

/* Quiz setup and question loading. */
byId('start-btn').addEventListener('click', startQuiz);
async function startQuiz() {
  const button = byId('start-btn');
  const type = byId('quiz-type').value;
  const difficulty = byId('difficulty').value;
  questionTimeLimit = Number(byId('time-limit').value) || 15;
  button.disabled = true;
  button.innerHTML = 'Loading questions…';
  if (type === 'api') {
    try {
      await fetchAPIQuestions();
    } catch (error) {
      window.alert('Could not load online questions. General knowledge will be used instead.');
      currentQuestions = shuffle([...allQuestions.general]);
    }
  } else {
    const pool = shuffle([...allQuestions[type]]);
    currentQuestions = difficulty === 'easy' ? pool.slice(0, 2) : difficulty === 'medium' ? pool.slice(0, 3) : pool;
  }
  button.disabled = false;
  button.innerHTML = 'Start quiz <span>→</span>';
  if (!currentQuestions.length) return;
  currentIndex = 0;
  score = 0;
  answerLocked = false;
  userAnswers = new Array(currentQuestions.length).fill(null);
  byId('quiz-mode-label').textContent = `${gameMode === 'survival' ? 'SURVIVAL' : 'CLASSIC'} · ${byId('quiz-type').selectedOptions[0].text.toUpperCase()}`;
  byId('result-screen').replaceChildren();
  byId('start-screen').classList.add('hidden');
  byId('quiz-screen').classList.remove('hidden');
  showQuestion();
}

async function fetchAPIQuestions() {
  const response = await fetch('https://opentdb.com/api.php?amount=5&type=multiple', { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Question service is unavailable');
  const data = await response.json();
  if (data.response_code !== 0 || !data.results?.length) throw new Error('No questions returned');
  const decode = value => {
    const node = document.createElement('textarea');
    node.innerHTML = value;
    return node.value;
  };
  currentQuestions = data.results.map(item => {
    const answer = decode(item.correct_answer);
    return { question: decode(item.question), answer, options: shuffle([...item.incorrect_answers.map(decode), answer]) };
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showQuestion() {
  clearInterval(timer);
  answerLocked = false;
  const question = currentQuestions[currentIndex];
  const savedAnswer = userAnswers[currentIndex];
  const isAnswered = savedAnswer !== null;
  const questionHeading = byId('question');
  questionHeading.textContent = question.question;
  if (savedAnswer === 'TIMEOUT') {
    questionHeading.setAttribute('aria-label', `${question.question} Time expired`);
  } else {
    questionHeading.removeAttribute('aria-label');
  }
  questionHeading.focus({ preventScroll: true });
  const options = byId('options');
  options.replaceChildren();
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.option = option;
    button.disabled = isAnswered;
    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.textContent = String(index + 1);
    const label = document.createElement('span');
    label.textContent = option;
    button.append(letter, label);
    if (isAnswered) {
      if (option === question.answer) button.classList.add('correct-anim');
      else if (savedAnswer === option) button.classList.add('wrong-anim');
    }
    button.addEventListener('click', () => selectAnswer(option));
    options.appendChild(button);
  });
  byId('progress').textContent = `Question ${currentIndex + 1} / ${currentQuestions.length}`;
  const percent = Math.round(((currentIndex + 1) / currentQuestions.length) * 100);
  byId('progress-fill').style.width = `${percent}%`;
  document.querySelector('.progress-track').setAttribute('aria-valuenow', percent);
  updateNavButtons();
  if (isAnswered) {
    const timerElement = byId('timer');
    timerElement.textContent = savedAnswer === 'TIMEOUT' ? '⏱ 0s' : '⏱ Done';
    timerElement.setAttribute('aria-label', savedAnswer === 'TIMEOUT' ? 'Time expired' : 'Question answered');
    timerElement.classList.remove('urgent');
  } else {
    startTimer();
  }
}

function selectAnswer(option) {
  if (answerLocked || userAnswers[currentIndex] !== null) return;
  answerLocked = true;
  updateNavButtons();
  clearInterval(timer);
  userAnswers[currentIndex] = option;
  const correct = currentQuestions[currentIndex].answer;
  document.querySelectorAll('#options button').forEach(button => {
    button.disabled = true;
    if (button.dataset.option === correct) button.classList.add('correct-anim');
    else if (button.dataset.option === option) button.classList.add('wrong-anim');
  });
  if (gameMode === 'survival' && option !== correct) {
    feedbackTimeout = window.setTimeout(showResult, 850);
    return;
  }
  feedbackTimeout = window.setTimeout(() => {
    if (!byId('quiz-screen').classList.contains('hidden')) advanceQuestion();
  }, 850);
}

function advanceQuestion() {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else showResult();
}
byId('next-btn').addEventListener('click', () => {
  if (answerLocked) return;
  if (userAnswers[currentIndex] !== null) advanceQuestion();
  else if (currentIndex === currentQuestions.length - 1) showResult();
  else advanceQuestion();
});
byId('prev-btn').addEventListener('click', () => {
  if (answerLocked || currentIndex === 0) return;
  currentIndex--;
  showQuestion();
});
function updateNavButtons() {
  byId('prev-btn').disabled = currentIndex === 0 || answerLocked;
  byId('next-btn').textContent = currentIndex === currentQuestions.length - 1 ? 'Finish quiz' : 'Next →';
  byId('next-btn').disabled = answerLocked;
}

function startTimer() {
  clearInterval(timer);
  time = questionTimeLimit;
  const timerElement = byId('timer');
  const tick = () => {
    timerElement.textContent = `⏱ ${time}s`;
    timerElement.setAttribute('aria-label', `${time} seconds remaining`);
    timerElement.classList.toggle('urgent', time <= 3);
  };
  tick();
  timer = setInterval(() => {
    time--;
    tick();
    if (time <= 0) {
      clearInterval(timer);
      if (userAnswers[currentIndex] === null) userAnswers[currentIndex] = 'TIMEOUT';
      byId('question').setAttribute('aria-label', `${currentQuestions[currentIndex].question} Time expired`);
      answerLocked = true;
      updateNavButtons();
      if (gameMode === 'survival') {
        feedbackTimeout = window.setTimeout(() => {
          if (!byId('quiz-screen').classList.contains('hidden')) showResult();
        }, 250);
        return;
      }
      feedbackTimeout = window.setTimeout(() => {
        if (!byId('quiz-screen').classList.contains('hidden')) advanceQuestion();
      }, 300);
    }
  }, 1000);
}

function showResult() {
  clearInterval(timer);
  score = currentQuestions.reduce((sum, question, index) => sum + (userAnswers[index] === question.answer ? 1 : 0), 0);
  const percent = Math.round((score / currentQuestions.length) * 100);
  const result = byId('result-screen');
  const message = percent === 100 ? 'Perfect run. You nailed every question!' : percent >= 60 ? 'Nice work. Your knowledge is adding up.' : 'Good practice. Ready for another round?';
  result.innerHTML = `<div class="eyebrow">${byId('quiz-type').selectedOptions[0].text} · ${gameMode === 'survival' ? 'SURVIVAL RUN' : 'CLASSIC'}</div><h2>${percent === 100 ? 'Brilliant!' : 'Well played!'}</h2><div class="final-score">${score} / ${currentQuestions.length}</div><p class="result-message">${percent}% correct · ${message}</p><div class="result-actions"><button class="primary-button" type="button" onclick="restartQuiz()">Play again</button><button class="secondary-button" type="button" onclick="backToMenuFromResults()">Back to games</button></div>`;
  byId('quiz-screen').classList.add('hidden');
  result.classList.remove('hidden');
  const history = readHistory();
  history.push({ date: new Date().toISOString(), score, total: currentQuestions.length, percent, category: byId('quiz-type').selectedOptions[0].text, mode: gameMode });
  localStorage.setItem('quizHistory', JSON.stringify(history.slice(-50)));
}
function readHistory() {
  try { const value = JSON.parse(localStorage.getItem('quizHistory') || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function backToMenuFromQuiz() { clearInterval(timer); clearTimeout(feedbackTimeout); byId('quiz-screen').classList.add('hidden'); byId('start-screen').classList.add('hidden'); byId('menu-screen').classList.remove('hidden'); }
function backToMenuFromResults() { byId('result-screen').classList.add('hidden'); byId('menu-screen').classList.remove('hidden'); }
function restartQuiz() { byId('result-screen').classList.add('hidden'); byId('start-screen').classList.remove('hidden'); }

/* Score history and navigation. */
function showLeaderboard() {
  byId('menu-screen').classList.add('hidden');
  byId('leaderboard-screen').classList.remove('hidden');
  const history = readHistory().sort((a, b) => b.percent - a.percent || b.score - a.score);
  const list = byId('leaderboard-list');
  if (!history.length) {
    list.innerHTML = '<div class="empty-state">No scores yet. Play a quiz and your results will show up here.</div>';
    return;
  }
  list.replaceChildren(...history.slice(0, 10).map(entry => {
    const row = document.createElement('div');
    row.className = 'entry';
    const meta = document.createElement('span');
    const category = document.createElement('strong');
    category.textContent = entry.category || 'Quiz';
    const date = document.createElement('small');
    date.className = 'entry-date';
    date.textContent = new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    meta.append(category, document.createElement('br'), date);
    const scoreLabel = document.createElement('strong');
    scoreLabel.textContent = `${entry.score}/${entry.total} · ${entry.percent}%`;
    row.append(meta, scoreLabel);
    return row;
  }));
}
byId('clear-history-btn').addEventListener('click', () => {
  if (!readHistory().length) return;
  if (window.confirm('Clear all saved quiz scores?')) {
    localStorage.removeItem('quizHistory');
    showLeaderboard();
  }
});
function backToMenuFromLeaderboard() { byId('leaderboard-screen').classList.add('hidden'); byId('menu-screen').classList.remove('hidden'); }
function openQuiz(mode = 'classic') { gameMode = mode; byId('menu-screen').classList.add('hidden'); byId('start-screen').classList.remove('hidden'); }

/* Reaction test, including early-click detection and best time. */
function openReaction() { byId('menu-screen').classList.add('hidden'); byId('reaction-screen').classList.remove('hidden'); startReactionGame(); }
function startReactionGame() {
  const button = byId('reaction-btn');
  byId('reaction-result').textContent = '';
  byId('reaction-text').textContent = 'Wait for green, then tap as fast as you can.';
  button.disabled = false;
  button.textContent = 'Wait…';
  button.style.background = '#f2a33a';
  clearTimeout(reactionTimeout);
  reactionStartTime = null;
  reactionTimeout = setTimeout(() => {
    if (byId('reaction-screen').classList.contains('hidden')) return;
    byId('reaction-text').textContent = 'NOW! Tap the green button!';
    button.textContent = 'TAP!';
    button.style.background = '#14845f';
    reactionStartTime = performance.now();
  }, Math.random() * 2500 + 1500);
  button.onclick = () => {
    if (reactionStartTime === null) {
      clearTimeout(reactionTimeout);
      byId('reaction-text').textContent = 'Too soon! Wait for green this time.';
      byId('reaction-result').textContent = '';
      button.disabled = true;
      button.textContent = 'Too soon…';
      reactionTimeout = setTimeout(startReactionGame, 1100);
      return;
    }
    const reactionTime = Math.round(performance.now() - reactionStartTime);
    const previousBest = Number(localStorage.getItem('reactionBest')) || Infinity;
    const isRecord = reactionTime < previousBest;
    if (isRecord) localStorage.setItem('reactionBest', String(reactionTime));
    byId('reaction-result').textContent = `${reactionTime} ms${isRecord ? ' · New personal best!' : ` · Best: ${Math.min(previousBest, reactionTime)} ms`}`;
    byId('reaction-text').textContent = 'Great reflexes. Get ready for another round.';
    button.disabled = true;
    button.textContent = 'Again soon…';
    button.style.background = '#667085';
    reactionStartTime = null;
    reactionTimeout = setTimeout(startReactionGame, 1800);
  };
}
function backToMenu() { clearTimeout(reactionTimeout); byId('reaction-screen').classList.add('hidden'); byId('menu-screen').classList.remove('hidden'); }

/* Memory match with move and pair tracking. */
byId('memory-restart-btn').addEventListener('click', startMemoryGame);
function openMemoryGame() { byId('menu-screen').classList.add('hidden'); byId('memory-screen').classList.remove('hidden'); startMemoryGame(); }
function startMemoryGame() {
  clearTimeout(memoryTimeout);
  const grid = byId('memory-grid');
  grid.replaceChildren();
  flippedCards = [];
  matchedCount = 0;
  memoryMoves = 0;
  memoryLocked = false;
  updateMemoryStats();
  byId('memory-message').textContent = '';
  shuffle([...memoryEmojis]).forEach((emoji, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.value = emoji;
    card.dataset.cardIndex = String(index + 1);
    card.setAttribute('aria-label', `Card ${index + 1}, hidden`);
    card.addEventListener('click', () => handleCardClick(card, index));
    grid.appendChild(card);
  });
}
function updateMemoryStats() { byId('memory-stats').innerHTML = `Moves: ${memoryMoves} <span>•</span> Pairs: ${matchedCount / 2} / 8`; }
function handleCardClick(card, index) {
  if (memoryLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  card.textContent = card.dataset.value;
  card.setAttribute('aria-label', `Card ${index + 1}, ${card.dataset.value}`);
  flippedCards.push(card);
  if (flippedCards.length < 2) return;
  memoryMoves++;
  updateMemoryStats();
  const [first, second] = flippedCards;
  if (first.dataset.value === second.dataset.value) {
    first.classList.add('matched');
    second.classList.add('matched');
    first.disabled = true;
    second.disabled = true;
    matchedCount += 2;
    flippedCards = [];
    updateMemoryStats();
    if (matchedCount === memoryEmojis.length) byId('memory-message').textContent = `🎉 All pairs found in ${memoryMoves} moves!`;
  } else {
    memoryLocked = true;
    memoryTimeout = window.setTimeout(() => {
      [first, second].forEach((item, itemIndex) => {
        item.classList.remove('flipped');
        item.textContent = '';
        item.setAttribute('aria-label', `Card ${item.dataset.cardIndex}, hidden`);
      });
      flippedCards = [];
      memoryLocked = false;
    }, 800);
  }
}
function backToMenuFromMemory() { clearTimeout(memoryTimeout); memoryLocked = false; flippedCards = []; byId('memory-screen').classList.add('hidden'); byId('menu-screen').classList.remove('hidden'); }

/* Keyboard shortcuts for answer selection. */
document.addEventListener('keydown', event => {
  if (byId('quiz-screen').classList.contains('hidden') || answerLocked) return;
  if (/^[1-4]$/.test(event.key)) {
    const button = byId('options').children[Number(event.key) - 1];
    if (button) button.click();
  }
});
