import { ROOMS } from "./modules/rooms.js";
import { validateBooking } from "./modules/validation.js";
import { addBooking, cancelBooking } from "./modules/booking.js";
import { loadBookings, saveBookings } from "./modules/storage.js";
import { renderRooms, renderBookings, showMessage } from "./modules/ui.js";

const fields = {
  name: document.querySelector("#name"),
  roomId: document.querySelector("#room"),
  date: document.querySelector("#date"),
  start: document.querySelector("#start"),
  end: document.querySelector("#end"),
};
const bookButton = document.querySelector("#book");
const messageBox = document.querySelector("#message");
const listBox = document.querySelector("#list");

let bookings = loadBookings();

function refresh() {
  saveBookings(bookings);
  renderBookings(listBox, bookings);
}

function handleBook() {
  const form = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value]));
  const checked = validateBooking(form);
  if (!checked.ok) {
    showMessage(messageBox, checked.error);
    return;
  }
  const result = addBooking(bookings, checked.value);
  if (!result.ok) {
    showMessage(messageBox, result.error);
    return;
  }
  bookings = result.bookings;
  showMessage(messageBox, "Бронь добавлена", true);
  refresh();
}

renderRooms(fields.roomId, ROOMS);
refresh();

bookButton.addEventListener("click", handleBook);
for (const input of Object.values(fields)) {
  input.addEventListener("input", () => showMessage(messageBox, ""));
}
listBox.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cancel]");
  if (!button) return;
  bookings = cancelBooking(bookings, Number(button.dataset.cancel));
  showMessage(messageBox, "Бронь отменена", true);
  refresh();
});
