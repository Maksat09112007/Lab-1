import { OPERATIONS, convert } from "./modules/units.js";
import { parseNumber } from "./modules/validator.js";
import { formatResult } from "./modules/formatter.js";

const select = document.querySelector("#operation");
const input = document.querySelector("#value");
const button = document.querySelector("#convert");
const errorBox = document.querySelector("#error");
const resultBox = document.querySelector("#result");

for (const [key, operation] of Object.entries(OPERATIONS)) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = operation.label;
  select.append(option);
}

function handleConvert() {
  const parsed = parseNumber(input.value);
  if (!parsed.ok) {
    errorBox.textContent = parsed.error;
    resultBox.textContent = "";
    return;
  }
  errorBox.textContent = "";
  const result = convert(select.value, parsed.value);
  resultBox.textContent = formatResult(parsed.value, result, OPERATIONS[select.value]);
}

button.addEventListener("click", handleConvert);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleConvert();
});
select.addEventListener("change", () => {
  errorBox.textContent = "";
  resultBox.textContent = "";
});
