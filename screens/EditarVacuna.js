import React, { useState, useCallback, useMemo } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';
import { buildFormTheme, getSingleSelectedMarkedDates } from '../lib/formTheme';
import { supabase } from '../lib/Supabase';

// Lista de vacunas comunes como sugerencias rápidas
const VACUNAS_COMUNES = [
    'Rabia', 'Parvovirus', 'Distemper', 'Hepatitis', 'Leptospirosis',
    'Bordetella', 'Leucemia felina', 'Calicivirus', 'Rinotraqueítis',
    'Polivalente', 'Desparasitación',
];

export default function EditarVacuna() {
    const navigation = useNavigation();
    const route = useRoute();
    const { vacuna } = route.params || {};
    const { colors, t } = useApp();

    const [selectedMascota, setSelectedMascota] = useState(null);
    const [selectedVeterinaria, setSelectedVeterinaria] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [nombreVacuna, setNombreVacuna] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [veterinarias, setVeterinarias] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [isVetDropdownOpen, setIsVetDropdownOpen] = useState(false);
    const [isMascotaDropdownOpen, setIsMascotaDropdownOpen] = useState(false);

    const theme = useMemo(() => buildFormTheme(colors), [colors]);

    useFocusEffect(
        useCallback(() => {
            if (vacuna) {
                setSelectedDate(vacuna.fecha_aplicacion || vacuna.fecha || '');
                // Cargar nombre de vacuna existente si lo hay
                setNombreVacuna(vacuna.nombre_vacuna || '');
                setDescripcion(vacuna.descripcion || '');
                loadData(vacuna.mascota_id, vacuna.veterinaria_id);
            }
        }, [vacuna])
    );

    const loadData = async (currentMascotaId, currentVetId) => {
        try {
            const [mascotasRes, vetsRes] = await Promise.all([
                supabase.from('mascotas').select('id, nombre').order('nombre', { ascending: true }),
                supabase.from('veterinarias').select('id, nombre').order('nombre', { ascending: true }),
            ]);

            if (!mascotasRes.error) {
                setMascotas(mascotasRes.data || []);
                const current = (mascotasRes.data || []).find(m => m.id === currentMascotaId);
                if (current) setSelectedMascota(current);
                else if (vacuna?.mascota_nombre) {
                    const byName = (mascotasRes.data || []).find(m => m.nombre === vacuna.mascota_nombre);
                    if (byName) setSelectedMascota(byName);
                }
            }

            if (!vetsRes.error) {
                setVeterinarias(vetsRes.data || []);
                const current = (vetsRes.data || []).find(v => v.id === currentVetId);
                if (current) setSelectedVeterinaria(current);
                else if (vacuna?.veterinaria_nombre) {
                    const byName = (vetsRes.data || []).find(v => v.nombre === vacuna.veterinaria_nombre);
                    if (byName) setSelectedVeterinaria(byName);
                }
            }
        } catch (err) {
            console.error('loadData exception:', err);
        }
    };

    // Sugerencias filtradas según lo que escribe el usuario
    const filteredSuggestions = useMemo(() => {
        if (!nombreVacuna.trim()) return VACUNAS_COMUNES;
        const q = nombreVacuna.toLowerCase();
        return VACUNAS_COMUNES.filter(v => v.toLowerCase().includes(q));
    }, [nombreVacuna]);

    const getMarkedDates = () => getSingleSelectedMarkedDates(selectedDate, theme.brand);

    const handleSave = async () => {
        if (!vacuna) {
            Alert.alert(t.error || 'Error', t.vaccineNotFound || 'No se encontro la vacuna a editar.');
            return;
        }
        if (!nombreVacuna.trim()) {
            Alert.alert(t.missingData || 'Faltan datos', 'Escribe el nombre de la vacuna.');
            return;
        }
        if (!selectedMascota || !selectedVeterinaria || !selectedDate) {
            Alert.alert(t.missingData || 'Faltan datos', t.fillPetVetDate || 'Ingresa mascota, veterinaria y fecha de la vacuna.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('vacunas')
                .update({
                    mascota_id: selectedMascota.id,
                    veterinaria_id: selectedVeterinaria.id,
                    fecha_aplicacion: selectedDate,
                    nombre_vacuna: nombreVacuna.trim(),
                    descripcion: descripcion.trim() || null,
                })
                .eq('id', vacuna.id);

            if (error) {
                console.error('EditarVacuna error:', error);
                Alert.alert(t.error || 'Error', t.saveChangesError || 'No se pudieron guardar los cambios.');
                setLoading(false);
                return;
            }

            setLoading(false);
            Alert.alert(t.success || 'Exito', `${t.vaccineUpdated || 'Vacuna actualizada para el'} ${selectedDate}!`, [
                { text: 'OK', onPress: () => navigation.navigate('Calendario') },
            ]);
        } catch (err) {
            console.error('EditarVacuna exception:', err);
            setLoading(false);
            Alert.alert(t.error || 'Error', t.saveChangesError || 'No se pudieron guardar los cambios.');
        }
    };

    return (
        <ScreenWrapper showBack showMenu={false} showNotifications={false} showProfile={false}>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <Text style={styles.heroKicker}>{t.vaccineKicker || 'VACUNAS'}</Text>
                        <Text style={styles.heroTitle}>{t.editVaccineTitle || 'Editar vacuna'}</Text>
                        <Text style={styles.heroSubtitle}>{t.editVaccineSubtitle || 'Ajusta mascota, veterinaria y fecha de aplicacion.'}</Text>
                    </View>

                    {/* ── Nombre de la vacuna ── */}
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, zIndex: 200 }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{'NOMBRE DE LA VACUNA'}</Text>
                        <View
                            style={[
                                styles.inputRow,
                                {
                                    backgroundColor: theme.inputBg,
                                    borderColor: nombreVacuna.trim() ? theme.brand : theme.border,
                                },
                            ]}
                        >
                            <FontAwesome5 name="syringe" size={15} color={theme.brandSoft} style={styles.leftIcon} />
                            <TextInput
                                style={[styles.vacunaInput, { color: theme.text }]}
                                value={nombreVacuna}
                                onChangeText={(text) => {
                                    setNombreVacuna(text);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                placeholder="Ej: Rabia, Parvovirus, Polivalente..."
                                placeholderTextColor={theme.muted}
                                returnKeyType="done"
                            />
                            {nombreVacuna.length > 0 ? (
                                <TouchableOpacity onPress={() => { setNombreVacuna(''); setShowSuggestions(false); }}>
                                    <Ionicons name="close-circle" size={18} color={theme.muted} />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Sugerencias rápidas */}
                        {showSuggestions && filteredSuggestions.length > 0 ? (
                            <View style={[styles.suggestionsBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Text style={[styles.suggestionsLabel, { color: theme.muted }]}>Sugerencias</Text>
                                <View style={styles.suggestionsRow}>
                                    {filteredSuggestions.slice(0, 6).map((sug) => (
                                        <TouchableOpacity
                                            key={sug}
                                            style={[styles.suggestionChip, { backgroundColor: `${theme.brandSoft}18`, borderColor: `${theme.brandSoft}44` }]}
                                            onPress={() => { setNombreVacuna(sug); setShowSuggestions(false); }}
                                        >
                                            <Text style={[styles.suggestionChipText, { color: theme.brandSoft }]}>{sug}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        {/* Indicador de vacuna cargada */}
                        {nombreVacuna.trim() ? (
                            <View style={[styles.vacunaConfirmRow, { backgroundColor: `${theme.brandSoft}14` }]}>
                                <Ionicons name="checkmark-circle" size={16} color={theme.brandSoft} />
                                <Text style={[styles.vacunaConfirmText, { color: theme.brandSoft }]}>
                                    Vacuna: <Text style={{ fontWeight: '800' }}>{nombreVacuna.trim()}</Text>
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* ── Mascota ── */}
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, zIndex: 101 }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.petLabel || 'Mascota'}</Text>
                        <TouchableOpacity
                            style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                            onPress={() => {
                                setIsMascotaDropdownOpen((prev) => !prev);
                                setIsVetDropdownOpen(false);
                                setShowSuggestions(false);
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="paw-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <Text style={[styles.dropdownValue, { color: selectedMascota ? theme.text : theme.muted }]}>
                                {selectedMascota?.nombre || t.selectPetPlaceholder || 'Selecciona una mascota'}
                            </Text>
                            <MaterialIcons
                                name={isMascotaDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={22}
                                color={theme.muted}
                            />
                        </TouchableOpacity>
                        {isMascotaDropdownOpen ? (
                            <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                {mascotas.length === 0 ? (
                                    <View style={styles.emptyStateBox}>
                                        <Text style={[styles.emptyStateText, { color: theme.muted }]}>{t.noRegisteredPets || 'No hay mascotas registradas.'}</Text>
                                    </View>
                                ) : (
                                    mascotas.map((m) => (
                                        <TouchableOpacity
                                            key={m.id}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => { setSelectedMascota(m); setIsMascotaDropdownOpen(false); }}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: theme.text }]}>{m.nombre}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        ) : null}
                    </View>

                    {/* ── Veterinaria ── */}
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, zIndex: 100 }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.vetFallback || 'Veterinaria'}</Text>
                        <TouchableOpacity
                            style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                            onPress={() => {
                                setIsVetDropdownOpen((prev) => !prev);
                                setIsMascotaDropdownOpen(false);
                                setShowSuggestions(false);
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="business-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <Text style={[styles.dropdownValue, { color: selectedVeterinaria ? theme.text : theme.muted }]}>
                                {selectedVeterinaria?.nombre || t.chooseVetPlaceholder || 'Selecciona veterinaria'}
                            </Text>
                            <MaterialIcons
                                name={isVetDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={22}
                                color={theme.muted}
                            />
                        </TouchableOpacity>
                        {isVetDropdownOpen ? (
                            <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                {veterinarias.length === 0 ? (
                                    <View style={styles.emptyStateBox}>
                                        <Text style={[styles.emptyStateText, { color: theme.muted }]}>{t.noSavedVets || 'No hay veterinarias guardadas.'}</Text>
                                    </View>
                                ) : (
                                    veterinarias.map((v) => (
                                        <TouchableOpacity
                                            key={v.id}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => { setSelectedVeterinaria(v); setIsVetDropdownOpen(false); }}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: theme.text }]}>{v.nombre}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        ) : null}
                    </View>

                    {/* ── Fecha ── */}
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.vaccineDateLabel || 'Fecha de vacuna'}</Text>
                        <Calendar
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markingType="simple"
                            markedDates={getMarkedDates()}
                            theme={{
                                backgroundColor: theme.card,
                                calendarBackground: theme.card,
                                textSectionTitleColor: theme.muted,
                                dayTextColor: theme.text,
                                todayTextColor: theme.accent,
                                arrowColor: theme.brand,
                                monthTextColor: theme.text,
                                textDayFontWeight: '500',
                                textDisabledColor: theme.border,
                            }}
                        />
                        {selectedDate ? (
                            <Text style={[styles.selectedDateText, { color: theme.brand }]}>{t.chosenDatePrefix || 'Fecha elegida:'} {selectedDate}</Text>
                        ) : null}
                    </View>

                    {/* ── Descripción ── */}
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{'DESCRIPCIÓN (OPCIONAL)'}</Text>
                        <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                            <Ionicons name="document-text-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <TextInput
                                style={[styles.vacunaInput, { color: theme.text }]}
                                value={descripcion}
                                onChangeText={setDescripcion}
                                placeholder="Ej: Dosis anual, refuerzo, reacción leve..."
                                placeholderTextColor={theme.muted}
                                multiline
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.brand }, loading && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={18} color="#fff" />
                                <Text style={styles.saveButtonText}>{t.saveChanges || 'Guardar cambios'}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.cancelButton, { borderColor: theme.border, backgroundColor: theme.card }]}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.text }]}>{t.cancel || 'Cancelar'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 42 },
    heroCard: { borderRadius: 18, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22, marginBottom: 12 },
    heroKicker: { color: 'rgba(255,255,255,0.74)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    heroSubtitle: { color: 'rgba(255,255,255,0.79)', fontSize: 13, lineHeight: 18, marginTop: 6 },
    card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 14 },
    label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
    inputRow: { minHeight: 48, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    leftIcon: { marginRight: 8 },
    dropdownValue: { flex: 1, fontSize: 14 },
    dropdownList: { marginTop: 6, borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
    dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
    dropdownItemText: { fontSize: 13 },
    emptyStateBox: { padding: 14, alignItems: 'center' },
    emptyStateText: { fontSize: 13 },
    selectedDateText: { marginTop: 10, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    saveButton: { minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
    cancelButton: { minHeight: 48, marginTop: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    buttonDisabled: { opacity: 0.7 },
    saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    cancelButtonText: { fontSize: 14, fontWeight: '600' },
    // Nombre vacuna
    vacunaInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
    suggestionsBox: { marginTop: 10, borderRadius: 10, borderWidth: 1, padding: 10 },
    suggestionsLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
    suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    suggestionChip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
    suggestionChipText: { fontSize: 12, fontWeight: '600' },
    vacunaConfirmRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
    vacunaConfirmText: { fontSize: 13 },
});