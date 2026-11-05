// Модуль вычислений: только формулы перевода, без DOM.
export const OPERATIONS = {
  "km-m":  { label: "км → м",           from: "км",  to: "м",   apply: (v) => v * 1000 },
  "m-km":  { label: "м → км",           from: "м",   to: "км",  apply: (v) => v / 1000 },
  "kg-g":  { label: "кг → г",           from: "кг",  to: "г",   apply: (v) => v * 1000 },
  "g-kg":  { label: "г → кг",           from: "г",   to: "кг",  apply: (v) => v / 1000 },
  "min-s": { label: "минуты → секунды", from: "мин", to: "с",   apply: (v) => v * 60 },
  "s-min": { label: "секунды → минуты", from: "с",   to: "мин", apply: (v) => v / 60 },
};

export function convert(key, value) {
  const operation = OPERATIONS[key];
  if (!operation) {
    throw new Error(`Неизвестная операция: ${key}`);
  }
  return operation.apply(value);
}
