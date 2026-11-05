// Модуль бронирования: пересечения времени, добавление и отмена. Без DOM.
import { parseTime } from "./validation.js";

export function hasOverlap(a, b) {
  return (
    a.roomId === b.roomId &&
    a.date === b.date &&
    parseTime(a.start) < parseTime(b.end) &&
    parseTime(b.start) < parseTime(a.end)
  );
}

export function addBooking(bookings, data) {
  const conflict = bookings.find((booking) => hasOverlap(booking, data));
  if (conflict) {
    return { ok: false, error: `Аудитория занята: ${conflict.start}–${conflict.end} (${conflict.name})` };
  }
  const id = bookings.reduce((max, booking) => Math.max(max, booking.id), 0) + 1;
  return { ok: true, bookings: [...bookings, { id, ...data }] };
}

export function cancelBooking(bookings, id) {
  return bookings.filter((booking) => booking.id !== id);
}
