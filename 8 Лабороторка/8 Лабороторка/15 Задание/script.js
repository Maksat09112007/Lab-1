const STORAGE_KEY = "lab8_kanban";
const STATUSES = ["plan", "progress", "done"];

const form = document.querySelector("#addForm");
const titleInput = document.querySelector("#title");
const statusSelect = document.querySelector("#status");
const errorEl = document.querySelector("#error");
const exportBtn = document.querySelector("#exportBtn");
const importFile = document.querySelector("#importFile");
const clearBtn = document.querySelector("#clearBtn");
const columns = document.querySelectorAll(".column");

function showError(text) {
  errorEl.textContent = text;
}

function isCard(c) {
  return (
    c !== null &&
    typeof c === "object" &&
    typeof c.id === "string" &&
    typeof c.title === "string" &&
    c.title.trim() !== "" &&
    STATUSES.includes(c.status)
  );
}

function loadCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Ожидался массив");
    return parsed.filter(isCard);
  } catch (err) {
    showError("Сохранённые данные повреждены — доска создана заново.");
    return [];
  }
}

let cards = loadCards();
let draggedId = null;

function saveCards() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    showError("Не удалось сохранить данные в localStorage.");
  }
  render();
}

function newId() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function moveCard(id, status) {
  const card = cards.find((c) => c.id === id);
  if (!card || card.status === status) return;
  card.status = status;
  saveCards();
}

function deleteCard(id) {
  cards = cards.filter((c) => c.id !== id);
  saveCards();
}

function createCardElement(card) {
  const li = document.createElement("li");
  li.className = "card";
  li.draggable = true;
  li.dataset.id = card.id;

  const p = document.createElement("p");
  p.textContent = card.title;
  li.append(p);

  const actions = document.createElement("div");
  actions.className = "actions";

  const index = STATUSES.indexOf(card.status);

  const left = document.createElement("button");
  left.type = "button";
  left.textContent = "←";
  left.title = "Назад";
  left.disabled = index === 0;
  left.addEventListener("click", () => moveCard(card.id, STATUSES[index - 1]));

  const right = document.createElement("button");
  right.type = "button";
  right.textContent = "→";
  right.title = "Вперёд";
  right.disabled = index === STATUSES.length - 1;
  right.addEventListener("click", () => moveCard(card.id, STATUSES[index + 1]));

  const del = document.createElement("button");
  del.type = "button";
  del.className = "del";
  del.textContent = "Удалить";
  del.addEventListener("click", () => deleteCard(card.id));

  actions.append(left, right, del);
  li.append(actions);

  li.addEventListener("dragstart", (e) => {
    draggedId = card.id;
    li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
  });
  li.addEventListener("dragend", () => {
    draggedId = null;
    li.classList.remove("dragging");
  });

  return li;
}

function render() {
  STATUSES.forEach((status) => {
    const list = document.querySelector("#list-" + status);
    const count = document.querySelector("#count-" + status);
    const items = cards.filter((c) => c.status === status);
    list.replaceChildren(...items.map(createCardElement));
    count.textContent = items.length;
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    showError("Введите название карточки.");
    return;
  }
  showError("");
  cards.push({ id: newId(), title: title, status: statusSelect.value });
  titleInput.value = "";
  saveCards();
});

columns.forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    col.classList.add("drag-over");
  });
  col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
  col.addEventListener("drop", (e) => {
    e.preventDefault();
    col.classList.remove("drag-over");
    if (draggedId) moveCard(draggedId, col.dataset.status);
  });
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Удалить все карточки?")) return;
  localStorage.removeItem(STORAGE_KEY);
  cards = [];
  render();
  showError("");
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kanban.json";
  a.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener("change", () => {
  const file = importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error("Ожидался массив");
      const valid = parsed.filter(isCard);
      if (valid.length === 0) throw new Error("Нет корректных карточек");
      cards = valid;
      showError("");
      saveCards();
    } catch (err) {
      showError("Файл не удалось импортировать: неверный формат JSON.");
    }
    importFile.value = "";
  });
  reader.readAsText(file);
});

render();
