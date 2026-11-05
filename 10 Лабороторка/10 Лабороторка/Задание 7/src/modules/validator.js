// Модуль проверки пользовательского ввода.
export function parseNumber(raw) {
  const text = String(raw).trim().replace(",", ".");
  if (text === "") {
    return { ok: false, error: "Поле не заполнено" };
  }
  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return { ok: false, error: "Введите корректное число" };
  }
  const value = Number(text);
  if (value < 0) {
    return { ok: false, error: "Значение не может быть отрицательным" };
  }
  return { ok: true, value };
}
