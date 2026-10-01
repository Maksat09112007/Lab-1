const form = document.getElementById('staffForm');
const message = document.getElementById('message');
const result = document.getElementById('result');
const cityBox = document.getElementById('cityBox');

function setError(id, text) {
  document.getElementById(id + 'Error').textContent = text;
  const el = document.getElementById(id);
  if (el) { el.classList.toggle('invalid', text !== ''); el.classList.toggle('valid', text === ''); }
  return text === '';
}

function selectedFormat() {
  const checked = form.querySelector('input[name="format"]:checked');
  return checked ? checked.value : '';
}

// Творческое задание: поле «Город» появляется при удалённой/гибридной работе
form.querySelectorAll('input[name="format"]').forEach(radio =>
  radio.addEventListener('change', () => { cityBox.hidden = selectedFormat() === 'Офис'; }));

function validate() {
  const fio = form.fio.value.trim();
  const ageText = form.age.value.trim();
  const age = Number(ageText);
  const format = selectedFormat();
  const checks = [
    setError('fio', fio.split(/\s+/).filter(Boolean).length >= 2 ? '' : 'Введите ФИО полностью (минимум фамилию и имя)'),
    setError('age', ageText === '' ? 'Введите возраст'
      : (!Number.isInteger(age) || age < 18 || age > 70) ? 'Возраст должен быть целым числом от 18 до 70' : ''),
    setError('dept', form.dept.value ? '' : 'Выберите отдел'),
    setError('format', format ? '' : 'Выберите формат работы'),
  ];
  if (format === 'Удалённо' || format === 'Гибрид') {
    checks.push(setError('city', form.city.value.trim() ? '' : 'Укажите город проживания'));
  }
  return !checks.includes(false);
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (!validate()) {
    message.textContent = 'Исправьте ошибки в форме';
    message.className = 'fail';
    result.innerHTML = '';
    return;
  }
  message.textContent = 'Анкета заполнена корректно';
  message.className = 'ok';
  const city = cityBox.hidden ? '' : `<br>Город: ${form.city.value.trim()}`;
  result.innerHTML = `ФИО: ${form.fio.value.trim()}<br>Возраст: ${form.age.value}<br>Отдел: ${form.dept.value}<br>Формат: ${selectedFormat()}${city}`;
});
