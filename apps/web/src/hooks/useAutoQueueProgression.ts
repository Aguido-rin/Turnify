import { useEffect } from 'react';

export const WEB_AUTO_QUEUE_TIMINGS = {
  /** Segundos entre cada avance de puesto en la fila */
  stepWaitSeconds: 6,
  /** Segundos en estado "llamado" antes de pasar a atención automática */
  autoAttendAfterCallSeconds: 10,
  /** Tolerancia mostrada al cliente cuando es llamado */
  callToleranceSeconds: 60,
  /** Segundos que dura la atención antes de finalizar */
  serviceDurationSeconds: 8,
} as const;

type AnyTicket = Record<string, any>;

export function advanceWebTicket<T extends AnyTicket>(
  current: T,
  nowMs: number = Date.now(),
  timings = WEB_AUTO_QUEUE_TIMINGS,
): T | null {
  const status = String(current.status ?? '');

  if (status === 'en_espera' || status === 'notificado') {
    const currentAhead = Math.max(0, Number(current.peopleAhead ?? 0));

    if (currentAhead > 1) {
      const nextAhead = currentAhead - 1;
      const nextWaitMinutes = Math.max(1, Math.ceil((nextAhead * timings.stepWaitSeconds) / 60));
      return {
        ...current,
        status: nextAhead === 1 ? 'notificado' : 'en_espera',
        peopleAhead: nextAhead,
        ...('waitMinutes' in current ? { waitMinutes: nextWaitMinutes } : {}),
      };
    }

    const deadlineIso = new Date(nowMs + timings.callToleranceSeconds * 1000).toISOString();
    return {
      ...current,
      status: 'llamado',
      peopleAhead: 0,
      ...('waitMinutes' in current ? { waitMinutes: 0 } : {}),
      ...('calledDeadlineAt' in current ? { calledDeadlineAt: deadlineIso } : {}),
    };
  }

  if (status === 'llamado') {
    return {
      ...current,
      status: 'en_atencion',
      ...('calledDeadlineAt' in current ? { calledDeadlineAt: null } : {}),
      assignedBarberName:
        current.assignedBarberName || current.requestedBarberName || 'Especialista asignado',
    };
  }

  if (status === 'en_atencion') {
    return {
      ...current,
      status: 'finalizado',
      ...('canRate' in current ? { canRate: true } : {}),
      ...('ratingDeadlineAt' in current
        ? { ratingDeadlineAt: new Date(nowMs + 24 * 60 * 60 * 1000).toISOString() }
        : {}),
    };
  }

  return null;
}

export function useAutoQueueProgression<T extends AnyTicket>(
  ticket: T | null | undefined,
  onUpdate: (next: T) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled || !ticket) return;
    const status = String(ticket.status ?? '');
    if (!status || status === 'finalizado' || status === 'cancelado' || status === 'ausente') {
      return;
    }

    const delaySeconds =
      status === 'llamado'
        ? WEB_AUTO_QUEUE_TIMINGS.autoAttendAfterCallSeconds
        : status === 'en_atencion'
          ? WEB_AUTO_QUEUE_TIMINGS.serviceDurationSeconds
          : WEB_AUTO_QUEUE_TIMINGS.stepWaitSeconds;

    const timer = window.setTimeout(() => {
      const next = advanceWebTicket(ticket, Date.now());
      if (next) onUpdate(next);
    }, delaySeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [enabled, onUpdate, ticket]);
}