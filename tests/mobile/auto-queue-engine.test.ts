import { describe, expect, it } from 'vitest';
import {
  AUTO_QUEUE_TIMINGS,
  advanceTicketAutomatically,
} from '../../apps/mobile/src/features/queue/auto-queue-engine';
import type { GuestTicketState } from '../../apps/mobile/src/features/queue/public-guest-ticket-api';

const baseTicket: GuestTicketState = {
  visibleCode: 'A-01',
  status: 'en_espera',
  peopleAhead: 2,
  waitMinutes: 1,
  serviceName: 'Medicina general',
  requestedBarberName: 'Dra. Valeria Gómez',
  assignedBarberName: null,
  calledDeadlineAt: null,
  customerResponse: null,
  customerResponseAt: null,
  puntuacion: null,
  canRate: false,
  ratingDeadlineAt: null,
  graciaMin: null,
};

describe('auto-queue-engine (avance y llamado automático en tiempo real)', () => {
  it('recorre automáticamente en_espera -> notificado -> llamado -> en_atencion -> finalizado', () => {
    const step1 = advanceTicketAutomatically(baseTicket, 1_000);
    expect(step1.changed).toBe(true);
    expect(step1.ticket.peopleAhead).toBe(1);
    expect(step1.ticket.status).toBe('notificado');

    const step2 = advanceTicketAutomatically(step1.ticket, 2_000);
    expect(step2.ticket.peopleAhead).toBe(0);
    expect(step2.ticket.status).toBe('llamado');
    expect(step2.ticket.calledDeadlineAt).toBeTruthy();

    const step3 = advanceTicketAutomatically(step2.ticket, 3_000);
    expect(step3.ticket.status).toBe('en_atencion');

    const step4 = advanceTicketAutomatically(step3.ticket, 4_000);
    expect(step4.ticket.status).toBe('finalizado');
    expect(step4.ticket.canRate).toBe(true);
    expect(step4.isTerminal).toBe(true);
    expect(AUTO_QUEUE_TIMINGS.stepWaitSeconds).toBeGreaterThan(0);
  });
});