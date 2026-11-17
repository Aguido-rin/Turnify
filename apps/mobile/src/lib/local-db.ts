import { secureStorage } from '@/lib/secure-storage';

export interface LocalTicket {
  id: string;
  visibleCode: string;
  businessId: string;
  queueId: string;
  queueName: string;
  serviceId: string;
  serviceName: string;
  clientName: string;
  phone: string | null;
  whatsappConsent: boolean;
  requestedBarberId: string | null;
  requestedBarberName: string | null;
  assignedBarberId: string | null;
  assignedBarberName: string | null;
  state: 'en_espera' | 'notificado' | 'llamado' | 'en_atencion' | 'finalizado' | 'cancelado' | 'ausente';
  createdAt: string;
  calledAt: string | null;
  calledDeadlineAt: string | null;
  customerResponse: 'presente' | 'llega_en_2_min' | null;
  customerResponseAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  durationSeconds: number | null;
  puntuacion: number | null;
  capability: string;
}

export interface LocalBarber {
  id: string;
  businessId: string;
  name: string;
  operationalState: 'disponible' | 'ocupado' | 'fuera_de_turno';
  fotoUrl: string | null;
  serviceIds: string[];
  currentTicketId: string | null;
}

export interface LocalStoreState {
  business: {
    id: string;
    code: string;
    name: string;
    isOpen: boolean;
    latitud: number;
    longitud: number;
    graciaMin: number;
  };
  queues: Array<{
    id: string;
    businessId: string;
    name: string;
    avgDurationSeconds: number;
  }>;
  services: Array<{
    id: string;
    businessId: string;
    queueId: string;
    name: string;
    description: string;
    durationSeconds: number;
    referencePriceCents: number;
  }>;
  barbers: LocalBarber[];
  tickets: LocalTicket[];
  user: {
    id: string;
    email: string;
    name: string;
    role: 'personal' | 'admin' | 'cliente';
    businessId: string;
    currentShopId: string;
  };
  ticketCounter: number;
}

const STORAGE_KEY = 'turnify.local-database.v1';

function createInitialState(): LocalStoreState {
  const now = Date.now();
  const iso = (offsetMinutes: number) => new Date(now - offsetMinutes * 60000).toISOString();

  return {
    business: {
      id: 'empresa-turnify-1',
      code: 'BARBER1',
      name: 'Turnify Barber Studio',
      isOpen: true,
      latitud: -12.0924,
      longitud: -77.0321,
      graciaMin: 5,
    },
    queues: [
      { id: 'q-cortes', businessId: 'empresa-turnify-1', name: 'Cortes', avgDurationSeconds: 1200 },
      { id: 'q-barba', businessId: 'empresa-turnify-1', name: 'Barba y Afeitado', avgDurationSeconds: 900 },
    ],
    services: [
      { id: 'srv-1', businessId: 'empresa-turnify-1', queueId: 'q-cortes', name: 'Corte Clásico', description: 'Corte tradicional a tijera o máquina con peinado', durationSeconds: 1200, referencePriceCents: 2500 },
      { id: 'srv-2', businessId: 'empresa-turnify-1', queueId: 'q-cortes', name: 'Corte + Barba', description: 'Corte completo y perfilado de barba con toalla caliente', durationSeconds: 2100, referencePriceCents: 4000 },
      { id: 'srv-3', businessId: 'empresa-turnify-1', queueId: 'q-barba', name: 'Perfilado de Barba', description: 'Delineado preciso con navaja y bálsamo hidratante', durationSeconds: 900, referencePriceCents: 1800 },
      { id: 'srv-4', businessId: 'empresa-turnify-1', queueId: 'q-cortes', name: 'Corte Premium & Lavado', description: 'Corte personalizado, lavado exfoliante y masaje capilar', durationSeconds: 2700, referencePriceCents: 5000 },
    ],
    barbers: [
      { id: 'barber-you', businessId: 'empresa-turnify-1', name: 'Tú', operationalState: 'disponible', fotoUrl: null, serviceIds: ['srv-1', 'srv-2', 'srv-3', 'srv-4'], currentTicketId: null },
      { id: 'barber-carlos', businessId: 'empresa-turnify-1', name: 'Carlos Mendoza', operationalState: 'ocupado', fotoUrl: null, serviceIds: ['srv-1', 'srv-2'], currentTicketId: 't-demo-0' },
      { id: 'barber-miguel', businessId: 'empresa-turnify-1', name: 'Miguel Ángel', operationalState: 'disponible', fotoUrl: null, serviceIds: ['srv-1', 'srv-3'], currentTicketId: null },
    ],
    tickets: [
      {
        id: 't-demo-0',
        visibleCode: 'A19',
        businessId: 'empresa-turnify-1',
        queueId: 'q-cortes',
        queueName: 'Cortes',
        serviceId: 'srv-1',
        serviceName: 'Corte Clásico',
        clientName: 'Santiago L.',
        phone: null,
        whatsappConsent: false,
        requestedBarberId: 'barber-carlos',
        requestedBarberName: 'Carlos Mendoza',
        assignedBarberId: 'barber-carlos',
        assignedBarberName: 'Carlos Mendoza',
        state: 'en_atencion',
        createdAt: iso(30),
        calledAt: iso(25),
        calledDeadlineAt: null,
        customerResponse: 'presente',
        customerResponseAt: iso(24),
        startedAt: iso(20),
        finishedAt: null,
        durationSeconds: null,
        puntuacion: null,
        capability: 'cap-demo-0',
      },
      {
        id: 't-demo-1',
        visibleCode: 'A20',
        businessId: 'empresa-turnify-1',
        queueId: 'q-cortes',
        queueName: 'Cortes',
        serviceId: 'srv-2',
        serviceName: 'Corte + Barba',
        clientName: 'Alejandro R.',
        phone: null,
        whatsappConsent: false,
        requestedBarberId: null,
        requestedBarberName: null,
        assignedBarberId: null,
        assignedBarberName: null,
        state: 'notificado',
        createdAt: iso(15),
        calledAt: null,
        calledDeadlineAt: null,
        customerResponse: null,
        customerResponseAt: null,
        startedAt: null,
        finishedAt: null,
        durationSeconds: null,
        puntuacion: null,
        capability: 'cap-demo-1',
      },
      {
        id: 't-demo-2',
        visibleCode: 'B04',
        businessId: 'empresa-turnify-1',
        queueId: 'q-barba',
        queueName: 'Barba y Afeitado',
        serviceId: 'srv-3',
        serviceName: 'Perfilado de Barba',
        clientName: 'Mateo G.',
        phone: null,
        whatsappConsent: false,
        requestedBarberId: null,
        requestedBarberName: null,
        assignedBarberId: null,
        assignedBarberName: null,
        state: 'en_espera',
        createdAt: iso(8),
        calledAt: null,
        calledDeadlineAt: null,
        customerResponse: null,
        customerResponseAt: null,
        startedAt: null,
        finishedAt: null,
        durationSeconds: null,
        puntuacion: null,
        capability: 'cap-demo-2',
      },
      {
        id: 't-demo-hist-1',
        visibleCode: 'A18',
        businessId: 'empresa-turnify-1',
        queueId: 'q-cortes',
        queueName: 'Cortes',
        serviceId: 'srv-1',
        serviceName: 'Corte Clásico',
        clientName: 'Roberto M.',
        phone: null,
        whatsappConsent: false,
        requestedBarberId: 'barber-you',
        requestedBarberName: 'Tú',
        assignedBarberId: 'barber-you',
        assignedBarberName: 'Tú',
        state: 'finalizado',
        createdAt: iso(80),
        calledAt: iso(60),
        calledDeadlineAt: null,
        customerResponse: 'presente',
        customerResponseAt: iso(58),
        startedAt: iso(55),
        finishedAt: iso(35),
        durationSeconds: 1200,
        puntuacion: 5,
        capability: 'cap-demo-hist-1',
      },
    ],
    user: {
      id: 'user-barber-you',
      email: 'barbero@turnify.com',
      name: 'Tú',
      role: 'personal',
      businessId: 'empresa-turnify-1',
      currentShopId: 'empresa-turnify-1',
    },
    ticketCounter: 21,
  };
}

type ChannelListener = (payload: { eventType: string; new: unknown; old: unknown }) => void;

class LocalDatabase {
  private state: LocalStoreState;
  private channelListeners = new Set<ChannelListener>();
  private initialized = false;

  constructor() {
    this.state = createInitialState();
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const raw = await secureStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LocalStoreState>;
        if (parsed.business && parsed.tickets && parsed.barbers) {
          this.state = {
            ...createInitialState(),
            ...parsed,
          };
        }
      }
    } catch {
      // Use defaults if storage read fails
    } finally {
      this.initialized = true;
    }
  }

  private persist(): void {
    void secureStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)).catch(() => undefined);
  }

  public notifySubscribers(ticket?: LocalTicket): void {
    const payload = {
      eventType: 'UPDATE',
      new: ticket ?? this.state.tickets[0],
      old: ticket ?? this.state.tickets[0],
    };
    for (const listener of this.channelListeners) {
      try {
        listener(payload);
      } catch {
        // Safe dispatch
      }
    }
  }

  public subscribeChannel(listener: ChannelListener): () => void {
    this.channelListeners.add(listener);
    return () => {
      this.channelListeners.delete(listener);
    };
  }

  // --- Public APIs ---

  public getCommercialCatalog(companyCode: string) {
    const b = this.state.business;
    return {
      nombre: b.name,
      abierta: b.isOpen,
      latitud: b.latitud,
      longitud: b.longitud,
      servicios: this.state.services.map((s) => ({
        servicio_id: s.id,
        nombre: s.name,
        descripcion: s.description,
        duracion_estimada_seg: s.durationSeconds,
        duracion_medida_seg: s.durationSeconds,
        precio_referencia_centavos: s.referencePriceCents,
      })),
      barberos: this.state.barbers.map((barber) => ({
        barbero_id: barber.id,
        nombre: barber.name,
        estado: (barber.operationalState === 'ocupado' ? 'ocupado' : 'disponible') as 'disponible' | 'ocupado',
        foto_url: barber.fotoUrl,
        servicio_ids: barber.serviceIds,
      })),
    };
  }

  public createGuestTicket(input: {
    companyCode: string;
    serviceId: string;
    clientName?: string | null;
    requestedBarberId?: string | null;
    phone?: string | null;
    whatsappConsent?: boolean;
  }) {
    const s = this.state.services.find((item) => item.id === input.serviceId) ?? this.state.services[0];
    const barber = this.state.barbers.find((item) => item.id === input.requestedBarberId);
    const visibleCode = `A${this.state.ticketCounter++}`;
    const id = `t-guest-${Date.now()}`;
    const capability = `cap-${Math.random().toString(36).slice(2)}`;

    const newTicket: LocalTicket = {
      id,
      visibleCode,
      businessId: this.state.business.id,
      queueId: s.queueId,
      queueName: this.state.queues.find((q) => q.id === s.queueId)?.name ?? 'General',
      serviceId: s.id,
      serviceName: s.name,
      clientName: input.clientName?.trim() || 'Invitado',
      phone: input.phone ?? null,
      whatsappConsent: input.whatsappConsent ?? false,
      requestedBarberId: barber?.id ?? null,
      requestedBarberName: barber?.name ?? null,
      assignedBarberId: null,
      assignedBarberName: null,
      state: 'en_espera',
      createdAt: new Date().toISOString(),
      calledAt: null,
      calledDeadlineAt: null,
      customerResponse: null,
      customerResponseAt: null,
      startedAt: null,
      finishedAt: null,
      durationSeconds: null,
      puntuacion: null,
      capability,
    };

    this.state.tickets.push(newTicket);
    this.persist();
    this.notifySubscribers(newTicket);

    return {
      ticket_id: id,
      codigo_visible: visibleCode,
      capacidad: capability,
    };
  }

  public getGuestTicketState(ticketId: string, capability: string) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId || t.capability === capability);
    if (!ticket) {
      throw new Error('Turno no encontrado.');
    }

    const waiting = this.state.tickets.filter(
      (t) => t.queueId === ticket.queueId && (t.state === 'en_espera' || t.state === 'notificado'),
    );
    const index = waiting.findIndex((t) => t.id === ticket.id);
    const peopleAhead = index >= 0 ? index : 0;
    const waitMinutes = Math.max(0, peopleAhead * 10);

    return {
      codigo_visible: ticket.visibleCode,
      estado: ticket.state,
      personas_delante: peopleAhead,
      espera_min: waitMinutes,
      servicio_nombre: ticket.serviceName,
      barbero_solicitado_nombre: ticket.requestedBarberName,
      barbero_asignado_nombre: ticket.assignedBarberName,
      llamado_vencimiento_en: ticket.calledDeadlineAt,
      respuesta_cliente: ticket.customerResponse,
      respuesta_cliente_en: ticket.customerResponseAt,
      puntuacion: ticket.puntuacion,
      puede_puntuar: ticket.state === 'finalizado' && ticket.puntuacion == null,
      puntuacion_vencimiento_en: ticket.finishedAt ? new Date(new Date(ticket.finishedAt).getTime() + 86400000).toISOString() : null,
      gracia_min: this.state.business.graciaMin,
    };
  }

  public respondToCalledGuestTicket(ticketId: string, capability: string, response: 'presente' | 'llega_en_2_min') {
    const ticket = this.state.tickets.find((t) => t.id === ticketId || t.capability === capability);
    if (!ticket) throw new Error('Turno no encontrado.');

    ticket.customerResponse = response;
    ticket.customerResponseAt = new Date().toISOString();

    if (response === 'llega_en_2_min' && ticket.calledDeadlineAt) {
      const currentDeadline = new Date(ticket.calledDeadlineAt).getTime();
      ticket.calledDeadlineAt = new Date(currentDeadline + 2 * 60000).toISOString();
    }

    this.persist();
    this.notifySubscribers(ticket);
  }

  public cancelGuestTicket(ticketId: string, capability: string) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId || t.capability === capability);
    if (!ticket) throw new Error('Turno no encontrado.');

    ticket.state = 'cancelado';
    this.persist();
    this.notifySubscribers(ticket);
  }

  public rateFinishedGuestTicket(ticketId: string, capability: string, score: number) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId || t.capability === capability);
    if (!ticket) throw new Error('Turno no encontrado.');

    ticket.puntuacion = score;
    this.persist();
    this.notifySubscribers(ticket);
  }

  // --- Worker APIs ---

  public getWorkerBarberQueue() {
    const myBarber = this.state.barbers.find((b) => b.id === 'barber-you') ?? this.state.barbers[0];
    const tickets = this.state.tickets
      .filter((t) => t.state === 'en_espera' || t.state === 'notificado' || (t.assignedBarberId === myBarber.id && (t.state === 'llamado' || t.state === 'en_atencion')))
      .map((t, idx) => ({
        ticket_id: t.id,
        fila_id: t.queueId,
        fila_nombre: t.queueName,
        codigo_visible: t.visibleCode,
        estado: t.state as 'en_espera' | 'notificado' | 'llamado' | 'en_atencion',
        servicio_nombre: t.serviceName,
        barbero_solicitado_nombre: t.requestedBarberName,
        barbero_asignado_nombre: t.assignedBarberName,
        llamado_vencimiento_en: t.calledDeadlineAt,
        respuesta_cliente: t.customerResponse,
        respuesta_cliente_en: t.customerResponseAt,
        inicio_en: t.startedAt,
        personas_delante: idx,
        espera_min: idx * 10,
        telefono_invitado: t.phone,
        consentimiento_whatsapp: t.whatsappConsent,
      }));

    return {
      estado: myBarber.operationalState,
      tickets,
    };
  }

  public callMyNextTicket(queueId: string) {
    const myBarber = this.state.barbers.find((b) => b.id === 'barber-you') ?? this.state.barbers[0];
    const nextTicket = this.state.tickets.find(
      (t) => (t.queueId === queueId || !queueId) && (t.state === 'en_espera' || t.state === 'notificado'),
    );

    if (!nextTicket) {
      throw new Error('No hay turnos disponibles para llamar.');
    }

    nextTicket.state = 'llamado';
    nextTicket.assignedBarberId = myBarber.id;
    nextTicket.assignedBarberName = myBarber.name;
    nextTicket.calledAt = new Date().toISOString();
    nextTicket.calledDeadlineAt = new Date(Date.now() + this.state.business.graciaMin * 60000).toISOString();

    myBarber.operationalState = 'ocupado';
    myBarber.currentTicketId = nextTicket.id;

    this.persist();
    this.notifySubscribers(nextTicket);

    return { ticket_id: nextTicket.id, codigo_visible: nextTicket.visibleCode };
  }

  public startMyService(ticketId: string) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Turno no encontrado.');

    ticket.state = 'en_atencion';
    ticket.startedAt = new Date().toISOString();

    const myBarber = this.state.barbers.find((b) => b.id === 'barber-you');
    if (myBarber) {
      myBarber.operationalState = 'ocupado';
      myBarber.currentTicketId = ticket.id;
    }

    this.persist();
    this.notifySubscribers(ticket);
  }

  public finishMyService(ticketId: string) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Turno no encontrado.');

    const now = Date.now();
    ticket.state = 'finalizado';
    ticket.finishedAt = new Date(now).toISOString();
    if (ticket.startedAt) {
      ticket.durationSeconds = Math.max(60, Math.round((now - new Date(ticket.startedAt).getTime()) / 1000));
    } else {
      ticket.durationSeconds = 1200;
    }

    const myBarber = this.state.barbers.find((b) => b.id === 'barber-you');
    if (myBarber) {
      myBarber.operationalState = 'disponible';
      myBarber.currentTicketId = null;
    }

    this.persist();
    this.notifySubscribers(ticket);
  }

  public markMyTicketAbsent(ticketId: string) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Turno no encontrado.');

    ticket.state = 'ausente';
    ticket.finishedAt = new Date().toISOString();

    const myBarber = this.state.barbers.find((b) => b.id === 'barber-you');
    if (myBarber) {
      myBarber.operationalState = 'disponible';
      myBarber.currentTicketId = null;
    }

    this.persist();
    this.notifySubscribers(ticket);
  }

  public setWorkerAvailability(availability: 'disponible' | 'fuera_de_turno') {
    const myBarber = this.state.barbers.find((b) => b.id === 'barber-you');
    if (myBarber) {
      myBarber.operationalState = availability;
      this.persist();
      this.notifySubscribers();
    }
  }

  public createWorkerWalkInTicket(serviceId: string, clientName: string) {
    return this.createGuestTicket({
      companyCode: this.state.business.code,
      serviceId,
      clientName: clientName || 'Cliente Presencial',
    });
  }

  public getWorkerHistory() {
    return this.state.tickets
      .filter((t) => t.state === 'finalizado' || t.state === 'ausente')
      .map((t) => ({
        ticketId: t.id,
        visibleCode: t.visibleCode,
        queueName: t.queueName,
        serviceName: t.serviceName,
        state: t.state as 'finalizado' | 'ausente',
        completedAt: t.finishedAt ?? t.createdAt,
        clientName: t.clientName,
        startedAt: t.startedAt,
        finishedAt: t.finishedAt,
        durationSeconds: t.durationSeconds,
      }));
  }

  public getShopStations() {
    return this.state.barbers.map((b) => {
      const activeTicket = this.state.tickets.find((t) => t.id === b.currentTicketId);
      return {
        barberId: b.id,
        name: b.name,
        operationalState: b.operationalState,
        ticketCode: activeTicket?.visibleCode ?? null,
        serviceName: activeTicket?.serviceName ?? null,
        ticketState: activeTicket?.state ?? null,
      };
    });
  }

  public getReassignmentCandidates(ticketId: string) {
    return this.state.barbers
      .filter((b) => b.id !== 'barber-you')
      .map((b) => ({ barberId: b.id, name: b.name }));
  }

  public reassignCalledTicket(ticketId: string, targetBarberId: string) {
    const ticket = this.state.tickets.find((t) => t.id === ticketId);
    const target = this.state.barbers.find((b) => b.id === targetBarberId);
    if (!ticket || !target) throw new Error('No se pudo reasignar el turno.');

    ticket.assignedBarberId = target.id;
    ticket.assignedBarberName = target.name;

    const myBarber = this.state.barbers.find((b) => b.id === 'barber-you');
    if (myBarber && myBarber.currentTicketId === ticketId) {
      myBarber.operationalState = 'disponible';
      myBarber.currentTicketId = null;
    }

    target.operationalState = 'ocupado';
    target.currentTicketId = ticket.id;

    this.persist();
    this.notifySubscribers(ticket);
  }

  public getWorkerShops() {
    return [
      {
        businessId: this.state.business.id,
        name: this.state.business.name,
        isCurrent: true,
      },
    ];
  }

  public getMemberships() {
    return [
      {
        empresa_id: this.state.business.id,
        empresa_nombre: this.state.business.name,
        empresa_codigo: this.state.business.code,
        rol: 'WORKER' as const,
      },
    ];
  }

  public getBusinessSummary(code: string) {
    const b = this.state.business;
    return {
      nombre: b.name,
      abierta: b.isOpen,
      filas: this.state.queues.map((q) => {
        const count = this.state.tickets.filter((t) => t.queueId === q.id && (t.state === 'en_espera' || t.state === 'notificado')).length;
        return {
          fila_id: q.id,
          nombre: q.name,
          en_espera: count,
          espera_min: count * 10,
        };
      }),
    };
  }

  public getUserProfile() {
    return {
      id: this.state.user.id,
      rol: this.state.user.role,
      empresa_id: this.state.business.id,
      empresa_personal_actual_id: this.state.business.id,
      foto_url: null,
    };
  }
}

export const localDb = new LocalDatabase();
