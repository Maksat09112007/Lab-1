const form = document.getElementById('studentForm');
const message = document.getElementById('message');
const result = document.getElementById('result');

// Правила: возвращают текст ошибки или пустую строку
const rules = {
  fio: v => v.trim().split(/\s+/).filter(Boolean).length >= 2 ? '' : 'Введите ФИО полностью (минимум фамилию и имя)',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Введите e-mail в формате name@example.com',
  course: v => v !== '' ? '' : 'Выберите курс из списка',
};

function showError(id, text) {
  document.getElementById(id + 'Error').textContent = text;
  const field = document.getElementById(id);
  field.classList.toggle('invalid', text !== '');
  field.classList.toggle('valid', text === '');
}

function validateField(id) {
  const error = rules[id](document.getElementById(id).value);
  showError(id, error);
  return error === '';
}

function validateAgree() {
  const agreed = document.getElementById('agree').checked;
  document.getElementById('agreeError').textContent = agreed ? '' : 'Необходимо согласиться с правилами';
  return agreed;
}

// Творческое задание: подсветка поля сразу после ввода
Object.keys(rules).forEach(id => {
  document.getElementById(id).addEventListener('input', () => validateField(id));
  document.getElementById(id).addEventListener('change', () => validateField(id));
});
document.getElementById('agree').addEventListener('change', validateAgree);

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const results = Object.keys(rules).map(validateField);
  results.push(validateAgree());
  if (results.includes(false)) {
    message.textContent = 'Исправьте ошибки в форме';
    message.className = 'fail';
    result.innerHTML = '';
    return;
  }
  message.textContent = 'Форма заполнена корректно';
  message.className = 'ok';
  result.innerHTML = `ФИО: ${form.fio.value.trim()}<br>E-mail: ${form.email.value.trim()}<br>Курс: ${form.course.value}`;
});
