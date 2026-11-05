// Модуль интерфейса: только работа с DOM.
import { findRoom } from "./rooms.js";

function createElement(tag, text = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

export function renderRooms(select, rooms) {
  select.replaceChildren(createElement("option", "— выберите —"));
  select.firstChild.value = "";
  for (const room of rooms) {
    const option = createElement("option", `${room.name}, мест: ${room.seats}`);
    option.value = String(room.id);
    select.append(option);
  }
}

export function renderBookings(container, bookings) {
  container.replaceChildren();
  if (bookings.length === 0) {
    const empty = createElement("p", "Броней пока нет");
    empty.className = "empty";
    container.append(empty);
    return;
  }
  const table = createElement("table");
  const head = createElement("tr");
  for (const title of ["Дата", "Время", "Аудитория", "Кто", ""]) head.append(createElement("th", title));
  table.append(head);
  const sorted = [...bookings].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  for (const booking of sorted) {
    const row = createElement("tr");
    const cancel = createElement("button", "×");
    cancel.type = "button";
    cancel.dataset.cancel = booking.id;
    cancel.setAttribute("aria-label", "Отменить бронь");
    const last = createElement("td");
    last.append(cancel);
    row.append(createElement("td", booking.date), createElement("td", `${booking.start}–${booking.end}`),
      createElement("td", findRoom(booking.roomId)?.name ?? "—"), createElement("td", booking.name), last);
    table.append(row);
  }
  container.append(table);
}

export function showMessage(element, text, isOk = false) {
  element.textContent = text;
  element.className = isOk ? "message ok" : "message";
}
