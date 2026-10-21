let tasks = [
  { id: 1, text: "Сделать лабораторную по SPA", done: false },
  { id: 2, text: "Купить тетрадь для конспектов", done: true },
  { id: 3, text: "Подготовиться к защите", done: false }
];
let nextId = 4;
let currentTab = "all";


try {
  const saved = JSON.parse(localStorage.getItem("todo_tasks"));
  if (Array.isArray(saved)) {
    tasks = saved;
    nextId = tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1;
  }
  currentTab = localStorage.getItem("todo_tab") || "all";
} catch (e) {}

const content = document.querySelector("#content");
const tabs = document.querySelectorAll("[data-page]");
const input = document.querySelector("#newTask");
const msg = document.querySelector("#msg");

const filters = {
  all: t => true,
  active: t => !t.done,
  done: t => t.done
};
const emptyText = {
  all: "Задач пока нет. Добавьте первую.",
  active: "Все задачи выполнены.",
  done: "Выполненных задач пока нет."
};

function save() {
  try {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
    localStorage.setItem("todo_tab", currentTab);
  } catch (e) {}
}

function updateCounters() {
  Object.keys(filters).forEach(key => {
    document.querySelector(`[data-count="${key}"]`).textContent =
      tasks.filter(filters[key]).length;
  });
}

function render() {
  const visible = tasks.filter(filters[currentTab]);
  content.replaceChildren();

  if (visible.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = emptyText[currentTab];
    content.append(p);
  } else {
    const ul = document.createElement("ul");
    ul.className = "list";
    visible.forEach(task => ul.append(makeItem(task)));
    content.append(ul);
  }

  tabs.forEach(btn => {
    const on = btn.dataset.page === currentTab;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on);
  });
  updateCounters();
  save();
}

function makeItem(task) {
  const li = document.createElement("li");
  li.className = "item" + (task.done ? " done" : "");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = task.done;
  check.setAttribute("aria-label", "Выполнено");
  check.addEventListener("change", () => {
    task.done = check.checked;
    render();
  });

  const span = document.createElement("span");
  span.className = "text";
  span.textContent = task.text;

  const del = document.createElement("button");
  del.className = "del";
  del.type = "button";
  del.textContent = "×";
  del.setAttribute("aria-label", "Удалить задачу");
  del.addEventListener("click", () => {
    tasks = tasks.filter(t => t.id !== task.id);
    render();
  });

  li.append(check, span, del);
  return li;
}

function addTask() {
  const text = input.value.trim();
  if (text === "") {
    msg.textContent = "Введите текст задачи.";
    return;
  }
  if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
    msg.textContent = "Такая задача уже есть в списке.";
    return;
  }
  msg.textContent = "";
  tasks.push({ id: nextId++, text: text, done: false });
  input.value = "";
  render();
}

document.querySelector("#addBtn").addEventListener("click", addTask);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});
input.addEventListener("input", () => { msg.textContent = ""; });

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    currentTab = btn.dataset.page;
    render();
  });
});

if (!filters[currentTab]) currentTab = "all";
render();
