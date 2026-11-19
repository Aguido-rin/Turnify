import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Palette } from '@/constants/theme';
import { Icon, type IconName } from './icon';

import {
  TUTORIAL_STEPS,
  type TutorialStep,
} from '@/features/public/tutorial-steps';

export { TUTORIAL_STEPS, type TutorialStep };

export interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TutorialModal({ visible, onClose }: TutorialModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulseAnim]);

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
      animationType="fade"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Cabecera con progreso y botón Saltar */}
            <View style={styles.topRow}>
              <View style={styles.stepPill}>
                <Text style={styles.stepIndicator}>
                  Paso {step.stepNumber} de {TUTORIAL_STEPS.length}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Saltar guía"
              >
                <Text style={styles.skipText}>Saltar</Text>
              </Pressable>
            </View>

            {/* Barra segmentada */}
            <View style={styles.dotsRow}>
              {TUTORIAL_STEPS.map((item, idx) => (
                <Pressable
                  key={item.stepNumber}
                  onPress={() => setCurrentIndex(idx)}
                  style={[
                    styles.dot,
                    idx <= currentIndex && styles.dotCompleted,
                    idx === currentIndex && styles.dotActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Ir al paso ${item.stepNumber}`}
                />
              ))}
            </View>

            {/* Vista previa interactiva de la pantalla real */}
            <View style={styles.phoneFrame}>
              <View style={styles.phoneTopBar}>
                <View style={styles.phoneDots}>
                  <View style={styles.phoneDot} />
                  <View style={styles.phoneDot} />
                </View>
                <Text style={styles.phoneScreenLabel}>{step.screenName}</Text>
                <View style={{ width: 20 }} />
              </View>

              <View style={styles.phoneBody}>
                {currentIndex === 0 && (
                  <View style={styles.mockContainer}>
                    <Text style={styles.mockHeading}>Tu turno, sin esperar de más</Text>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                      <Pressable
                        onPress={handleNext}
                        style={styles.hotspotPrimaryBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Simular tocar Seleccionar empresa"
                      >
                        <Icon name="storefront" size={18} color="#FFFFFF" />
                        <Text style={styles.hotspotPrimaryBtnText}>Seleccionar empresa</Text>
                        <View style={styles.tapTag}>
                          <Text style={styles.tapTagText}>Toca aquí</Text>
                        </View>
                      </Pressable>
                    </Animated.View>
                    <View style={styles.mockGhostBtn}>
                      <Icon name="qr" size={15} color="#64748B" />
                      <Text style={styles.mockGhostBtnText}>Escanear código QR</Text>
                    </View>
                  </View>
                )}

                {currentIndex === 1 && (
                  <View style={styles.mockContainer}>
                    <View style={styles.mockShopHeader}>
                      <Text style={styles.mockShopBadge}>SALUD · ABIERTO</Text>
                      <Text style={styles.mockShopTitle}>Centro Médico Demo</Text>
                    </View>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                      <Pressable
                        onPress={handleNext}
                        style={styles.hotspotCard}
                        accessibilityRole="button"
                        accessibilityLabel="Simular elegir servicio Medicina general"
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.hotspotCardTitle}>Medicina general</Text>
                          <Text style={styles.hotspotCardSub}>Duración aprox. · 20 min</Text>
                        </View>
                        <View style={styles.tapTagBlue}>
                          <Text style={styles.tapTagBlueText}>Toca aquí</Text>
                        </View>
                      </Pressable>
                    </Animated.View>
                    <View style={styles.mockGhostCard}>
                      <Text style={styles.mockGhostTitle}>Triaje y control</Text>
                      <Text style={styles.mockGhostSub}>15 min</Text>
                    </View>
                  </View>
                )}

                {currentIndex === 2 && (
                  <View style={styles.mockContainer}>
                    <View style={styles.mockInputBox}>
                      <Text style={styles.mockInputLabel}>TU NOMBRE</Text>
                      <Text style={styles.mockInputValue}>María López</Text>
                    </View>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                      <Pressable
                        onPress={handleNext}
                        style={styles.hotspotPrimaryBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Simular confirmar turno"
                      >
                        <Icon name="check" size={18} color="#FFFFFF" />
                        <Text style={styles.hotspotPrimaryBtnText}>Confirmar mi turno</Text>
                        <View style={styles.tapTag}>
                          <Text style={styles.tapTagText}>Toca aquí</Text>
                        </View>
                      </Pressable>
                    </Animated.View>
                  </View>
                )}

                {currentIndex === 3 && (
                  <View style={styles.mockContainer}>
                    <View style={styles.mockTicketCard}>
                      <View style={styles.mockTicketTop}>
                        <Text style={styles.mockTicketCode}>Turno A-04</Text>
                        <View style={styles.mockLiveBadge}>
                          <Text style={styles.mockLiveBadgeText}>EN VIVO</Text>
                        </View>
                      </View>
                      <Text style={styles.mockTicketWait}>2 personas delante · ~15 min</Text>
                    </View>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                      <Pressable
                        onPress={onClose}
                        style={styles.mockAlertBanner}
                        accessibilityRole="button"
                        accessibilityLabel="Finalizar guía"
                      >
                        <Icon name="bell" size={18} color="#92400E" />
                        <Text style={styles.mockAlertText}>
                          Te avisaremos aquí mismo cuando sea tu turno
                        </Text>
                      </Pressable>
                    </Animated.View>
                  </View>
                )}
              </View>
            </View>

            {/* Explicación clara del paso */}
            <View style={styles.copyBlock}>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.description}>{step.description}</Text>
              <Text style={styles.actionHint}>{step.actionHint}</Text>
            </View>

            {/* Botones de navegación */}
            <View style={styles.actionsRow}>
              {!isFirst ? (
                <Pressable
                  onPress={handlePrev}
                  style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Paso anterior"
                >
                  <Text style={styles.secondaryButtonText}>Anterior</Text>
                </Pressable>
              ) : null}

              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.primaryButton,
                  isFirst && { flex: 1 },
                  pressed && { opacity: 0.9 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={isLast ? 'Empezar ahora' : 'Siguiente paso'}
              >
                <Text style={styles.primaryButtonText}>
                  {isLast ? 'Empezar ahora' : 'Siguiente'}
                </Text>
                <Icon name={isLast ? 'check' : 'arrow-right'} size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </ScrollView>
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
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  scrollContent: {
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  stepIndicator: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.brand,
  },
  skipButton: {
    minHeight: 36,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  dotCompleted: {
    backgroundColor: '#93C5FD',
  },
  dotActive: {
    backgroundColor: Palette.brand,
  },
  phoneFrame: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  phoneTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  phoneDots: {
    flexDirection: 'row',
    gap: 4,
  },
  phoneDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  phoneScreenLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  phoneBody: {
    padding: 14,
    minHeight: 168,
    justifyContent: 'center',
  },
  mockContainer: {
    gap: 10,
    alignItems: 'center',
    width: '100%',
  },
  mockHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  hotspotPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Palette.brand,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  hotspotPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  tapTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 2,
  },
  tapTagText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '800',
  },
  mockGhostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    opacity: 0.65,
  },
  mockGhostBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  mockShopHeader: {
    width: '100%',
    gap: 2,
  },
  mockShopBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D9488',
  },
  mockShopTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  hotspotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 2.5,
    borderColor: '#2563EB',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  hotspotCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  hotspotCardSub: {
    fontSize: 12,
    color: '#475569',
  },
  tapTagBlue: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tapTagBlueText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  mockGhostCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    opacity: 0.65,
  },
  mockGhostTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  mockGhostSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  mockInputBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  mockInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  mockInputValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  mockTicketCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  mockTicketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockTicketCode: {
    fontSize: 16,
    fontWeight: '900',
    color: Palette.brand,
  },
  mockLiveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  mockLiveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  mockTicketWait: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  mockAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mockAlertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  copyBlock: {
    gap: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    textAlign: 'center',
  },
  actionHint: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.brand,
    textAlign: 'center',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  primaryButton: {
    flex: 1.5,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: Palette.brand,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});