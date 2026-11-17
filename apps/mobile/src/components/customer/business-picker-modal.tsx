import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { listPublicBusinesses } from '../../features/business/business-directory-api';
import {
  BUSINESS_CATEGORIES,
  BusinessDirectoryEntry,
  CategoryFilter,
} from '../../features/customer/business-directory';

interface BusinessPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBusiness: (business: BusinessDirectoryEntry) => void;
}

export function BusinessPickerModal({
  visible,
  onClose,
  onSelectBusiness,
}: BusinessPickerModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<BusinessDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoading(true);
    listPublicBusinesses({ query: searchQuery, category: selectedCategory })
      .then((results) => {
        if (active) setBusinesses(results);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible, searchQuery, selectedCategory]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Seleccionar empresa</Text>
            <Text style={styles.headerSubtitle}>
              Elige el lugar donde deseas sacar tu turno
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar selector de empresa"
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre, código o zona..."
            placeholderTextColor="#64748B"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
            >
              <Text style={styles.clearText}>Borrar</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsContainer}
        >
          {BUSINESS_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0F172A" />
            <Text style={styles.helperText}>Cargando empresas disponibles...</Text>
          </View>
        ) : (
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.businessId}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyTitle}>No encontramos empresas con ese filtro</Text>
                <Text style={styles.helperText}>
                  Prueba seleccionando &quot;Todos&quot; o borrando el texto de búsqueda.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.businessCard}>
                <View style={styles.badgeRow}>
                  <Text style={styles.categoryBadge}>{item.categoryLabel}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      item.isOpen ? styles.statusOpen : styles.statusClosed,
                    ]}
                  >
                    {item.isOpen ? `Abierto · ~${item.etaMinutes} min` : 'Cerrado'}
                  </Text>
                </View>

                <Text style={styles.businessName}>{item.name}</Text>
                <Text style={styles.businessAddress}>
                  {item.district} · Código: {item.code}
                </Text>

                <Pressable
                  onPress={() => onSelectBusiness(item)}
                  style={styles.enterButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Entrar a la fila de ${item.name}`}
                >
                  <Text style={styles.enterButtonText}>Entrar a la fila</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#475569',
    marginTop: 2,
  },
  closeButton: {
    minHeight: 48,
    minWidth: 72,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    minHeight: 52,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  clearBtn: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  chipsContainer: {
    maxHeight: 58,
    marginTop: 12,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
    gap: 14,
  },
  businessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusOpen: {
    color: '#15803D',
  },
  statusClosed: {
    color: '#B91C1C',
  },
  businessName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  businessAddress: {
    fontSize: 15,
    color: '#475569',
  },
  enterButton: {
    marginTop: 6,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  centered: {
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
});