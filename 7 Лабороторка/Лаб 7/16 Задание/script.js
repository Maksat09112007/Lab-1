const SUBJECTS = ["Математика", "Программирование", "Базы данных", "Английский язык"];

let students = [
  { id: 1, name: "Абилов Данияр" },
  { id: 2, name: "Беккожина Айгерим" },
  { id: 3, name: "Жумабаев Ерлан" },
  { id: 4, name: "Ким Алина" }
];
let grades = [
  { id: 1, sid: 1, subject: "Математика", score: 78 },
  { id: 2, sid: 1, subject: "Программирование", score: 92 },
  { id: 3, sid: 2, subject: "Математика", score: 95 },
  { id: 4, sid: 2, subject: "Базы данных", score: 88 },
  { id: 5, sid: 3, subject: "Программирование", score: 54 },
  { id: 6, sid: 3, subject: "Английский язык", score: 67 },
  { id: 7, sid: 4, subject: "Базы данных", score: 81 },
  { id: 8, sid: 4, subject: "Математика", score: 73 }
];
let nextStudent = 5;
let nextGrade = 9;
let currentTab = "students";

try {
  const s = JSON.parse(localStorage.getItem("journal_students"));
  const g = JSON.parse(localStorage.getItem("journal_grades"));
  if (Array.isArray(s) && Array.isArray(g)) {
    students = s;
    grades = g;
    nextStudent = students.reduce((m, x) => Math.max(m, x.id), 0) + 1;
    nextGrade = grades.reduce((m, x) => Math.max(m, x.id), 0) + 1;
  }
  currentTab = localStorage.getItem("journal_tab") || "students";
} catch (e) {}

const content = document.querySelector("#content");
const tabs = document.querySelectorAll("[data-page]");



function h(tag, text, cls) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}

function avg(list) {
  if (list.length === 0) return null;
  return list.reduce((s, x) => s + x, 0) / list.length;
}

function fmt(x) {
  return x === null ? "—" : x.toFixed(1);
}

function studentAvg(id) {
  return avg(grades.filter(g => g.sid === id).map(g => g.score));
}

function studentName(id) {
  const s = students.find(x => x.id === id);
  return s ? s.name : "(удалён)";
}

function save() {
  try {
    localStorage.setItem("journal_students", JSON.stringify(students));
    localStorage.setItem("journal_grades", JSON.stringify(grades));
    localStorage.setItem("journal_tab", currentTab);
  } catch (e) {}
}

function table(headers, rows, numCols = []) {
  const wrap = h("div", undefined, "wide");
  const t = h("table");
  const head = h("tr");
  headers.forEach((text, i) => {
    head.append(h("th", text, numCols.includes(i) ? "num" : ""));
  });
  t.append(head);
  rows.forEach(r => t.append(r));
  wrap.append(t);
  return wrap;
}

function scoreClass(v) {
  if (v === null) return "";
  if (v < 50) return "low";
  if (v >= 90) return "high";
  return "";
}



function viewStudents() {
  const box = h("div");
  box.append(h("h2", "Список студентов"));

  const form = h("form", undefined, "row");
  form.noValidate = true;
  const name = h("input");
  name.type = "text";
  name.maxLength = 60;
  name.placeholder = "Фамилия Имя";
  name.setAttribute("aria-label", "Фамилия и имя студента");
  const btn = h("button", "Добавить студента");
  btn.type = "submit";
  form.append(name, btn);
  const err = h("p", "", "err");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const value = name.value.trim().replace(/\s+/g, " ");
    if (value.length < 3) {
      err.textContent = "Введите фамилию и имя (не меньше 3 символов).";
      return;
    }
    if (!/^[A-Za-zА-Яа-яЁё\- ]+$/.test(value)) {
      err.textContent = "В имени допустимы только буквы, пробел и дефис.";
      return;
    }
    if (students.some(s => s.name.toLowerCase() === value.toLowerCase())) {
      err.textContent = "Такой студент уже есть в журнале.";
      return;
    }
    students.push({ id: nextStudent++, name: value });
    render();
  });

  box.append(form, err);

  if (students.length === 0) {
    box.append(h("p", "В журнале пока нет студентов.", "empty"));
    return box;
  }

  const rows = students.map((s, i) => {
    const count = grades.filter(g => g.sid === s.id).length;
    const a = studentAvg(s.id);
    const tr = h("tr");
    const del = h("button", "×", "x");
    del.type = "button";
    del.title = "Удалить студента вместе с оценками";
    del.addEventListener("click", () => {
      students = students.filter(x => x.id !== s.id);
      grades = grades.filter(g => g.sid !== s.id);
      render();
    });
    const last = h("td");
    last.append(del);
    tr.append(h("td", i + 1), h("td", s.name), h("td", count, "num"),
              h("td", fmt(a), "num " + scoreClass(a)), last);
    return tr;
  });
  box.append(table(["№", "Студент", "Оценок", "Средний балл", ""], rows, [2, 3]));
  return box;
}



function viewGrades() {
  const box = h("div");
  box.append(h("h2", "Журнал оценок"));

  if (students.length === 0) {
    box.append(h("p", "Сначала добавьте студентов на вкладке «Студенты».", "empty"));
    return box;
  }

  const form = h("form", undefined, "row");
  form.noValidate = true;

  const selStudent = h("select");
  selStudent.setAttribute("aria-label", "Студент");
  students.forEach(s => {
    const o = h("option", s.name);
    o.value = s.id;
    selStudent.append(o);
  });

  const selSubject = h("select");
  selSubject.setAttribute("aria-label", "Предмет");
  SUBJECTS.forEach(s => selSubject.append(h("option", s)));

  const score = h("input");
  score.type = "number";
  score.placeholder = "0–100";
  score.setAttribute("aria-label", "Балл");

  const btn = h("button", "Поставить");
  btn.type = "submit";
  form.append(selStudent, selSubject, score, btn);
  const err = h("p", "", "err");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const raw = score.value.trim();
    const v = Number(raw);
    if (raw === "" || Number.isNaN(v)) {
      err.textContent = "Введите балл числом.";
      return;
    }
    if (!Number.isInteger(v) || v < 0 || v > 100) {
      err.textContent = "Балл должен быть целым числом от 0 до 100.";
      return;
    }
    grades.push({ id: nextGrade++, sid: Number(selStudent.value),
                  subject: selSubject.value, score: v });
    render();
  });

  box.append(form, err);

  if (grades.length === 0) {
    box.append(h("p", "Оценок пока нет.", "empty"));
    return box;
  }

  const rows = grades.slice().reverse().map(g => {
    const tr = h("tr");
    const del = h("button", "×", "x");
    del.type = "button";
    del.title = "Удалить оценку";
    del.addEventListener("click", () => {
      grades = grades.filter(x => x.id !== g.id);
      render();
    });
    const last = h("td");
    last.append(del);
    tr.append(h("td", studentName(g.sid)), h("td", g.subject),
              h("td", g.score, "num " + scoreClass(g.score)), last);
    return tr;
  });
  box.append(table(["Студент", "Предмет", "Балл", ""], rows, [2]));
  return box;
}



function bar(label, value, max) {
  const row = h("div", undefined, "bar-row");
  const track = h("div", undefined, "track");
  const fill = h("div", undefined, "fill");
  fill.style.width = max === 0 ? "0%" : (value / max * 100) + "%";
  track.append(fill);
  row.append(h("span", label, "lbl"), track, h("span", value, "val"));
  return row;
}

function viewStats() {
  const box = h("div");
  box.append(h("h2", "Статистика группы"));

  const all = grades.map(g => g.score);
  if (all.length === 0) {
    box.append(h("p", "Нет данных: поставьте хотя бы одну оценку.", "empty"));
    return box;
  }

  const ranked = students
    .map(s => ({ name: s.name, a: studentAvg(s.id) }))
    .filter(x => x.a !== null)
    .sort((p, q) => q.a - p.a);

  const cards = h("div", undefined, "cards");
  [
    [fmt(avg(all)), "средний балл группы"],
    [all.length, "всего оценок"],
    [ranked.length ? ranked[0].name : "—", "лучший средний балл"],
    [Math.max(...all) + " / " + Math.min(...all), "максимум / минимум"]
  ].forEach(([val, cap]) => {
    const c = h("div", undefined, "card");
    const b = h("b", val);
    if (typeof val === "string" && val.length > 12) b.style.fontSize = "1.15rem";
    c.append(b, h("span", cap));
    cards.append(c);
  });
  box.append(cards);

  box.append(h("h3", "Рейтинг студентов"));
  const rows = ranked.map((x, i) => {
    const tr = h("tr");
    tr.append(h("td", i + 1), h("td", x.name), h("td", fmt(x.a), "num " + scoreClass(x.a)));
    return tr;
  });
  box.append(table(["Место", "Студент", "Средний балл"], rows, [2]));

  box.append(h("h3", "Распределение оценок"));
  const bands = [
    ["0–49 (ниже порога)", s => s < 50],
    ["50–69", s => s >= 50 && s < 70],
    ["70–89", s => s >= 70 && s < 90],
    ["90–100", s => s >= 90]
  ];
  const counts = bands.map(([name, f]) => [name, all.filter(f).length]);
  const top = Math.max(...counts.map(c => c[1]));
  counts.forEach(([name, n]) => box.append(bar(name, n, top)));

  box.append(h("h3", "Средний балл по предметам"));
  SUBJECTS.forEach(sub => {
    const a = avg(grades.filter(g => g.subject === sub).map(g => g.score));
    box.append(bar(sub, a === null ? 0 : Math.round(a), 100));
  });

  return box;
}



const views = { students: viewStudents, grades: viewGrades, stats: viewStats };

function render() {
  if (!views[currentTab]) currentTab = "students";
  content.replaceChildren(views[currentTab]());
  tabs.forEach(btn => {
    const on = btn.dataset.page === currentTab;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on);
  });
  save();
}

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    currentTab = btn.dataset.page;
    render();
  });
});

render();
