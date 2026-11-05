// Дополнительный (творческий) модуль: лучший результат в localStorage.
const KEY = "lab10_quiz_best";

export function loadBest() {
  try {
    const value = Number(localStorage.getItem(KEY));
    return Number.isInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBest(score) {
  try {
    localStorage.setItem(KEY, String(score));
  } catch {
    /* хранилище недоступно */
  }
}
