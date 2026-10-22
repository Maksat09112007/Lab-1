const STORAGE_KEY = "lab8_settings";
const DEFAULTS = { theme: "light", fontSize: 16 };
const MIN_SIZE = 12;
const MAX_SIZE = 28;

const radios = document.querySelectorAll('input[name="theme"]');
const sizeInput = document.querySelector("#fontSize");
const sizeOut = document.querySelector("#sizeOut");
const resetBtn = document.querySelector("#resetBtn");
const storageView = document.querySelector("#storageView");
const message = document.querySelector("#message");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function isValid(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    (data.theme === "light" || data.theme === "dark") &&
    Number.isInteger(data.fontSize) &&
    data.fontSize >= MIN_SIZE &&
    data.fontSize <= MAX_SIZE
  );
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    if (isValid(parsed)) return parsed;
    throw new Error("Неверная структура данных");
  } catch (err) {
    showMessage("Сохранённые настройки повреждены — применены значения по умолчанию.", true);
    return { ...DEFAULTS };
  }
}

let settings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    showMessage("Не удалось сохранить настройки (хранилище недоступно).", true);
  }
  renderStorage();
}

function applySettings() {
  document.body.dataset.theme = settings.theme;
  document.documentElement.style.setProperty("--size", settings.fontSize + "px");
  sizeInput.value = settings.fontSize;
  sizeOut.textContent = settings.fontSize;
  radios.forEach((radio) => {
    radio.checked = radio.value === settings.theme;
  });
}

function renderStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  storageView.textContent = raw === null ? "(ключ отсутствует)" : STORAGE_KEY + " = " + raw;
}

radios.forEach((radio) => {
  radio.addEventListener("change", () => {
    settings.theme = radio.value;
    applySettings();
    saveSettings();
    showMessage("Тема сохранена.");
  });
});

sizeInput.addEventListener("input", () => {
  settings.fontSize = Number(sizeInput.value);
  applySettings();
  saveSettings();
  showMessage("Размер текста сохранён.");
});

resetBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  settings = { ...DEFAULTS };
  applySettings();
  renderStorage();
  showMessage("Настройки сброшены, ключ удалён из хранилища.");
});

applySettings();
renderStorage();
