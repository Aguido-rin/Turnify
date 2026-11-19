import { useFocusEffect } from 'expo-router';
import { AppState } from 'react-native';
import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { AUTO_QUEUE_TIMINGS, advanceTicketAutomatically } from './auto-queue-engine';
import type { GuestTicketState } from './public-guest-ticket-api';

import { getMyTicketState, translateQueueError, type TicketState } from '@/features/queue/queue-api';
import { getSupabase } from '@/lib/supabase';

export function useLiveTicket(ticketId: string | undefined, queueId: string | undefined) {
  const [ticket, setTicket] = useState<TicketState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!ticketId) {
      setError('No encontramos este turno.');
      setIsLoading(false);
      return false;
    }

    try {
      const nextTicket = await getMyTicketState(ticketId);
      setTicket(nextTicket);
      setError(null);
      return true;
    } catch (reason) {
      setError(translateQueueError(reason instanceof Error ? reason.message : ''));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let channel: ReturnType<ReturnType<typeof getSupabase>['channel']> | undefined;

      async function start() {
        const isOwnedTicket = await refresh();
        if (!isActive || !isOwnedTicket || !ticketId || !queueId) return;

        const supabase = getSupabase();
        channel = supabase
          .channel(`ticket:${ticketId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'filas', filter: `id=eq.${queueId}` }, () => {
            void refresh();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` }, () => {
            void refresh();
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') void refresh();
          });
      }

      const appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') void refresh();
      });
      void start();

      return () => {
        isActive = false;
        appStateSubscription.remove();
        if (channel) void getSupabase().removeChannel(channel);
      };
    }, [queueId, refresh, ticketId]),
  );

  return { ticket, error, isLoading, refresh };
}

export function useAutoQueueProgression(
  ticket: GuestTicketState | null,
  onTicketUpdated: (next: GuestTicketState) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled || !ticket) return;
    if (
      ticket.status === 'finalizado' ||
      ticket.status === 'cancelado' ||
      ticket.status === 'ausente'
    ) {
      return;
    }

    const delaySeconds =
      ticket.status === 'llamado'
        ? AUTO_QUEUE_TIMINGS.autoAttendAfterCallSeconds
        : ticket.status === 'en_atencion'
          ? AUTO_QUEUE_TIMINGS.serviceDurationSeconds
          : AUTO_QUEUE_TIMINGS.stepWaitSeconds;

    const timer = setTimeout(() => {
      const result = advanceTicketAutomatically(ticket, Date.now());
      if (result.changed) {
        onTicketUpdated(result.ticket);
      }
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [enabled, onTicketUpdated, ticket]);
}