const form = document.getElementById('eventForm');
const message = document.getElementById('message');
const result = document.getElementById('result');
const live = document.getElementById('live');

function setError(id, text) {
  document.getElementById(id + 'Error').textContent = text;
  const el = document.getElementById(id);
  el.classList.toggle('invalid', text !== '');
  el.classList.toggle('valid', text === '');
  return text === '';
}

const options = () => [...form.querySelectorAll('input[name="opt"]:checked')];

// Итоговая стоимость = (цена билета + сумма опций) * количество
function calcTotal() {
  const price = Number(form.category.value) || 0;
  const qty = Number(form.qty.value) || 0;
  const extras = options().reduce((sum, o) => sum + Number(o.value), 0);
  return (price + extras) * qty;
}

// Творческое задание: стоимость пересчитывается в реальном времени
function updateLive() { live.textContent = `Предварительная стоимость: ${calcTotal().toLocaleString('ru-RU')} ₸`; }
form.addEventListener('input', updateLive);
form.addEventListener('change', updateLive);

const validators = {
  name: () => form.name.value.trim().length >= 2 ? '' : 'Введите имя (минимум 2 символа)',
  email: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()) ? '' : 'Введите e-mail в формате name@example.com',
  category: () => form.category.value ? '' : 'Выберите категорию билета',
  qty: () => {
    const q = Number(form.qty.value);
    return form.qty.value.trim() !== '' && Number.isInteger(q) && q >= 1 && q <= 10 ? '' : 'Количество должно быть целым числом от 1 до 10';
  },
};

// Проверка при вводе (подсветка) и при отправке
Object.keys(validators).forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => setError(id, validators[id]()));
  el.addEventListener('change', () => setError(id, validators[id]()));
});

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const results = Object.keys(validators).map(id => setError(id, validators[id]()));
  if (results.includes(false)) {
    message.textContent = 'Исправьте ошибки в форме';
    message.className = 'fail';
    result.innerHTML = '';
    return;
  }
  const chosen = options().map(o => o.dataset.name).join(', ') || 'нет';
  message.textContent = 'Бронирование оформлено';
  message.className = 'ok';
  result.innerHTML = `Имя: ${form.name.value.trim()}<br>E-mail: ${form.email.value.trim()}<br>Билетов: ${form.qty.value}<br>Опции: ${chosen}<br><b>Итого: ${calcTotal().toLocaleString('ru-RU')} ₸</b>`;
});
