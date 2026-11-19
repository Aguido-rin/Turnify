export type TutorialIconName = 'storefront' | 'ticket' | 'clock' | 'bell';

export interface TutorialStep {
  stepNumber: number;
  screenName: string;
  title: string;
  description: string;
  actionHint: string;
  iconName: TutorialIconName;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepNumber: 1,
    screenName: 'Pantalla 1 · Inicio',
    title: 'Presiona "Seleccionar empresa"',
    description:
      'En la pantalla principal, toca el botón azul grande para ver los negocios disponibles o escanea el QR del local.',
    actionHint: 'Toca el botón resaltado abajo para probar',
    iconName: 'storefront',
  },
  {
    stepNumber: 2,
    screenName: 'Pantalla 2 · Servicios',
    title: 'Elige qué atención necesitas',
    description:
      'Selecciona el trámite, consulta o servicio de la lista. Verás cuánto dura cada uno antes de entrar.',
    actionHint: 'Toca la tarjeta del servicio para continuar',
    iconName: 'ticket',
  },
  {
    stepNumber: 3,
    screenName: 'Pantalla 3 · Confirmación',
    title: 'Escribe tu nombre y confirma',
    description:
      'No necesitas crear cuenta ni contraseña. Solo pon tu nombre y presiona "Confirmar mi turno".',
    actionHint: 'Presiona el botón de confirmación',
    iconName: 'clock',
  },
  {
    stepNumber: 4,
    screenName: 'Pantalla 4 · Tu Turno en Vivo',
    title: 'Espera tranquilo, ¡te avisamos!',
    description:
      'Verás tu código de turno y cuántas personas faltan. Cuando te toque, tu celular te avisará.',
    actionHint: '¡Listo! Ya sabes usar Turnify',
    iconName: 'bell',
  },
];