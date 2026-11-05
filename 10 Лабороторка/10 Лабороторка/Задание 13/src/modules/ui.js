// Модуль интерфейса: только работа с DOM.
function createElement(tag, text = "", className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

export function renderQuestion(container, question) {
  container.replaceChildren(createElement("h2", question.text));
  question.options.forEach((option, index) => {
    const label = createElement("label", "", "option");
    const radio = createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.value = String(index);
    label.append(radio, option);
    container.append(label);
  });
}

export function renderProgress(bar, textBox, index, total) {
  bar.style.width = `${Math.round((index / total) * 100)}%`;
  textBox.textContent = index >= total ? "Викторина завершена" : `Вопрос ${index + 1} из ${total}`;
}

export function renderResult(container, score, total, best) {
  container.replaceChildren();
  const box = createElement("div", "", "result");
  box.append(createElement("p", "Ваш результат"), createElement("p", `${score} / ${total}`, "big"), createElement("p", `Лучший результат: ${best} / ${total}`));
  container.append(box);
}

export function showFeedback(element, text, isOk) {
  element.textContent = text;
  element.className = `feedback ${text ? (isOk ? "ok" : "bad") : ""}`;
}

export function showError(element, text) {
  element.textContent = text;
}
