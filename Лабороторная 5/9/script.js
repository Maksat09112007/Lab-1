// Лаба 5, задание 9 - проверка пароля
const passwordEl = document.getElementById("password");
const toggleEl = document.getElementById("toggle");
const rulesEl = document.getElementById("rules");
const resultEl = document.getElementById("result");
const barFill = document.getElementById("barFill");
const strengthEl = document.getElementById("strength");

// требования к паролю
const rules = [
  { text: "Длина не меньше 8 символов", check: function (p) { return p.length >= 8; } },
  { text: "Есть хотя бы одна цифра", check: function (p) { return /[0-9]/.test(p); } },
  { text: "Есть заглавная буква (дополнительно)", check: function (p) { return /[A-ZА-Я]/.test(p); } }
];

// создаем пункты списка
let items = [];
for (let i = 0; i < rules.length; i++) {
  let li = document.createElement("li");
  li.textContent = rules[i].text + " - не выполнено";
  li.className = "fail";
  rulesEl.appendChild(li);
  items.push(li);
}

function checkPassword() {
  let password = passwordEl.value;
  let passed = 0;

  for (let i = 0; i < rules.length; i++) {
    if (rules[i].check(password)) {
      items[i].className = "ok";
      items[i].textContent = rules[i].text + " - выполнено";
      passed++;
    } else {
      items[i].className = "fail";
      items[i].textContent = rules[i].text + " - не выполнено";
    }
  }

  // полоска надежности
  if (password === "") {
    barFill.style.width = "0";
    strengthEl.textContent = "";
  } else {
    barFill.style.width = (passed / rules.length * 100) + "%";
    if (passed <= 1) {
      barFill.style.backgroundColor = "red";
      strengthEl.textContent = "Надежность: слабый";
    } else if (passed === 2) {
      barFill.style.backgroundColor = "orange";
      strengthEl.textContent = "Надежность: средний";
    } else {
      barFill.style.backgroundColor = "green";
      strengthEl.textContent = "Надежность: хороший";
    }
  }

  // главное условие - длина и цифра
  if (password === "") {
    resultEl.textContent = "";
  } else if (rules[0].check(password) && rules[1].check(password)) {
    resultEl.textContent = "Пароль подходит";
    resultEl.style.color = "green";
  } else {
    resultEl.textContent = "Пароль не подходит";
    resultEl.style.color = "red";
  }
}

passwordEl.addEventListener("input", checkPassword);
toggleEl.addEventListener("change", function () {
  if (toggleEl.checked) {
    passwordEl.type = "text";
  } else {
    passwordEl.type = "password";
  }
});
