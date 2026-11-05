// Дополнительный (творческий) модуль: хранение броней в localStorage.
const KEY = "lab10_bookings";

export function loadBookings() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveBookings(bookings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bookings));
  } catch {
    /* хранилище недоступно */
  }
}
