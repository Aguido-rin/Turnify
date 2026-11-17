import * as SecureStore from 'expo-secure-store';

export const TUTORIAL_SEEN_KEY = 'turnify_tutorial_seen';

let memoryFallback = false;

export async function hasSeenTutorial(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(TUTORIAL_SEEN_KEY) === '1';
    }
    const stored = await SecureStore.getItemAsync(TUTORIAL_SEEN_KEY);
    return stored === '1' || memoryFallback;
  } catch {
    return memoryFallback;
  }
}

export async function markTutorialSeen(): Promise<void> {
  memoryFallback = true;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
      return;
    }
    await SecureStore.setItemAsync(TUTORIAL_SEEN_KEY, '1');
  } catch {
    // Respaldo en memoria ya actualizado
  }
}

export async function resetTutorialSeenForTests(): Promise<void> {
  memoryFallback = false;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(TUTORIAL_SEEN_KEY);
    }
    await SecureStore.deleteItemAsync(TUTORIAL_SEEN_KEY);
  } catch {
    // Ignorar en entorno de test
  }
}