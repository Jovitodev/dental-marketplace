// Favoritos são um recurso puramente client-side (localStorage) por enquanto —
// não há endpoint de backend para isso. Se um dia vira algo entre dispositivos,
// mover esta lógica para um módulo "favorites" no backend, espelhando os
// outros serviços (offices, bookings, conversations).

const STORAGE_KEY = "dental_marketplace_favorites";

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export const favoritesService = {
  list(): string[] {
    return readIds();
  },

  isFavorited(officeId: string): boolean {
    return readIds().includes(officeId);
  },

  toggle(officeId: string): boolean {
    const ids = readIds();
    const isFav = ids.includes(officeId);
    const next = isFav ? ids.filter((id) => id !== officeId) : [...ids, officeId];
    writeIds(next);
    return !isFav;
  },
};
