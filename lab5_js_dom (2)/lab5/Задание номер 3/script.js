// Лаба 5, задание 3 - счетчик
const valueEl = document.getElementById("value");
const stepEl = document.getElementById("step");
const messageEl = document.getElementById("message");
const historyEl = document.getElementById("history");

let count = 0;
let history = [];

// берем шаг из поля и проверяем его
function getStep() {
  let step = Number(stepEl.value);
  if (step < 1 || step % 1 !== 0) {
    return 0;
  }
  return step;
}

function show() {
  valueEl.textContent = count;
  valueEl.className = "zero";
  if (count > 0) {
    valueEl.className = "positive";
  }
  if (count < 0) {
    valueEl.className = "negative";
  }

  historyEl.innerHTML = "";
  for (let i = history.length - 1; i >= 0; i--) {
    let li = document.createElement("li");
    li.textContent = history[i];
    historyEl.appendChild(li);
  }
}

function change(sign) {
  let step = getStep();
  if (step === 0) {
    messageEl.textContent = "Шаг должен быть целым числом больше 0";
    return;
  }
  messageEl.textContent = "";
  count = count + sign * step;
  if (sign > 0) {
    history.push("+" + step + ", стало " + count);
  } else {
    history.push("-" + step + ", стало " + count);
  }
  if (history.length > 10) {
    history.shift();
  }
  show();
}

document.getElementById("plus").addEventListener("click", function () {
  change(1);
});
document.getElementById("minus").addEventListener("click", function () {
  change(-1);
});
document.getElementById("reset").addEventListener("click", function () {
  count = 0;
  history = [];
  messageEl.textContent = "";
  show();
});
stepEl.addEventListener("input", function () {
  if (getStep() === 0) {
    messageEl.textContent = "Шаг должен быть целым числом больше 0";
  } else {
    messageEl.textContent = "";
  }
});

show();
