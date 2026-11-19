import { beforeEach, describe, expect, it } from 'vitest';
import { TUTORIAL_STEPS } from '../../apps/mobile/src/features/public/tutorial-steps';
import {
  hasSeenTutorial,
  markTutorialSeen,
  resetTutorialSeenForTests,
} from '../../apps/mobile/src/features/public/tutorial-storage';

describe('tutorial interactivo paso a paso', () => {
  beforeEach(async () => {
    await resetTutorialSeenForTests();
  });

  it('define 4 pasos interactivos con vista previa de pantalla y acción guiada', () => {
    expect(TUTORIAL_STEPS).toHaveLength(4);
    expect(TUTORIAL_STEPS.every((s) => s.screenName.length > 0 && s.actionHint.length > 0)).toBe(true);
  });

  it('guarda si el usuario ya completó o saltó el tutorial', async () => {
    expect(await hasSeenTutorial()).toBe(false);
    await markTutorialSeen();
    expect(await hasSeenTutorial()).toBe(true);
  });
});