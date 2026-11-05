// Дополнительный (творческий) модуль: оформление результата.
const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 6 });

export function formatResult(input, output, operation) {
  return `${numberFormat.format(input)} ${operation.from} = ${numberFormat.format(output)} ${operation.to}`;
}
