import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function Actividades({ route }) {
  const { colors } = useApp();
  const mascotaId = route.params?.mascotaId;

  const [rutinas, setRutinas] = useState([{ id: 1, nombre: 'Rutina 1', tiempo: '' }]);
  const [rutinaActiva, setRutinaActiva] = useState(1);
  const [cosasEvitar, setCosasEvitar] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  const storageKey = `@actividades_mascota_${mascotaId}`;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const json = await AsyncStorage.getItem(storageKey);
        if (!json) return;

        const data = JSON.parse(json);
        const rutinasGuardadas = Array.isArray(data.rutinas) && data.rutinas.length > 0
          ? data.rutinas
          : [{ id: 1, nombre: 'Rutina 1', tiempo: '' }];

        setRutinas(rutinasGuardadas);
        setRutinaActiva(data.rutinaActiva || rutinasGuardadas[0].id);
        setCosasEvitar(data.cosasEvitar || '');
      } catch (error) {
        console.log('Error cargando datos:', error);
      }
    };

    if (mascotaId) cargarDatos();
  }, [mascotaId]);

  const guardarDatos = async () => {
    try {
      const data = { rutinas, rutinaActiva, cosasEvitar };
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      Alert.alert('Guardado', 'Cambios guardados correctamente.');
      setIsEditable(false);
    } catch (error) {
      console.log('Error guardando datos:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    }
  };

  const agregarRutina = () => {
    const nueva = {
      id: Date.now(),
      nombre: `Rutina ${rutinas.length + 1}`,
      tiempo: '',
    };
    setRutinas((prev) => [...prev, nueva]);
    setRutinaActiva(nueva.id);
  };

  const borrarRutina = () => {
    if (rutinas.length <= 1) return;
    const nuevas = rutinas.filter((r) => r.id !== rutinaActiva);
    setRutinas(nuevas);
    setRutinaActiva(nuevas[0].id);
  };

  const actualizarCampo = (campo, valor) => {
    setRutinas((prev) =>
      prev.map((r) => (r.id === rutinaActiva ? { ...r, [campo]: valor } : r))
    );
  };

  const rutinaSeleccionada = rutinas.find((r) => r.id === rutinaActiva) || rutinas[0];

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
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
            <View style={styles.heroGlowTop} />
            <View style={styles.heroGlowBottom} />
            <View style={styles.heroHeaderRow}>
              <Text style={styles.heroKicker}>Plan de actividad</Text>
              <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsEditable((prev) => !prev)}>
                <Ionicons name={isEditable ? 'close' : 'create-outline'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.heroTitle}>Rutinas y cuidados</Text>
            <Text style={styles.heroSubtitle}>Organiza tiempos de paseo, juego y ejercicio para una vida más activa.</Text>

            <View style={styles.pillRow}>
              <View style={styles.heroPill}>
                <MaterialCommunityIcons name="run" size={14} color="#FFFFFF" />
                <Text style={styles.heroPillText}>{rutinas.length} rutinas activas</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Rutinas</Text>
              {isEditable && (
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.brand }]} onPress={agregarRutina}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Agregar</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {rutinas.map((rutina) => {
                const active = rutinaActiva === rutina.id;
                return (
                  <TouchableOpacity
                    key={rutina.id}
                    onPress={() => setRutinaActiva(rutina.id)}
                    style={[
                      styles.rutinaChip,
                      {
                        backgroundColor: active ? theme.brand : theme.bg,
                        borderColor: active ? theme.brand : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rutinaChipText,
                        { color: active ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {rutina.nombre || 'Rutina'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.label, { color: theme.text }]}>Nombre de la rutina</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
              value={rutinaSeleccionada?.nombre || ''}
              editable={isEditable}
              onChangeText={(text) => actualizarCampo('nombre', text)}
              placeholder="Ej: Caminata diaria"
              placeholderTextColor={theme.muted}
            />

            <Text style={[styles.label, { color: theme.text }]}>Tiempo de actividad</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
              value={rutinaSeleccionada?.tiempo || ''}
              editable={isEditable}
              onChangeText={(text) => actualizarCampo('tiempo', text)}
              placeholder="Ej: 30 minutos"
              placeholderTextColor={theme.muted}
            />

            {isEditable && rutinas.length > 1 && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.deleteBtn} onPress={borrarRutina}>
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cosas para evitar</Text>
            <Text style={[styles.sectionHint, { color: theme.muted }]}>Anota conductas o actividades que deban evitarse.</Text>
            <TextInput
              style={[styles.textArea, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
              multiline
              value={cosasEvitar}
              editable={isEditable}
              onChangeText={setCosasEvitar}
              placeholder="Ej: Ejercicio intenso en horas de calor"
              placeholderTextColor={theme.muted}
            />
          </View>

          {isEditable && (
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.brand }]} onPress={guardarDatos}>
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    overflow: 'hidden',
  },
  heroGlowTop: {
    position: 'absolute',
    right: -30,
    top: -36,
    width: 125,
    height: 125,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroGlowBottom: {
    position: 'absolute',
    left: -32,
    bottom: -40,
    width: 115,
    height: 115,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
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
  sectionCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chipsRow: {
    marginTop: 10,
    paddingBottom: 2,
    gap: 8,
  },
  rutinaChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  rutinaChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 12,
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
  textArea: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 110,
    textAlignVertical: 'top',
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    marginTop: 14,
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
