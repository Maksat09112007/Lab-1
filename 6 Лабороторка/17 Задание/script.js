const questions = [
  {
    question: "Какой метод вернет только первый подходящий элемент?",
    answers: ["getElementsByClassName()", "querySelector()", "querySelectorAll()", "getAll()"],
    correct: 1
  },
  {
    question: "Как создать новый элемент li?",
    answers: ["document.newElement('li')", "document.add('li')", "document.createElement('li')", "new li()"],
    correct: 2
  },
  {
    question: "Какой метод удаляет элемент со страницы?",
    answers: ["remove()", "delete()", "clear()", "hide()"],
    correct: 0
  },
  {
    question: "Как узнать, какая клавиша была нажата?",
    answers: ["event.target", "event.type", "event.key", "event.button"],
    correct: 2
  },
  {
    question: "Что делает classList.toggle('red')?",
    answers: [
      "Всегда добавляет класс red",
      "Всегда удаляет класс red",
      "Добавляет класс, если его нет, и убирает, если он есть",
      "Меняет все классы на red"
    ],
    correct: 2
  }
];

const content = document.querySelector("#content");
const progress = document.querySelector("#progress");

let current = 0; // Использование let, так как номер вопроса меняется (current++)
let points = 0;  // Использование let, так как количество очков растет (points++)

function showQuestion() {
  content.innerHTML = "";
  progress.textContent = "Вопрос " + (current + 1) + " из " + questions.length;

  const q = questions[current];

  const title = document.createElement("div");
  title.className = "question";
  title.textContent = q.question;
  content.append(title);

  for (let i = 0; i < q.answers.length; i++) {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = q.answers[i];
    btn.setAttribute("data-num", i);
    btn.addEventListener("click", chooseAnswer);
    content.append(btn);
  }
}

function chooseAnswer(event) {
  const btn = event.target;
  const chosen = Number(btn.getAttribute("data-num"));
  const correct = questions[current].correct;
  const buttons = document.querySelectorAll(".answer");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }

  buttons[correct].classList.add("right");
  if (chosen === correct) {
    points++;
  } else {
    btn.classList.add("wrong");
  }

  setTimeout(function () {
    current++;
    if (current < questions.length) {
      showQuestion();
    } else {
      showResult();
    }
  }, 1000);
}

function showResult() {
  content.innerHTML = "";
  progress.textContent = "Тест окончен";

  const box = document.createElement("div");
  box.className = "result";

  const big = document.createElement("div");
  big.className = "big";
  big.textContent = points + " из " + questions.length;

  const text = document.createElement("p");
  if (points === questions.length) {
    text.textContent = "Все ответы верные!";
  } else if (points >= 3) {
    text.textContent = "Неплохо, но есть что повторить.";
  } else {
    text.textContent = "Лучше перечитать теорию.";
  }

  const again = document.createElement("button");
  again.className = "restart";
  again.textContent = "Пройти еще раз";
  again.addEventListener("click", function () {
    current = 0;
    points = 0;
    showQuestion();
  });

  box.append(big);
  box.append(text);
  box.append(again);
  content.append(box);
}

showQuestion();

