import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function Salud({ route }) {
  const { colors, t } = useApp();
  const { mascotaId } = route.params;

  const [padecimientos, setPadecimientos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const storageKey = `@salud_${mascotaId}`;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const json = await AsyncStorage.getItem(storageKey);
      if (json) setPadecimientos(JSON.parse(json));
    } catch (error) {
      console.log('Error cargando datos:', error);
    }
  };

  const guardarDatos = async () => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(padecimientos));
      Alert.alert(t.savedTitle || 'Guardado', t.savedChangesSuccess || 'Cambios guardados correctamente.');
      setIsEditing(false);
    } catch (error) {
      console.log('Error guardando datos:', error);
    }
  };

  const addPadecimiento = () => {
    const nuevo = { id: Date.now(), nombre: '', sintomas: '', medicamentos: '' };
    setPadecimientos((prev) => [nuevo, ...prev]);
    setIsEditing(true);
  };

  const eliminarPadecimiento = (id) => {
    setPadecimientos((prev) => prev.filter((p) => p.id !== id));
  };

  const actualizarCampo = (id, campo, valor) => {
    setPadecimientos((prev) => prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  const theme = useMemo(() => ({
    brand: colors?.primaryDark || '#2F6E4F',
    brandSoft: colors?.primary || '#43A047',
    accent: colors?.accent || '#FF8A65',
    bg: colors?.backgroundLight || '#F6F8F4',
    card: colors?.background || '#FFFFFF',
    border: colors?.border || '#E4E9E5',
    text: colors?.text || '#22352D',
    muted: colors?.textMuted || '#5D6E64',
  }), [colors]);

  return (
    <ScreenWrapper showBack>
      <ScrollView style={[styles.root, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
          <View style={styles.heroHeaderRow}>
            <Text style={styles.heroKicker}>{t.healthHistory || 'Historial de salud'}</Text>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsEditing((prev) => !prev)}>
              <Ionicons name={isEditing ? 'close' : 'create-outline'} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>{t.clinicalTracking || 'Seguimiento clinico'}</Text>
          <Text style={styles.heroSubtitle}>{t.healthSubtitle || 'Registra sintomas, diagnosticos y tratamiento para tener control completo.'}</Text>

          <View style={styles.pillRow}>
            <View style={styles.heroPill}>
              <MaterialIcons name="health-and-safety" size={14} color="#FFFFFF" />
              <Text style={styles.heroPillText}>{padecimientos.length} {t.recordsCount || 'registros'}</Text>
            </View>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity
            style={[styles.addBtn, { borderColor: theme.brand, backgroundColor: theme.card }]}
            onPress={addPadecimiento}
          >
            <Ionicons name="add-circle-outline" size={18} color={theme.brand} />
            <Text style={[styles.addBtnText, { color: theme.brand }]}>{t.addCondition || 'Agregar padecimiento'}</Text>
          </TouchableOpacity>
        )}

        {padecimientos.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="document-text-outline" size={22} color={theme.accent} />
            <Text style={[styles.emptyText, { color: theme.muted }]}>{t.noConditionsYet || 'Aun no hay padecimientos registrados.'}</Text>
          </View>
        )}

        {padecimientos.map((padecimiento) => (
          <View key={padecimiento.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {isEditing ? (
              <>
                <Text style={[styles.label, { color: theme.text }]}>{t.conditionNameLabel || 'Nombre del padecimiento'}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
                  placeholder={t.dermatitisExample || 'Ej: Dermatitis'}
                  placeholderTextColor={theme.muted}
                  value={padecimiento.nombre}
                  onChangeText={(text) => actualizarCampo(padecimiento.id, 'nombre', text)}
                />

                <Text style={[styles.label, { color: theme.text }]}>{t.symptomsLabel || 'Sintomas'}</Text>
                <View style={[styles.iconInputWrap, { borderColor: theme.border, backgroundColor: theme.bg }]}>
                  <MaterialIcons name="healing" size={18} color={theme.muted} />
                  <TextInput
                    style={[styles.inputInline, { color: theme.text }]}
                    placeholder={t.symptomsExample || 'Ej: Picazon, enrojecimiento'}
                    placeholderTextColor={theme.muted}
                    value={padecimiento.sintomas}
                    onChangeText={(text) => actualizarCampo(padecimiento.id, 'sintomas', text)}
                  />
                </View>

                <Text style={[styles.label, { color: theme.text }]}>{t.medicationsLabel || 'Medicamentos'}</Text>
                <View style={[styles.iconInputWrap, { borderColor: theme.border, backgroundColor: theme.bg }]}>
                  <Ionicons name="medkit-outline" size={18} color={theme.muted} />
                  <TextInput
                    style={[styles.inputInline, { color: theme.text }]}
                    placeholder={t.medicationExample || 'Ej: Antiinflamatorio'}
                    placeholderTextColor={theme.muted}
                    value={padecimiento.medicamentos}
                    onChangeText={(text) => actualizarCampo(padecimiento.id, 'medicamentos', text)}
                  />
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => eliminarPadecimiento(padecimiento.id)}>
                    <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{padecimiento.nombre || t.unnamedLabel || 'Sin nombre'}</Text>
                <View style={styles.rowInfo}>
                  <MaterialIcons name="healing" size={16} color={theme.muted} />
                  <Text style={[styles.rowInfoText, { color: theme.muted }]}>{padecimiento.sintomas || '-'}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Ionicons name="medkit-outline" size={16} color={theme.muted} />
                  <Text style={[styles.rowInfoText, { color: theme.muted }]}>{padecimiento.medicamentos || '-'}</Text>
                </View>
              </>
            )}
          </View>
        ))}

        {padecimientos.length > 0 && isEditing && (
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.brand }]} onPress={guardarDatos}>
            <Text style={styles.saveBtnText}>{t.saveChanges || 'Guardar cambios'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  heroCard: {
    borderRadius: 20,
    padding: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroKicker: {
    color: '#CDE2D6',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  toggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 5,
    color: '#DFECE5',
    fontSize: 14,
    lineHeight: 20,
  },
  pillRow: {
    marginTop: 12,
  },
  heroPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rowInfoText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  iconInputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputInline: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 4,
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});


