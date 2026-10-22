const PROGRESS_KEY = "lab8_quiz_progress";
const BEST_KEY = "lab8_quiz_best";

const questions = [
  {
    text: "Какой метод превращает объект JavaScript в строку JSON?",
    options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "Object.toString()"],
    correct: 1
  },
  {
    text: "Что вернёт localStorage.getItem() для отсутствующего ключа?",
    options: ["undefined", "пустую строку", "null", "0"],
    correct: 2
  },
  {
    text: "Когда очищается sessionStorage?",
    options: [
      "При закрытии вкладки",
      "Через 24 часа",
      "Только вручную",
      "При обновлении страницы"
    ],
    correct: 0
  },
  {
    text: "Какой тип данных хранят Web Storage хранилища?",
    options: ["Только числа", "Только строки", "Любые объекты", "Только массивы"],
    correct: 1
  },
  {
    text: "Какой метод удаляет одну запись по ключу?",
    options: ["clear()", "deleteItem()", "removeItem()", "splice()"],
    correct: 2
  }
];

const bestEl = document.querySelector("#best");
const gameEl = document.querySelector("#game");
const resultEl = document.querySelector("#result");
const resultText = document.querySelector("#resultText");
const counterEl = document.querySelector("#counter");
const barEl = document.querySelector("#bar");
const questionEl = document.querySelector("#question");
const optionsEl = document.querySelector("#options");
const feedbackEl = document.querySelector("#feedback");
const nextBtn = document.querySelector("#nextBtn");
const restartBtn = document.querySelector("#restartBtn");
const storageView = document.querySelector("#storageView");

const freshProgress = () => ({ current: 0, score: 0, answered: false, chosen: null });

function readJSON(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (err) {
    feedbackEl.textContent = "Не удалось записать данные в хранилище.";
  }
}

function validProgress(p) {
  return (
    p !== null &&
    typeof p === "object" &&
    Number.isInteger(p.current) && p.current >= 0 && p.current <= questions.length &&
    Number.isInteger(p.score) && p.score >= 0 && p.score <= questions.length &&
    typeof p.answered === "boolean" &&
    (p.chosen === null || Number.isInteger(p.chosen))
  );
}

function validBest(b) {
  return (
    b !== null &&
    typeof b === "object" &&
    Number.isInteger(b.score) &&
    b.total === questions.length &&
    b.score >= 0 && b.score <= b.total
  );
}

let progress = readJSON(sessionStorage, PROGRESS_KEY);
if (!validProgress(progress)) progress = freshProgress();

function renderStorage() {
  const s = sessionStorage.getItem(PROGRESS_KEY);
  const l = localStorage.getItem(BEST_KEY);
  storageView.textContent =
    "sessionStorage[" + PROGRESS_KEY + "] = " + (s === null ? "(нет)" : s) + "\n" +
    "localStorage[" + BEST_KEY + "] = " + (l === null ? "(нет)" : l);
}

function saveProgress() {
  writeJSON(sessionStorage, PROGRESS_KEY, progress);
  renderStorage();
}

function renderBest() {
  const best = readJSON(localStorage, BEST_KEY);
  bestEl.textContent = validBest(best) ? best.score + " из " + best.total : "—";
}

function showAnswer(chosen) {
  const q = questions[progress.current];
  const buttons = optionsEl.querySelectorAll(".option");
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.correct) btn.classList.add("correct");
    else if (index === chosen) btn.classList.add("wrong");
  });
  feedbackEl.textContent = chosen === q.correct ? "Верно!" : "Неверно.";
  nextBtn.textContent = progress.current === questions.length - 1 ? "Показать результат" : "Дальше";
  nextBtn.hidden = false;
}

function answer(index) {
  if (progress.answered) return;
  progress.answered = true;
  progress.chosen = index;
  if (index === questions[progress.current].correct) progress.score += 1;
  saveProgress();
  showAnswer(index);
}

function renderQuestion() {
  const q = questions[progress.current];
  counterEl.textContent = "Вопрос " + (progress.current + 1) + " из " + questions.length;
  barEl.style.width = (progress.current / questions.length) * 100 + "%";
  questionEl.textContent = q.text;
  optionsEl.replaceChildren();
  feedbackEl.textContent = "";

  q.options.forEach((text, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.textContent = text;
    btn.addEventListener("click", () => answer(index));
    optionsEl.append(btn);
  });

  if (progress.answered) showAnswer(progress.chosen);
  else nextBtn.hidden = true;
}

function finish() {
  gameEl.hidden = true;
  resultEl.hidden = false;
  resultText.textContent = "Ваш результат: " + progress.score + " из " + questions.length + ".";

  const best = readJSON(localStorage, BEST_KEY);
  if (!validBest(best) || progress.score > best.score) {
    writeJSON(localStorage, BEST_KEY, { score: progress.score, total: questions.length });
    resultText.textContent += " Это новый рекорд!";
  }
  renderBest();
  renderStorage();
}

function render() {
  if (progress.current >= questions.length) {
    finish();
  } else {
    gameEl.hidden = false;
    resultEl.hidden = true;
    renderQuestion();
  }
}

nextBtn.addEventListener("click", () => {
  progress.current += 1;
  progress.answered = false;
  progress.chosen = null;
  saveProgress();
  render();
});

restartBtn.addEventListener("click", () => {
  progress = freshProgress();
  saveProgress();
  render();
});

renderBest();
renderStorage();
render();
