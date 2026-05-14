/* ============================================================
   QUIZ DATA & LOGIC
   ============================================================ */

const QUESTIONS = [
  {
    text: "Who is credited as the primary author of the Declaration of Independence?",
    choices: [
      "George Washington",
      "Thomas Jefferson",
      "John Adams",
      "Benjamin Franklin"
    ],
    correct: 1
  },
  {
    text: "In what year was the Declaration of Independence signed?",
    choices: ["1774", "1775", "1776", "1777"],
    correct: 2
  },
  {
    text: "Which city was the Declaration of Independence signed in?",
    choices: ["Boston", "New York", "Washington D.C.", "Philadelphia"],
    correct: 3
  },
  {
    text: "What are the three 'unalienable Rights' listed in the Declaration?",
    choices: [
      "Life, Freedom, Property",
      "Life, Liberty, and the pursuit of Happiness",
      "Speech, Religion, and Assembly",
      "Peace, Justice, and Liberty"
    ],
    correct: 1
  },
  {
    text: "How many colonies signed the Declaration of Independence?",
    choices: ["11", "12", "13", "14"],
    correct: 2
  },
  {
    text: "Which country did the colonies declare independence from?",
    choices: ["France", "Spain", "Great Britain", "Portugal"],
    correct: 2
  },
  {
    text: "What does 'unalienable' mean?",
    choices: [
      "Can be taken away",
      "Cannot be taken away",
      "Given by the king",
      "Earned through work"
    ],
    correct: 1
  },
  {
    text: "The Declaration of Independence begins its famous second paragraph with which words?",
    choices: [
      '"Four score and seven years ago"',
      '"We hold these truths to be self-evident"',
      '"Give me liberty or give me death"',
      '"We the People"'
    ],
    correct: 1
  },
  {
    text: "Who was the King of Great Britain when the Declaration was signed?",
    choices: ["King George II", "King George III", "King James I", "King Henry VIII"],
    correct: 1
  },
  {
    text: "Approximately how many people signed the Declaration of Independence?",
    choices: ["13", "26", "56", "100"],
    correct: 2
  }
];

const LETTERS = ['A', 'B', 'C', 'D'];

let currentQuestion = 0;
let score           = 0;
let missedQuestions = [];
let answered        = false;

/* DOM references */
const startScreen    = document.getElementById('quiz-start');
const quizArea       = document.getElementById('quiz-area');
const quizResult     = document.getElementById('quiz-result');
const startBtn       = document.getElementById('start-quiz-btn');
const retakeBtn      = document.getElementById('retake-btn');
const nextBtn        = document.getElementById('next-btn');
const qNumber        = document.getElementById('q-number');
const qText          = document.getElementById('q-text');
const answerGrid     = document.getElementById('answer-grid');
const progressBar    = document.getElementById('quiz-progress-bar');
const progressLabel  = document.getElementById('progress-label');
const progressWrap   = document.getElementById('progress-bar-wrap');
const feedbackEl     = document.getElementById('quiz-feedback');
const finalScoreEl   = document.getElementById('final-score');
const scoreMessage   = document.getElementById('score-message');
const scoreSubmsg    = document.getElementById('score-submessage');
const shareBox       = document.getElementById('share-box');
const missedList     = document.getElementById('missed-list');
const missedItems    = document.getElementById('missed-items');

function startQuiz() {
  currentQuestion = 0;
  score           = 0;
  missedQuestions = [];
  answered        = false;

  startScreen.classList.add('hidden');
  quizResult.classList.remove('show');
  quizResult.classList.add('hidden');
  quizArea.classList.remove('hidden');

  loadQuestion();
}

function loadQuestion() {
  answered = false;
  const q = QUESTIONS[currentQuestion];

  const pct = (currentQuestion / QUESTIONS.length) * 100;
  progressBar.style.width = pct + '%';
  progressWrap.setAttribute('aria-valuenow', currentQuestion);
  progressLabel.textContent = `Question ${currentQuestion + 1} of ${QUESTIONS.length}`;

  qNumber.textContent = `Question ${currentQuestion + 1}`;
  qText.textContent   = q.text;

  feedbackEl.textContent = '';
  feedbackEl.className   = 'quiz-feedback';

  nextBtn.classList.remove('enabled');

  answerGrid.innerHTML = '';
  q.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.classList.add('answer-btn');
    btn.setAttribute('data-index', idx);
    btn.setAttribute('aria-label', `${LETTERS[idx]}: ${choice}`);
    btn.innerHTML = `<span class="letter">${LETTERS[idx]}.</span> <span>${choice}</span>`;
    btn.addEventListener('click', () => handleAnswer(idx));
    answerGrid.appendChild(btn);
  });
}

function handleAnswer(selectedIdx) {
  if (answered) return;
  answered = true;

  const q       = QUESTIONS[currentQuestion];
  const isRight = selectedIdx === q.correct;
  const buttons = answerGrid.querySelectorAll('.answer-btn');

  buttons.forEach(btn => { btn.disabled = true; });

  if (isRight) {
    score++;
    buttons[selectedIdx].classList.add('correct');
    feedbackEl.textContent = '✓ Correct! Well done!';
    feedbackEl.className   = 'quiz-feedback correct';
  } else {
    buttons[selectedIdx].classList.add('wrong');
    buttons[q.correct].classList.add('show-correct');
    missedQuestions.push(currentQuestion);
    feedbackEl.textContent = `✗ Not quite — the correct answer is: ${LETTERS[q.correct]}. ${q.choices[q.correct]}`;
    feedbackEl.className   = 'quiz-feedback wrong';
  }

  nextBtn.classList.add('enabled');

  if (currentQuestion === QUESTIONS.length - 1) {
    nextBtn.textContent = 'See Results ✿';
  }
}

function nextQuestion() {
  if (!answered) return;
  currentQuestion++;

  if (currentQuestion >= QUESTIONS.length) {
    showResults();
  } else {
    loadQuestion();
  }
}

function showResults() {
  quizArea.classList.add('hidden');
  quizResult.classList.remove('hidden');
  quizResult.classList.add('show');

  progressBar.style.width = '100%';

  finalScoreEl.textContent = score;

  let msg, submsg;
  if (score >= 9) {
    msg    = '🎉 Founding Father Level!';
    submsg = 'You know your history! A true patriot scholar!';
  } else if (score >= 7) {
    msg    = '⭐ Patriot Scholar!';
    submsg = 'Great work! You have a strong grasp of American history.';
  } else if (score >= 5) {
    msg    = '🌸 Keep Exploring!';
    submsg = "You're on the right path! A little more study and you'll be a history expert.";
  } else {
    msg    = '📜 Time to Bloom!';
    submsg = 'Visit the Declaration section on the Home page and try again — you\'ve got this!';
  }

  scoreMessage.textContent  = msg;
  scoreSubmsg.textContent   = submsg;

  shareBox.textContent = `You scored ${score}/10 on the Liberty in Bloom quiz about the Declaration of Independence! 🌸 Test your knowledge at Liberty in Bloom — A Floral Celebration of America's 250th Birthday (July 4, 2026).`;

  if (missedQuestions.length > 0) {
    missedList.style.display = 'block';
    missedItems.innerHTML = '';
    missedQuestions.forEach(idx => {
      const div = document.createElement('div');
      div.classList.add('missed-q-item');
      div.textContent = `Q${idx + 1}: ${QUESTIONS[idx].text}`;
      missedItems.appendChild(div);
    });
  } else {
    missedList.style.display = 'none';
  }

  const QUIZ_RATE_KEY = 'libertyBloom_lastQuiz';
  if (!isRateLimited(QUIZ_RATE_KEY, 24 * 60 * 60 * 1000)) {
    saveQuizResult(score, missedQuestions);
    markSubmission(QUIZ_RATE_KEY);
  }

  launchFireworks();

  nextBtn.textContent = 'Next Question →';
}

function retakeQuiz() {
  quizResult.classList.remove('show');
  quizResult.classList.add('hidden');
  startQuiz();
}

/* Event Listeners */
startBtn.addEventListener('click', startQuiz);
retakeBtn.addEventListener('click', retakeQuiz);
nextBtn.addEventListener('click', nextQuestion);

// Keyboard navigation for answer buttons
document.addEventListener('keydown', function(e) {
  if (!quizArea.classList.contains('hidden') && !answered) {
    const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    const idx = keyMap[e.key.toLowerCase()];
    if (idx !== undefined) {
      const buttons = answerGrid.querySelectorAll('.answer-btn');
      if (buttons[idx]) handleAnswer(idx);
    }
  }
  if (e.key === 'Enter' && nextBtn.classList.contains('enabled') && !quizArea.classList.contains('hidden')) {
    nextQuestion();
  }
});
