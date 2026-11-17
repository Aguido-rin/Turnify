import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './icon';

export interface TutorialStep {
  stepNumber: number;
  title: string;
  description: string;
  tip: string;
  iconName: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepNumber: 1,
    title: 'Elige o escanea tu negocio',
    description:
      'Toca "Seleccionar empresa" para buscar el lugar en la lista, o apunta tu cámara al código QR que está en el local.',
    tip: 'No necesitas saber códigos de memoria.',
    iconName: 'storefront-outline',
  },
  {
    stepNumber: 2,
    title: 'Pide tu turno sin registros',
    description:
      'Elige qué atención necesitas y escribe solo tu nombre. Sin contraseñas ni formularios largos.',
    tip: 'Toma menos de 20 segundos.',
    iconName: 'ticket-outline',
  },
  {
    stepNumber: 3,
    title: 'Espera donde prefieras',
    description:
      'Puedes sentarte, caminar o tomar un café. En tu pantalla verás cuántas personas faltan y el tiempo aproximado.',
    tip: 'Tu lugar en la fila está asegurado.',
    iconName: 'time-outline',
  },
  {
    stepNumber: 4,
    title: '¡Te avisamos cuando te toque!',
    description:
      'Cuando sea tu momento, tu celular sonará y cambiará de color para que te acerques con tranquilidad.',
    tip: 'Siempre tendrás unos minutos de tolerancia para llegar.',
    iconName: 'notifications-outline',
  },
];

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TutorialModal({ visible, onClose }: TutorialModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
    }
  }, [visible]);

  const step = TUTORIAL_STEPS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.stepIndicator}>
              Paso {step.stepNumber} de {TUTORIAL_STEPS.length}
            </Text>
            <Pressable
              onPress={onClose}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel="Saltar tutorial"
            >
              <Text style={styles.skipText}>Saltar</Text>
            </Pressable>
          </View>

          <View style={styles.dotsRow}>
            {TUTORIAL_STEPS.map((item, idx) => (
              <View
                key={item.stepNumber}
                style={[styles.dot, idx === currentIndex && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.iconCircle}>
            <Icon name={step.iconName as any} size={44} color="#0F172A" />
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>{step.tip}</Text>
          </View>

          <View style={styles.actionsRow}>
            {!isFirst ? (
              <Pressable
                onPress={handlePrev}
                style={styles.secondaryButton}
                accessibilityRole="button"
                accessibilityLabel="Paso anterior"
              >
                <Text style={styles.secondaryButtonText}>Anterior</Text>
              </Pressable>
            ) : (
              <View style={styles.buttonSpacer} />
            )}

            <Pressable
              onPress={handleNext}
              style={styles.primaryButton}
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'Empezar ahora' : 'Siguiente paso'}
            >
              <Text style={styles.primaryButtonText}>
                {isLast ? 'Empezar ahora' : 'Siguiente'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  skipButton: {
    minHeight: 48,
    minWidth: 72,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    backgroundColor: '#0F172A',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    color: '#1E293B',
    textAlign: 'center',
  },
  tipBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  buttonSpacer: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  primaryButton: {
    flex: 1.4,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});