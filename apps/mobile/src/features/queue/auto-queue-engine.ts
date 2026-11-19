import type { GuestTicketState } from './public-guest-ticket-api';

/**
 * Tiempos configurables (en segundos) para el avance automático de la cola.
 * Modifica estos valores para ajustar qué tan rápido avanza la fila en tu demo.
 */
export const AUTO_QUEUE_TIMINGS = {
  /** Cada cuántos segundos avanza 1 puesto en la fila mientras está en espera */
  stepWaitSeconds: 6,
  /** Segundos que permanece en estado "llamado" antes de pasar a atención automática */
  autoAttendAfterCallSeconds: 10,
  /** Ventana de tolerancia mostrada al cliente cuando es llamado */
  callToleranceSeconds: 60,
  /** Segundos que dura la atención antes de marcar el turno como finalizado */
  serviceDurationSeconds: 8,
} as const;

export interface AutoQueueStepResult {
  ticket: GuestTicketState;
  changed: boolean;
  isTerminal: boolean;
}

export function advanceTicketAutomatically(
  current: GuestTicketState,
  nowMs: number = Date.now(),
  timings = AUTO_QUEUE_TIMINGS,
): AutoQueueStepResult {
  if (current.status === 'en_espera' || current.status === 'notificado') {
    const currentAhead = Math.max(0, current.peopleAhead ?? 0);

    if (currentAhead > 1) {
      const nextAhead = currentAhead - 1;
      const nextWaitMinutes = Math.max(1, Math.ceil((nextAhead * timings.stepWaitSeconds) / 60));
      return {
        changed: true,
        isTerminal: false,
        ticket: {
          ...current,
          status: nextAhead === 1 ? 'notificado' : 'en_espera',
          peopleAhead: nextAhead,
          waitMinutes: nextWaitMinutes,
        },
      };
    }

    const deadlineIso = new Date(nowMs + timings.callToleranceSeconds * 1000).toISOString();
    return {
      changed: true,
      isTerminal: false,
      ticket: {
        ...current,
        status: 'llamado',
        peopleAhead: 0,
        waitMinutes: 0,
        calledDeadlineAt: deadlineIso,
      },
    };
  }

  if (current.status === 'llamado') {
    return {
      changed: true,
      isTerminal: false,
      ticket: {
        ...current,
        status: 'en_atencion',
        calledDeadlineAt: null,
        assignedBarberName:
          current.assignedBarberName || current.requestedBarberName || 'Especialista asignado',
      },
    };
  }

  if (current.status === 'en_atencion') {
    return {
      changed: true,
      isTerminal: true,
      ticket: {
        ...current,
        status: 'finalizado',
        canRate: true,
        ratingDeadlineAt: new Date(nowMs + 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  return {
    changed: false,
    isTerminal: true,
    ticket: current,
  };
}