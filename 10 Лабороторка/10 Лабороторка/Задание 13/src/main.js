import { QUESTIONS } from "./modules/questions.js";
import { createQuiz, isFinished, validateChoice, submitAnswer } from "./modules/quiz.js";
import { loadBest, saveBest } from "./modules/storage.js";
import { renderQuestion, renderProgress, renderResult, showFeedback, showError } from "./modules/ui.js";

const quizBox = document.querySelector("#quiz");
const bar = document.querySelector("#bar");
const progressText = document.querySelector("#progress-text");
const feedbackBox = document.querySelector("#feedback");
const errorBox = document.querySelector("#error");
const button = document.querySelector("#submit");

let quiz = createQuiz();

function show() {
  renderProgress(bar, progressText, quiz.index, QUESTIONS.length);
  if (isFinished(quiz)) {
    const best = Math.max(loadBest(), quiz.score);
    saveBest(best);
    renderResult(quizBox, quiz.score, QUESTIONS.length, best);
    button.textContent = "Пройти заново";
  } else {
    renderQuestion(quizBox, QUESTIONS[quiz.index]);
    button.textContent = "Ответить";
  }
}

function handleSubmit() {
  if (isFinished(quiz)) {
    quiz = createQuiz();
    showFeedback(feedbackBox, "", true);
    show();
    return;
  }
  const selected = quizBox.querySelector("input[name='answer']:checked");
  const parsed = validateChoice(selected?.value, QUESTIONS[quiz.index]);
  if (!parsed.ok) {
    showError(errorBox, parsed.error);
    return;
  }
  const question = QUESTIONS[quiz.index];
  quiz = submitAnswer(quiz, parsed.value);
  showFeedback(feedbackBox, quiz.lastCorrect ? "Верно!" : `Неверно. Правильный ответ: ${question.options[question.correct]}`, quiz.lastCorrect);
  showError(errorBox, "");
  show();
}

button.addEventListener("click", handleSubmit);
quizBox.addEventListener("change", () => showError(errorBox, ""));
show();
