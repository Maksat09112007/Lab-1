// Модуль данных: список аудиторий.
export const ROOMS = [
  { id: 1, name: "Ауд. 101 (лекционная)", seats: 80 },
  { id: 2, name: "Ауд. 204 (компьютерный класс)", seats: 24 },
  { id: 3, name: "Ауд. 305 (семинарская)", seats: 30 },
  { id: 4, name: "Ауд. 410 (лаборатория)", seats: 16 },
];

export function findRoom(id) {
  return ROOMS.find((room) => room.id === Number(id)) ?? null;
}
