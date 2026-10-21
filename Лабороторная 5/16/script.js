// Лаба 5, задание 16 - список задач
const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const counterEl = document.getElementById("counter");
const errorEl = document.getElementById("error");
const clearBtn = document.getElementById("clearDone");
const filterButtons = document.querySelectorAll(".filter");

let tasks = [];
let nextId = 1;
let currentFilter = "all";

function addTask() {
  let text = input.value.trim();
  if (text === "") {
    errorEl.textContent = "Введите текст задачи";
    return;
  }
  errorEl.textContent = "";
  tasks.push({ id: nextId, text: text, done: false });
  nextId++;
  input.value = "";
  render();
}

function render() {
  listEl.innerHTML = "";

  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];

    // фильтр
    if (currentFilter === "active" && task.done) continue;
    if (currentFilter === "done" && !task.done) continue;

    let li = document.createElement("li");
    if (task.done) {
      li.className = "done";
    }

    let span = document.createElement("span");
    span.textContent = task.text;
    span.addEventListener("click", function () {
      task.done = !task.done;
      render();
    });

    let del = document.createElement("button");
    del.textContent = "x";
    del.className = "small";
    del.addEventListener("click", function () {
      tasks = tasks.filter(function (t) {
        return t.id !== task.id;
      });
      render();
    });

    li.appendChild(span);
    li.appendChild(del);
    listEl.appendChild(li);
  }

  // считаем выполненные
  let doneCount = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].done) {
      doneCount++;
    }
  }
  counterEl.textContent = "Выполнено: " + doneCount + ", не выполнено: " + (tasks.length - doneCount);
}

addBtn.addEventListener("click", addTask);
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});
clearBtn.addEventListener("click", function () {
  tasks = tasks.filter(function (t) {
    return !t.done;
  });
  render();
});
for (let i = 0; i < filterButtons.length; i++) {
  filterButtons[i].addEventListener("click", function () {
    currentFilter = filterButtons[i].dataset.filter;
    for (let j = 0; j < filterButtons.length; j++) {
      filterButtons[j].classList.remove("chosen");
    }
    filterButtons[i].classList.add("chosen");
    render();
  });
}

render();
