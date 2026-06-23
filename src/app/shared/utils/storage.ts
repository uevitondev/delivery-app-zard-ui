export function loadFromStorage<T>(key: string, fallback: T, revive?: (value: T) => T): T {
  if (!isStorageAvailable()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue) as T;
    return revive ? revive(parsedValue) : parsedValue;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T) {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistencia local nao deve quebrar o fluxo principal.
  }
}

function isStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

import { signal, effect, WritableSignal } from '@angular/core';

export function zStorageSignal<T>(key: string, fallback: T, revive?: (value: T) => T): WritableSignal<T> {
  const initialValue = loadFromStorage(key, fallback, revive);
  const sig = signal<T>(initialValue);

  effect(() => {
    saveToStorage(key, sig());
  });

  return sig;
}
