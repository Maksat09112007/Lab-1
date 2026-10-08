
var textInput = document.querySelector("#text");
var addBtn = document.querySelector("#add");
var searchInput = document.querySelector("#search");
var notes = document.querySelector("#notes");
var emptyText = document.querySelector("#empty");
var errorBox = document.querySelector("#error");
var countBox = document.querySelector("#count");


function addNote() {
  var value = textInput.value.trim();

  if (value === "") {
    errorBox.textContent = "Напиши текст заметки!";
    errorBox.classList.add("show");
    return;
  }
  errorBox.textContent = "";
  errorBox.classList.remove("show");

  var note = document.createElement("div");
  note.className = "note";

  var p = document.createElement("span");
  p.textContent = value;

  var delBtn = document.createElement("button");
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
  var query = searchInput.value.toLowerCase();
  var all = document.querySelectorAll(".note");
  var visible = 0;

  for (var i = 0; i < all.length; i++) {
    var noteText = all[i].querySelector("span").textContent.toLowerCase();
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
