// Модуль логики викторины: чистые функции, без DOM. Состояние — { index, score }.
import { QUESTIONS } from "./questions.js";

export function createQuiz() {
  return { index: 0, score: 0, lastCorrect: null };
}

export function isFinished(quiz, questions = QUESTIONS) {
  return quiz.index >= questions.length;
}

export function validateChoice(raw, question) {
  const text = raw === null || raw === undefined ? "" : String(raw).trim();
  if (text === "") {
    return { ok: false, error: "Выберите вариант ответа" };
  }
  if (!/^\d+$/.test(text) || Number(text) >= question.options.length) {
    return { ok: false, error: "Некорректный вариант ответа" };
  }
  return { ok: true, value: Number(text) };
}

export function submitAnswer(quiz, choice, questions = QUESTIONS) {
  if (isFinished(quiz, questions)) return quiz; // повторный ответ после конца не меняет счёт
  const correct = questions[quiz.index].correct === choice;
  return { index: quiz.index + 1, score: quiz.score + (correct ? 1 : 0), lastCorrect: correct };
}
