// Модуль проверки данных формы бронирования (без DOM).
import { findRoom } from "./rooms.js";

export const OPEN_TIME = "08:00";
export const CLOSE_TIME = "20:00";

// "ЧЧ:ММ" -> минуты от полуночи или null, если формат неверный.
export function parseTime(text) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(text).trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

function isRealDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
}

export function validateBooking(form) {
  const name = String(form.name ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Укажите ФИО (не короче 2 символов)" };
  if (!findRoom(form.roomId)) return { ok: false, error: "Выберите аудиторию" };
  const date = String(form.date ?? "").trim();
  if (date === "") return { ok: false, error: "Укажите дату" };
  if (!isRealDate(date)) return { ok: false, error: "Некорректная дата" };
  const start = parseTime(form.start);
  const end = parseTime(form.end);
  if (start === null || end === null) return { ok: false, error: "Время вводится в формате ЧЧ:ММ, например 09:30" };
  if (end <= start) return { ok: false, error: "Время окончания должно быть позже начала" };
  if (start < parseTime(OPEN_TIME) || end > parseTime(CLOSE_TIME)) {
    return { ok: false, error: `Бронирование возможно с ${OPEN_TIME} до ${CLOSE_TIME}` };
  }
  const pad = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return { ok: true, value: { name, roomId: Number(form.roomId), date, start: pad(start), end: pad(end) } };
}
