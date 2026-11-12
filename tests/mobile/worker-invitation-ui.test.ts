import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('Worker invitation UI', () => {
  it('shows a generated code only in transient Admin state and never persists it', () => {
    const admin = source('../../apps/web/src/features/team/TeamPage.tsx');
    expect(admin).toContain('generateWorkerInvitation(inviteEmail)');
    expect(admin).toContain('Sirve una vez y solo para');
    expect(admin).toContain('Pasale este código');
    expect(admin).not.toContain('localStorage');
    expect(admin).not.toContain('sessionStorage');
  });

  it('replaces direct add-by-email with pending approval controls', () => {
    const admin = source('../../apps/web/src/features/team/TeamPage.tsx');
    expect(admin).not.toContain('addWorkerByEmail');
    expect(admin).toContain('fetchShopWorkerRequests');
    expect(admin).toContain('resolveWorkerRequest');
    expect(admin).toContain('Solicitudes pendientes');
  });
});
