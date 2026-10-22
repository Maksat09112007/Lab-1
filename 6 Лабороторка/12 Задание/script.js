const openBtn = document.querySelector("#openBtn");
const closeBtn = document.querySelector("#closeBtn");
const back = document.querySelector("#back");
const statusBox = document.querySelector("#status");

function openWindow() {
  back.classList.remove("hidden");
  statusBox.textContent = "Статус: окно открыто";
}

function closeWindow(how) {
  if (back.classList.contains("hidden")) {
    return;
  }
  back.classList.add("hidden");
  statusBox.textContent = "Статус: окно закрыто (" + how + ")";
}

openBtn.addEventListener("click", openWindow);

closeBtn.addEventListener("click", function () {
  closeWindow("кнопкой");
});

back.addEventListener("click", function (event) {
  if (event.target === back) {
    closeWindow("кликом вне окна");
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeWindow("клавишей Esc");
  }
});
