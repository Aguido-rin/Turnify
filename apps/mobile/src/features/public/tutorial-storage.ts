import { secureStorage } from '@/lib/secure-storage';

const TUTORIAL_SEEN_KEY = 'turnify_tutorial_seen_v1';

export async function hasSeenTutorial(): Promise<boolean> {
  try {
    const value = await secureStorage.getItem(TUTORIAL_SEEN_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markTutorialSeen(): Promise<void> {
  try {
    await secureStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
  } catch {
    // Non-blocking fallback
  }
}

export async function resetTutorialSeen(): Promise<void> {
  try {
    await secureStorage.removeItem(TUTORIAL_SEEN_KEY);
  } catch {
    // Non-blocking fallback
  }
}
