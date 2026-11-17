import type { SupabaseClient } from '@supabase/supabase-js';
import { localDb } from './local-db';
import { BUSINESS_DIRECTORY } from '../features/customer/business-directory';

export function createLocalSupabaseClient(): SupabaseClient {
  const authListeners = new Set<(event: string, session: unknown) => void>();
  let currentSession: unknown = null;

  const client = {
    // --- RPC ---
    async rpc(fnName: string, args: Record<string, unknown> = {}) {
      try {
        switch (fnName) {
          case 'listar_empresas_publicas': {
            const busqueda = String(args?.p_busqueda ?? '').trim().toLowerCase();
            const rubro = String(args?.p_rubro ?? '').trim().toLowerCase();
            const limit = Math.min(Math.max(Number(args?.p_limit ?? 30), 1), 50);

            const rows = BUSINESS_DIRECTORY
              .filter((e) => {
                const matchRubro = !rubro || rubro === 'all' || e.category === rubro;
                const matchQuery =
                  !busqueda ||
                  e.name.toLowerCase().includes(busqueda) ||
                  e.code.toLowerCase().includes(busqueda) ||
                  e.district.toLowerCase().includes(busqueda);
                return matchRubro && matchQuery;
              })
              .slice(0, limit)
              .map((e) => ({
                id: e.businessId,
                nombre: e.name,
                codigo: e.code,
                rubro: e.category,
                etiqueta_atendedor: e.staffLabel,
                descripcion: null,
                abierta: e.isOpen,
                direccion: e.district,
                latitud: null,
                longitud: null,
              }));

            return { data: rows, error: null };
          }

          case 'obtener_perfil_publico_empresa': {
            const codigo = String(args?.p_codigo ?? '').trim().toUpperCase();
            const found = BUSINESS_DIRECTORY.find((e) => e.code.trim().toUpperCase() === codigo);
            if (found) {
              return {
                data: [
                  {
                    id: found.businessId,
                    nombre: found.name,
                    codigo: found.code,
                    rubro: found.category,
                    etiqueta_atendedor: found.staffLabel,
                    descripcion: null,
                    abierta: found.isOpen,
                  },
                ],
                error: null,
              };
            }
            if (codigo === 'BARBER1') {
              return {
                data: [
                  {
                    id: 'empresa-turnify-1',
                    nombre: 'Turnify Barber Studio',
                    codigo: 'BARBER1',
                    rubro: 'barberia',
                    etiqueta_atendedor: 'Barbero',
                    descripcion: null,
                    abierta: true,
                  },
                ],
                error: null,
              };
            }
            return { data: [], error: null };
          }
          case 'catalogo_comercial':
            return { data: localDb.getCommercialCatalog(String(args.p_codigo ?? 'BARBER1')), error: null };

          case 'crear_ticket_invitado':
            return {
              data: localDb.createGuestTicket({
                companyCode: String(args.p_codigo ?? 'BARBER1'),
                serviceId: String(args.p_servicio_id ?? ''),
                clientName: args.p_nombre ? String(args.p_nombre) : null,
                requestedBarberId: args.p_barbero_solicitado_id ? String(args.p_barbero_solicitado_id) : null,
                phone: args.p_telefono ? String(args.p_telefono) : null,
                whatsappConsent: Boolean(args.p_consentimiento_whatsapp),
              }),
              error: null,
            };

          case 'estado_ticket_invitado':
            return {
              data: localDb.getGuestTicketState(String(args.p_ticket_id ?? ''), String(args.p_capacidad ?? '')),
              error: null,
            };

          case 'responder_llamado_invitado':
            localDb.respondToCalledGuestTicket(
              String(args.p_ticket_id ?? ''),
              String(args.p_capacidad ?? ''),
              args.p_respuesta as 'presente' | 'llega_en_2_min',
            );
            return { data: null, error: null };

          case 'cancelar_ticket_invitado':
            localDb.cancelGuestTicket(String(args.p_ticket_id ?? ''), String(args.p_capacidad ?? ''));
            return { data: null, error: null };

          case 'puntuar_atencion_invitado':
            localDb.rateFinishedGuestTicket(
              String(args.p_ticket_id ?? ''),
              String(args.p_capacidad ?? ''),
              Number(args.p_puntuacion ?? 5),
            );
            return { data: null, error: null };

          case 'mi_cola_barbero':
            return { data: localDb.getWorkerBarberQueue(), error: null };

          case 'llamar_mi_siguiente_ticket':
          case 'llamar_siguiente':
            return { data: localDb.callMyNextTicket(String(args.p_fila_id ?? '')), error: null };

          case 'iniciar_mi_atencion':
            localDb.startMyService(String(args.p_ticket_id ?? ''));
            return { data: null, error: null };

          case 'finalizar_mi_atencion':
            localDb.finishMyService(String(args.p_ticket_id ?? ''));
            return { data: null, error: null };

          case 'marcar_mi_ticket_ausente':
            localDb.markMyTicketAbsent(String(args.p_ticket_id ?? ''));
            return { data: null, error: null };

          case 'cambiar_mi_disponibilidad':
            localDb.setWorkerAvailability(args.p_estado as 'disponible' | 'fuera_de_turno');
            return { data: null, error: null };

          case 'crear_mi_ticket_presencial':
            return {
              data: localDb.createWorkerWalkInTicket(String(args.p_servicio_id ?? ''), String(args.p_nombre_cliente ?? '')),
              error: null,
            };

          case 'mi_historial_barbero':
            return { data: localDb.getWorkerHistory(), error: null };

          case 'estaciones_de_mi_empresa':
            return { data: localDb.getShopStations(), error: null };

          case 'barberos_reasignables':
            return { data: localDb.getReassignmentCandidates(String(args.p_ticket_id ?? '')), error: null };

          case 'reasignar_llamado_barbero':
            localDb.reassignCalledTicket(String(args.p_ticket_id ?? ''), String(args.p_barbero_id ?? ''));
            return { data: null, error: null };

          case 'mis_empresas_personal':
            return { data: localDb.getWorkerShops(), error: null };

          case 'mis_membresias_empresa':
            return { data: localDb.getMemberships(), error: null };

          case 'resumen_empresa':
            return { data: localDb.getBusinessSummary(String(args.p_codigo ?? 'BARBER1')), error: null };

          case 'seleccionar_mi_empresa_personal':
          case 'registrar_como_personal':
          case 'registrar_dispositivo':
          case 'revocar_dispositivo':
          case 'registrar_dispositivo_invitado':
          case 'revocar_dispositivo_invitado':
            return { data: null, error: null };

          default:
            return { data: null, error: null };
        }
      } catch (err) {
        return { data: null, error: { message: err instanceof Error ? err.message : String(err) } };
      }
    },

    // --- Table Queries (.from) ---
    from(tableName: string) {
      let filterCol: string | null = null;
      let filterVal: unknown = null;
      let inCol: string | null = null;
      let inVals: unknown[] = [];

      const queryBuilder = {
        select(_fields?: string) {
          return queryBuilder;
        },
        eq(col: string, val: unknown) {
          filterCol = col;
          filterVal = val;
          return queryBuilder;
        },
        in(col: string, vals: unknown[]) {
          inCol = col;
          inVals = vals;
          return queryBuilder;
        },
        order(_col: string, _opts?: unknown) {
          return queryBuilder;
        },
        async maybeSingle() {
          const res = await queryBuilder.execute();
          const items = Array.isArray(res.data) ? res.data : [res.data];
          return { data: items[0] ?? null, error: null };
        },
        async single() {
          const res = await queryBuilder.execute();
          const items = Array.isArray(res.data) ? res.data : [res.data];
          return { data: items[0] ?? null, error: null };
        },
        async insert(_payload: unknown) {
          return { data: null, error: null };
        },
        async update(_payload: unknown) {
          return { data: null, error: null };
        },
        async delete() {
          return { data: null, error: null };
        },
        async then(onfulfilled?: (res: { data: unknown; error: null }) => unknown) {
          const res = await queryBuilder.execute();
          return onfulfilled ? onfulfilled(res) : res;
        },
        async execute(): Promise<{ data: unknown; error: null }> {
          switch (tableName) {
            case 'perfiles':
              return { data: localDb.getUserProfile(), error: null };

            case 'empresas':
              return {
                data: {
                  id: 'empresa-turnify-1',
                  nombre: 'Turnify Barber Studio',
                  codigo: 'BARBER1',
                  abierta: true,
                },
                error: null,
              };

            case 'filas':
              return {
                data: [
                  { id: 'q-cortes', nombre: 'Cortes', en_espera: 1, puestos_activos: 2, duracion_promedio_seg: 1200 },
                  { id: 'q-barba', nombre: 'Barba y Afeitado', en_espera: 1, puestos_activos: 1, duracion_promedio_seg: 900 },
                ],
                error: null,
              };

            case 'servicios':
              return {
                data: [
                  { id: 'srv-1', nombre: 'Corte Clásico', duracion_estimada_seg: 1200 },
                  { id: 'srv-2', nombre: 'Corte + Barba', duracion_estimada_seg: 2100 },
                  { id: 'srv-3', nombre: 'Perfilado de Barba', duracion_estimada_seg: 900 },
                  { id: 'srv-4', nombre: 'Corte Premium & Lavado', duracion_estimada_seg: 2700 },
                ],
                error: null,
              };

            case 'barberos':
              return {
                data: [
                  { id: 'barber-you', nombre: 'Tú', estado: 'disponible' },
                  { id: 'barber-carlos', nombre: 'Carlos Mendoza', estado: 'ocupado' },
                  { id: 'barber-miguel', nombre: 'Miguel Ángel', estado: 'disponible' },
                ],
                error: null,
              };

            case 'barbero_servicios':
              return {
                data: [
                  { barbero_id: 'barber-you', servicio_id: 'srv-1' },
                  { barbero_id: 'barber-you', servicio_id: 'srv-2' },
                  { barbero_id: 'barber-you', servicio_id: 'srv-3' },
                  { barbero_id: 'barber-you', servicio_id: 'srv-4' },
                ],
                error: null,
              };

            case 'tickets':
              return {
                data: [
                  { estado: 'en_espera' },
                  { estado: 'notificado' },
                  { estado: 'en_atencion' },
                  { estado: 'finalizado' },
                ],
                error: null,
              };

            default:
              return { data: [], error: null };
          }
        },
      };

      return queryBuilder;
    },

    // --- Channels ---
    channel(_name: string) {
      const channelObj = {
        on(_type: string, _filter: unknown, callback: (payload: unknown) => void) {
          localDb.subscribeChannel((payload) => {
            callback(payload);
          });
          return channelObj;
        },
        subscribe(statusCallback?: (status: string) => void) {
          if (statusCallback) {
            setTimeout(() => statusCallback('SUBSCRIBED'), 0);
          }
          return channelObj;
        },
        unsubscribe() {
          return undefined;
        },
      };
      return channelObj;
    },

    removeChannel(_channel: unknown) {
      // No-op
    },

    // --- Auth ---
    auth: {
      async getSession() {
        return { data: { session: currentSession }, error: null };
      },
      async getUser() {
        return {
          data: {
            user: {
              id: 'user-barber-you',
              email: 'barbero@turnify.com',
              user_metadata: { name: 'Tú' },
            },
          },
          error: null,
        };
      },
      async signInWithPassword({ email }: { email: string }) {
        currentSession = {
          user: {
            id: 'user-barber-you',
            email: email || 'barbero@turnify.com',
            user_metadata: { name: 'Tú' },
          },
          access_token: 'local-demo-token',
        };
        for (const listener of authListeners) {
          listener('SIGNED_IN', currentSession);
        }
        return { data: { session: currentSession, user: (currentSession as { user: unknown }).user }, error: null };
      },
      async signUp({ email }: { email: string }) {
        currentSession = {
          user: {
            id: 'user-barber-you',
            email: email || 'barbero@turnify.com',
            user_metadata: { name: 'Tú' },
          },
          access_token: 'local-demo-token',
        };
        for (const listener of authListeners) {
          listener('SIGNED_IN', currentSession);
        }
        return { data: { session: currentSession, user: (currentSession as { user: unknown }).user }, error: null };
      },
      async signOut() {
        currentSession = null;
        for (const listener of authListeners) {
          listener('SIGNED_OUT', null);
        }
        return { error: null };
      },
      onAuthStateChange(callback: (event: string, session: unknown) => void) {
        authListeners.add(callback);
        // Call immediately with initial session
        setTimeout(() => callback(currentSession ? 'INITIAL_SESSION' : 'SIGNED_OUT', currentSession), 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              },
            },
          },
        };
      },
    },

    // --- Storage ---
    storage: {
      from(_bucket: string) {
        return {
          getPublicUrl(path: string) {
            return {
              data: {
                publicUrl: `https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=150&auto=format&fit=crop&q=60`,
              },
            };
          },
          async upload(_path: string, _file: unknown) {
            return { data: { path: _path }, error: null };
          },
        };
      },
    },
  };

  return client as unknown as SupabaseClient;
}
