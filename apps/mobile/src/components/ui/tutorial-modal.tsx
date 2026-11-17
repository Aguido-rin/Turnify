import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Icon, type IconName } from '@/components/ui';
import { Palette, Radius, space, TypeScale } from '@/constants/theme';

export type TutorialStep = {
  id: number;
  title: string;
  headline: string;
  description: string;
  tip: string;
  icon: IconName;
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Paso 1 de 4',
    headline: 'Elige tu negocio',
    description: 'Encuentra el establecimiento en la lista o escanea el código QR que está en el mostrador del local.',
    tip: 'No necesitas esperar de pie ni adivinar cuánto falta.',
    icon: 'storefront',
  },
  {
    id: 2,
    title: 'Paso 2 de 4',
    headline: 'Pide tu turno al instante',
    description: 'Elige el servicio que necesitas. ¡Sin crear contraseñas ni llenar formularios complicados!',
    tip: 'Tu lugar queda asegurado en tu teléfono de inmediato.',
    icon: 'ticket',
  },
  {
    id: 3,
    title: 'Paso 3 de 4',
    headline: 'Espera donde prefieras',
    description: 'Puedes sentarte, tomar un café o hacer tus pendientes cerca mientras ves en tiempo real cuántas personas faltan.',
    tip: 'La pantalla te muestra el tiempo estimado de espera en vivo.',
    icon: 'clock',
  },
  {
    id: 4,
    title: 'Paso 4 de 4',
    headline: '¡Te avisamos cuando te toque!',
    description: 'Tu celular te notificará cuando sea tu turno. Solo acércate al mostrador o con el personal cuando te llamen.',
    tip: '¡Listo! Así de simple es usar Turnify sin perder tu tiempo.',
    icon: 'bell',
  },
];

export type TutorialModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function TutorialModal({ visible, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  function next() {
    if (isLast) {
      setCurrentStep(0);
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function prev() {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleSkip() {
    setCurrentStep(0);
    onClose();
  }

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      onRequestClose={handleSkip}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[TypeScale.eyebrow, { color: Palette.brandDeep }]}>{step.title}</Text>
            <Pressable
              accessibilityLabel="Saltar tutorial"
              accessibilityRole="button"
              hitSlop={12}
              onPress={handleSkip}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Saltar</Text>
            </Pressable>
          </View>

          {/* Visual Icon Illustration */}
          <View style={styles.iconCircle}>
            <Icon color={Palette.brand} name={step.icon} size={36} strokeWidth={2.2} />
          </View>

          {/* Step content */}
          <View style={styles.body}>
            <Text style={[TypeScale.h2, styles.headline]}>{step.headline}</Text>
            <Text style={[TypeScale.body, styles.description]}>{step.description}</Text>
          </View>

          {/* Reassuring Tip Box */}
          <Card padding="sm" style={styles.tipCard} tone="brand">
            <View style={styles.tipRow}>
              <Icon color={Palette.brand} name="check-circle" size={18} />
              <Text style={[TypeScale.caption, styles.tipText]}>{step.tip}</Text>
            </View>
          </Card>

          {/* Step indicator dots */}
          <View style={styles.dotsRow}>
            {TUTORIAL_STEPS.map((s, idx) => {
              const active = idx === currentStep;
              return (
                <View
                  key={s.id}
                  style={[
                    styles.dot,
                    active ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              );
            })}
          </View>

          {/* Navigation Controls */}
          <View style={styles.actions}>
            {!isFirst ? (
              <View style={styles.actionButtonHalf}>
                <Button
                  fullWidth
                  label="Anterior"
                  onPress={prev}
                  size="md"
                  variant="secondary"
                />
              </View>
            ) : null}
            <View style={isFirst ? styles.actionButtonFull : styles.actionButtonHalf}>
              <Button
                fullWidth
                label={isLast ? '¡Entendido, empezar!' : 'Siguiente'}
                onPress={next}
                size="md"
                variant="primary"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 29, 0.65)',
    flex: 1,
    justifyContent: 'center',
    padding: space(4),
  },
  modalCard: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: space(4),
    maxWidth: 420,
    padding: space(5),
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  skipButton: {
    minHeight: 32,
    minWidth: 48,
    paddingHorizontal: space(2),
    paddingVertical: space(1),
  },
  skipText: {
    color: Palette.inkMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  iconCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Palette.brandSoftest,
    borderColor: Palette.border,
    borderRadius: Radius.full,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  body: {
    alignItems: 'center',
    gap: space(2),
    textAlign: 'center',
  },
  headline: {
    color: Palette.ink,
    textAlign: 'center',
  },
  description: {
    color: Palette.inkMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: Palette.brandSoftest,
    borderColor: Palette.border,
    borderRadius: Radius.medium,
  },
  tipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space(2),
  },
  tipText: {
    color: Palette.brandDeep,
    flex: 1,
    fontWeight: '500',
  },
  dotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space(2),
    justifyContent: 'center',
    paddingVertical: space(1),
  },
  dot: {
    borderRadius: Radius.pill,
    height: 8,
  },
  dotActive: {
    backgroundColor: Palette.brand,
    width: 24,
  },
  dotInactive: {
    backgroundColor: Palette.border,
    width: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: space(2),
    width: '100%',
  },
  actionButtonFull: {
    flex: 1,
  },
  actionButtonHalf: {
    flex: 1,
  },
});
