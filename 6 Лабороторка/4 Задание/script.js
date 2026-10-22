const textInput = document.querySelector("#text");
const addBtn = document.querySelector("#add");
const searchInput = document.querySelector("#search");
const notes = document.querySelector("#notes");
const emptyText = document.querySelector("#empty");
const errorBox = document.querySelector("#error");
const countBox = document.querySelector("#count");

function addNote() {
    const value = textInput.value.trim();

    if (value === "") {
        errorBox.textContent = "Напиши текст заметки!";
        errorBox.classList.add("show");
        return;
    }

    errorBox.textContent = "";
    errorBox.classList.remove("show");

    const note = document.createElement("div");
    note.className = "note";

    const p = document.createElement("span");
    p.textContent = value;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Удалить";
    delBtn.setAttribute("title", "Удалить заметку");
    
    delBtn.addEventListener("click", function () {
        note.remove();
        update();
    });

    note.append(p);
    note.append(delBtn);
    notes.append(note);

    textInput.value = "";
    textInput.focus();
    update();
}

function update() {
    const query = searchInput.value.toLowerCase();
    const all = document.querySelectorAll(".note");
    let visible = 0; // Переменная меняется, поэтому let

    // Классический цикл for — работает везде и без ошибок!
    for (let i = 0; i < all.length; i++) {
        const noteText = all[i].querySelector("span").textContent.toLowerCase();
        
        if (noteText.indexOf(query) !== -1) {
            all[i].style.display = "flex";
            visible++;
        } else {
            all[i].style.display = "none";
        }
    }

    countBox.textContent = "Всего: " + visible;

    if (all.length === 0) {
        emptyText.style.display = "block";
    } else {
        emptyText.style.display = "none";
    }
}

addBtn.addEventListener("click", addNote);

textInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        addNote();
    }
});

searchInput.addEventListener("input", update);

update();
