import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function Alimentacion({ route }) {
  const { colors, t } = useApp();
  const { mascotaId } = route.params;

  const [data, setData] = useState({
    recordatorios: [{ id: 1, alimentos: '', porcion: '', hora: new Date() }],
    favoritos: [],
    prohibidos: [],
  });

  const [recordatorioActivo, setRecordatorioActivo] = useState(1);
  const [isEditable, setIsEditable] = useState(false);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [favoritos, setFavoritos] = useState(['']);
  const [prohibidos, setProhibidos] = useState(['']);

  const storageKey = `@alimentacion_${mascotaId}`;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const json = await AsyncStorage.getItem(storageKey);
      if (!json) return;

      const d = JSON.parse(json);
      const recordatorios = (d.recordatorios || []).map((r) => ({
        ...r,
        hora: r.hora ? new Date(r.hora) : new Date(),
      }));

      const safeData = {
        recordatorios: recordatorios.length > 0 ? recordatorios : [{ id: 1, alimentos: '', porcion: '', hora: new Date() }],
        favoritos: Array.isArray(d.favoritos) ? d.favoritos : [],
        prohibidos: Array.isArray(d.prohibidos) ? d.prohibidos : [],
      };

      setData(safeData);
      setRecordatorioActivo(safeData.recordatorios[0].id);
      setFavoritos(safeData.favoritos.length ? safeData.favoritos : ['']);
      setProhibidos(safeData.prohibidos.length ? safeData.prohibidos : ['']);
    } catch (error) {
      console.log('Error cargando datos:', error);
    }
  };

  const guardarDatos = async () => {
    try {
      const dataActualizado = {
        ...data,
        favoritos: favoritos.filter((f) => f.trim() !== ''),
        prohibidos: prohibidos.filter((p) => p.trim() !== ''),
      };

      setData(dataActualizado);
      await AsyncStorage.setItem(storageKey, JSON.stringify(dataActualizado));
      Alert.alert(t.savedTitle || 'Guardado', t.savedChangesSuccess || 'Cambios guardados correctamente.');
      setIsEditable(false);
    } catch (error) {
      console.log('Error guardando:', error);
    }
  };

  const agregarRecordatorio = () => {
    const nuevo = { id: Date.now(), alimentos: '', porcion: '', hora: new Date() };
    setData((prev) => ({ ...prev, recordatorios: [...prev.recordatorios, nuevo] }));
    setRecordatorioActivo(nuevo.id);
  };

  const borrarRecordatorio = () => {
    if (data.recordatorios.length <= 1) return;

    const nuevos = data.recordatorios.filter((r) => r.id !== recordatorioActivo);
    setData((prev) => ({ ...prev, recordatorios: nuevos }));
    setRecordatorioActivo(nuevos[0].id);
  };

  const actualizarCampo = (campo, valor) => {
    setData((prev) => ({
      ...prev,
      recordatorios: prev.recordatorios.map((r) =>
        r.id === recordatorioActivo ? { ...r, [campo]: valor } : r
      ),
    }));
  };

  const recordatorioActual = data.recordatorios.find((r) => r.id === recordatorioActivo);

  const onChangeHora = (_event, selectedDate) => {
    if (selectedDate) actualizarCampo('hora', selectedDate);
    setMostrarPicker(false);
  };

  const formatearHora = (date) => {
    if (!date) return '00:00';
    const d = typeof date === 'string' ? new Date(date) : date;
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const agregarFavorito = () => setFavoritos((prev) => [...prev, '']);
  const agregarProhibido = () => setProhibidos((prev) => [...prev, '']);

  const actualizarFavorito = (text, index) => {
    setFavoritos((prev) => {
      const copia = [...prev];
      copia[index] = text;
      return copia;
    });
  };

  const actualizarProhibido = (text, index) => {
    setProhibidos((prev) => {
      const copia = [...prev];
      copia[index] = text;
      return copia;
    });
  };

  const eliminarFavorito = (index) => {
    setFavoritos((prev) => {
      const copia = prev.filter((_, i) => i !== index);
      return copia.length > 0 ? copia : [''];
    });
  };

  const eliminarProhibido = (index) => {
    setProhibidos((prev) => {
      const copia = prev.filter((_, i) => i !== index);
      return copia.length > 0 ? copia : [''];
    });
  };

  useEffect(() => {
    if (!recordatorioActual?.alimentos) return;

    const encontrados = prohibidos.filter(
      (p) => p.trim() && recordatorioActual.alimentos.toLowerCase().includes(p.toLowerCase())
    );

    if (encontrados.length > 0) {
      Alert.alert(t.forbiddenFoodDetected || 'Alimento prohibido', `${t.reviewItemsPrefix || 'Revisa:'} ${encontrados.join(', ')}`);
    }
  }, [recordatorioActual?.alimentos, prohibidos, t]);

  const theme = useMemo(() => ({
    brand: colors?.primaryDark || '#2F6E4F',
    brandSoft: colors?.primary || '#43A047',
    accent: colors?.accent || '#FF8A65',
    bg: colors?.backgroundLight || '#F6F8F4',
    card: colors?.background || '#FFFFFF',
    border: colors?.border || '#E4E9E5',
    text: colors?.text || '#22352D',
    muted: colors?.textMuted || '#5D6E64',
    placeholder: colors?.placeholder || '#9AA89F',
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
              <Text style={styles.heroKicker}>{t.nutritionPlan || 'Plan nutricional'}</Text>
              <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsEditable((prev) => !prev)}>
                <Ionicons name={isEditable ? 'close' : 'create-outline'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.heroTitle}>{t.dailyFeeding || 'Alimentacion diaria'}</Text>
            <Text style={styles.heroSubtitle}>{t.feedingSubtitle || 'Controla horarios, porciones y alimentos clave para una dieta saludable.'}</Text>

            <View style={styles.pillRow}>
              <View style={styles.heroPill}>
                <MaterialCommunityIcons name="food-apple-outline" size={14} color="#FFFFFF" />
                <Text style={styles.heroPillText}>{data.recordatorios.length} {t.remindersCount || 'recordatorios'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.mealPlanner || 'Planificador de comidas'}</Text>
              {isEditable && (
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.brand }]} onPress={agregarRecordatorio}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>{t.add || 'Agregar'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {data.recordatorios.map((r, index) => {
                const active = recordatorioActivo === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? theme.brand : theme.bg,
                        borderColor: active ? theme.brand : theme.border,
                      },
                    ]}
                    onPress={() => setRecordatorioActivo(r.id)}
                  >
                    <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.text }]}>
                      {t.mealLabel || 'Comida'} {index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.label, { color: theme.text }]}>{t.foodsLabel || 'Alimentos'}</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
              placeholder={t.foodsExample || 'Ej: Croquetas y pollo'}
              placeholderTextColor={theme.placeholder}
              value={recordatorioActual?.alimentos || ''}
              editable={isEditable}
              onChangeText={(t) => actualizarCampo('alimentos', t)}
            />

            <Text style={[styles.label, { color: theme.text }]}>{t.portionLabel || 'Porcion'}</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
              placeholder={t.portionExample || 'Ej: 1 taza'}
              placeholderTextColor={theme.placeholder}
              value={recordatorioActual?.porcion || ''}
              editable={isEditable}
              onChangeText={(t) => actualizarCampo('porcion', t)}
            />

            <Text style={[styles.label, { color: theme.text }]}>{t.scheduleLabel || 'Horario'}</Text>
            <TouchableOpacity
              style={[styles.input, styles.timeInput, { borderColor: theme.border, backgroundColor: theme.bg }]}
              onPress={() => isEditable && setMostrarPicker(true)}
              activeOpacity={0.9}
            >
              <Ionicons name="time-outline" size={18} color={theme.brandSoft} />
              <Text style={[styles.timeText, { color: theme.text }]}>{t.schedulePrefix || 'Horario:'} {formatearHora(recordatorioActual?.hora || new Date())}</Text>
            </TouchableOpacity>

            {mostrarPicker && (
              <DateTimePicker
                value={recordatorioActual?.hora ? new Date(recordatorioActual.hora) : new Date()}
                mode="time"
                is24Hour
                display="default"
                onChange={onChangeHora}
              />
            )}

            {isEditable && data.recordatorios.length > 1 && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.deleteBtn} onPress={borrarRecordatorio}>
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ListEditor
            title={t.favoriteFoods || 'Alimentos favoritos'}
            icon="heart-outline"
            data={favoritos}
            editable={isEditable}
            onAdd={agregarFavorito}
            onUpdate={actualizarFavorito}
            onDelete={eliminarFavorito}
            placeholder={t.carrotExample || 'Ej: Zanahoria'}
            theme={theme}
            addText={t.add || 'Agregar'}
          />

          <ListEditor
            title={t.forbiddenFoods || 'Alimentos prohibidos'}
            icon="warning-outline"
            data={prohibidos}
            editable={isEditable}
            onAdd={agregarProhibido}
            onUpdate={actualizarProhibido}
            onDelete={eliminarProhibido}
            placeholder={t.chocolateExample || 'Ej: Chocolate'}
            theme={theme}
            addText={t.add || 'Agregar'}
          />

          {isEditable && (
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.brand }]} onPress={guardarDatos}>
              <Text style={styles.saveBtnText}>{t.saveChanges || 'Guardar cambios'}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

function ListEditor({ title, icon, data, editable, onAdd, onUpdate, onDelete, placeholder, theme, addText }) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.inlineTitle}>
          <Ionicons name={icon} size={16} color={theme.brandSoft} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
        </View>
        {editable && (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.brand }]} onPress={onAdd}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>{addText}</Text>
          </TouchableOpacity>
        )}
      </View>

      {data.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.listRow}>
          <TextInput
            style={[
              styles.input,
              styles.listInput,
              { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg },
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.placeholder}
            value={item}
            editable={editable}
            onChangeText={(t) => onUpdate(t, index)}
          />
          {editable && (
            <TouchableOpacity style={styles.listDeleteBtn} onPress={() => onDelete(index)}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inlineTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
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
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
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
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
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
  listRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listInput: {
    flex: 1,
  },
  listDeleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
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




