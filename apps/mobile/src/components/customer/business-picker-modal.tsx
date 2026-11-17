import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Icon, Pill, TextField } from '@/components/ui';
import { Palette, Radius, space, TypeScale } from '@/constants/theme';
import {
  BUSINESS_CATEGORIES,
  searchBusinesses,
  type BarberDirectoryEntry,
  type CategoryFilter,
} from '@/features/customer/barber-directory';

export type BusinessPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectBusiness: (business: BarberDirectoryEntry) => void;
};

export function BusinessPickerModal({
  visible,
  onClose,
  onSelectBusiness,
}: BusinessPickerModalProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Todos');

  const filteredBusinesses = useMemo(() => {
    return searchBusinesses(query, selectedCategory);
  }, [query, selectedCategory]);

  function handleSelect(business: BarberDirectoryEntry) {
    onClose();
    onSelectBusiness(business);
  }

  return (
    <Modal
      animationType="slide"
      hardwareAccelerated
      onRequestClose={onClose}
      visible={visible}
    >
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.titleWrap}>
            <Text style={[TypeScale.eyebrow, { color: Palette.brandDeep }]}>Turnify · Negocios</Text>
            <Text style={[TypeScale.title, { color: Palette.ink }]}>Elige dónde hacer cola</Text>
          </View>
          <Pressable
            accessibilityLabel="Cerrar selector"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Icon color={Palette.ink} name="close" size={24} />
          </Pressable>
        </View>

        {/* Search input */}
        <View style={styles.searchWrap}>
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            label="BUSCAR EMPRESA O CÓDIGO"
            onChangeText={setQuery}
            placeholder="Ej.: Barbería, Clínica, Trámites..."
            returnKeyType="search"
            value={query}
          />
        </View>

        {/* Category chips */}
        <View style={styles.categoriesRow}>
          {BUSINESS_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <Pressable
                accessibilityLabel={`Filtrar por ${category}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipSelected : null,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected ? styles.categoryChipTextSelected : null,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* List of businesses */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {filteredBusinesses.length === 0 ? (
            <Card padding="lg" style={styles.emptyCard} tone="neutral">
              <Icon color={Palette.inkMuted} name="search" size={28} />
              <Text style={[TypeScale.headline, { color: Palette.ink, textAlign: 'center' }]}>
                No encontramos negocios
              </Text>
              <Text style={[TypeScale.caption, { color: Palette.inkMuted, textAlign: 'center' }]}>
                Prueba con otro término de búsqueda o selecciona otra categoría.
              </Text>
              <Button
                label="Ver todos los negocios"
                onPress={() => {
                  setQuery('');
                  setSelectedCategory('Todos');
                }}
                size="sm"
                variant="secondary"
              />
            </Card>
          ) : (
            filteredBusinesses.map((item) => {
              const availableCount = item.catalog.barbers.filter(
                (b) => b.operationalState === 'disponible'
              ).length;

              return (
                <Card key={item.businessId} padding="md" style={styles.businessCard}>
                  <View style={styles.businessHeader}>
                    <View style={styles.businessHeaderLeft}>
                      <Text style={[TypeScale.headline, styles.businessName]}>{item.name}</Text>
                      <View style={styles.metaRow}>
                        <Pill
                          label={item.categoryLabel}
                          size="sm"
                          tone={item.category === 'salud' ? 'brand' : item.category === 'atencion_cliente' ? 'gold' : 'neutral'}
                        />
                        <Text style={[TypeScale.caption, { color: Palette.inkMuted }]}>
                          {item.district} · {item.distanceKm.toFixed(1)} km
                        </Text>
                      </View>
                    </View>
                    <Pill
                      label={item.isOpen ? 'Abierto' : 'Cerrado'}
                      size="sm"
                      tone={item.isOpen ? 'success' : 'neutral'}
                    />
                  </View>

                  <View style={styles.factsRow}>
                    <View style={styles.factItem}>
                      <Icon color={Palette.brand} name="ticket" size={14} />
                      <Text style={styles.factText}>{item.catalog.services.length} servicios</Text>
                    </View>
                    <View style={styles.factItem}>
                      <Icon color={Palette.brand} name="user" size={14} />
                      <Text style={styles.factText}>
                        {availableCount} {item.staffLabel.toLowerCase()}{availableCount === 1 ? '' : 's'} libres
                      </Text>
                    </View>
                    <View style={styles.factItem}>
                      <Icon color={Palette.goldDeep} name="clock" size={14} />
                      <Text style={styles.factText}>~{item.etaMinutes} min espera</Text>
                    </View>
                  </View>

                  <Button
                    disabled={!item.isOpen}
                    fullWidth
                    iconRight="arrow-right"
                    label={item.isOpen ? 'Hacer cola aquí' : 'Local cerrado'}
                    onPress={() => handleSelect(item)}
                    size="md"
                    variant={item.isOpen ? 'primary' : 'secondary'}
                  />
                </Card>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.canvas,
    flex: 1,
    paddingHorizontal: space(4),
    paddingTop: space(6),
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: space(3),
  },
  titleWrap: {
    gap: 2,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: Palette.brandSoftest,
    borderColor: Palette.border,
    borderRadius: Radius.full,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  searchWrap: {
    paddingBottom: space(3),
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space(2),
    paddingBottom: space(3),
  },
  categoryChip: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: space(3),
    paddingVertical: space(2),
  },
  categoryChipSelected: {
    backgroundColor: Palette.brand,
    borderColor: Palette.brand,
  },
  categoryChipText: {
    color: Palette.inkMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    gap: space(3),
    paddingBottom: space(8),
  },
  businessCard: {
    gap: space(3),
  },
  businessHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessHeaderLeft: {
    flex: 1,
    gap: space(1),
  },
  businessName: {
    color: Palette.ink,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space(2),
  },
  factsRow: {
    alignItems: 'center',
    backgroundColor: Palette.canvas,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space(3),
    paddingHorizontal: space(3),
    paddingVertical: space(2),
  },
  factItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space(1),
  },
  factText: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    gap: space(2),
    marginTop: space(4),
  },
});
