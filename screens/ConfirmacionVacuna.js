import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';
import { supabase } from '../lib/Supabase';

// Lista de vacunas comunes como sugerencias rápidas
const VACUNAS_COMUNES = [
    'Rabia', 'Parvovirus', 'Distemper', 'Hepatitis', 'Leptospirosis',
    'Bordetella', 'Leucemia felina', 'Calicivirus', 'Rinotraqueítis',
    'Polivalente', 'Desparasitación',
];

export default function ConfirmacionVacuna() {
    const navigation = useNavigation();
    const route = useRoute();
    const { mascota: mascotaParam } = route.params || {};
    const { colors, t } = useApp();

    const [selectedDate, setSelectedDate] = useState('');
    const [veterinarias, setVeterinarias] = useState([]);
    const [selectedVeterinaria, setSelectedVeterinaria] = useState(null);
    const [isVetDropdownOpen, setIsVetDropdownOpen] = useState(false);

    const [mascotas, setMascotas] = useState([]);
    const [selectedMascota, setSelectedMascota] = useState(mascotaParam || null);
    const [isMascotaDropdownOpen, setIsMascotaDropdownOpen] = useState(false);

    // ── Nuevo: nombre de la vacuna ──────────────────────────────
    const [nombreVacuna, setNombreVacuna] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        accent: colors?.accent || '#FF7F5A',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
        inputBg: colors?.inputBackground || '#F6F8F4',
        danger: colors?.danger || '#E53935',
    }), [colors]);

    const loadData = async () => {
        try {
            const [vetsRes, mascotasRes] = await Promise.all([
                supabase.from('veterinarias').select('id, nombre').order('nombre', { ascending: true }),
                supabase.from('mascotas').select('id, nombre').order('nombre', { ascending: true }),
            ]);
            if (!vetsRes.error) setVeterinarias(vetsRes.data || []);
            if (!mascotasRes.error) setMascotas(mascotasRes.data || []);
        } catch (err) {
            console.error('loadData exception:', err);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Sugerencias filtradas según lo que escribe el usuario
    const filteredSuggestions = useMemo(() => {
        if (!nombreVacuna.trim()) return VACUNAS_COMUNES;
        const q = nombreVacuna.toLowerCase();
        return VACUNAS_COMUNES.filter(v => v.toLowerCase().includes(q));
    }, [nombreVacuna]);

    const handleSave = async () => {
        const mascota = selectedMascota;

        if (!nombreVacuna.trim()) {
            Alert.alert(t.error || 'Error', 'Escribe el nombre de la vacuna aplicada.');
            return false;
        }
        if (!selectedDate) {
            Alert.alert(t.error || 'Error', t.chooseVetRequiredDate || 'Selecciona la fecha en que la vacuna fue aplicada.');
            return false;
        }
        if (!selectedVeterinaria) {
            Alert.alert(t.error || 'Error', t.chooseVetRequired || 'Selecciona la veterinaria donde se aplico la vacuna.');
            return false;
        }
        if (!mascota?.id) {
            Alert.alert(t.error || 'Error', 'Selecciona la mascota a la que se le aplico la vacuna.');
            return false;
        }

        try {
            const { error } = await supabase
                .from('vacunas')
                .insert({
                    mascota_id: mascota.id,
                    veterinaria_id: selectedVeterinaria.id,
                    fecha_aplicacion: selectedDate,
                    nombre_vacuna: nombreVacuna.trim(),
                });

            if (error) {
                console.error('ConfirmacionVacuna error:', error);
                Alert.alert(t.error || 'Error', t.vaccineRecordSaveError || 'Hubo un problema al guardar el registro de la vacuna.');
                return false;
            }
            return true;
        } catch (err) {
            console.error('ConfirmacionVacuna exception:', err);
            Alert.alert(t.error || 'Error', t.vaccineRecordSaveError || 'Hubo un problema al guardar el registro de la vacuna.');
            return false;
        }
    };

    return (
        <ScreenWrapper showBack>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

                    {/* ── Hero ── */}
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroTopRow}>
                            <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <FontAwesome5 name="syringe" size={16} color="#FFFFFF" />
                            </View>
                            <View style={[styles.heroPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={styles.heroPillText}>{selectedMascota?.nombre || t.myPet || 'Mi mascota'}</Text>
                            </View>
                        </View>
                        <Text style={styles.heroKicker}>{t.vaccineConfirmKicker || 'VACUNA'}</Text>
                        <Text style={styles.heroTitle}>{t.confirmApplicationTitle || 'Confirmar aplicacion'}</Text>
                        <Text style={styles.heroSubtitle}>{t.confirmApplicationSubtitle || 'Selecciona fecha y veterinaria para registrar correctamente.'}</Text>
                    </View>

                    {/* ── Selector de mascota (solo si no viene en params) ── */}
                    {!mascotaParam ? (
                        <View style={[styles.card, { zIndex: 300, backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[styles.label, { color: theme.muted }]}>{'Mascota'}</Text>
                            <TouchableOpacity
                                style={[styles.dropdownTrigger, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                                onPress={() => {
                                    setIsMascotaDropdownOpen(!isMascotaDropdownOpen);
                                    setIsVetDropdownOpen(false);
                                    setShowSuggestions(false);
                                }}
                            >
                                <Ionicons name="paw-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                                <Text style={[styles.dropdownValue, { color: selectedMascota ? theme.text : theme.muted }]}>
                                    {selectedMascota?.nombre || 'Elige una mascota'}
                                </Text>
                                <MaterialIcons
                                    name={isMascotaDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={24}
                                    color={theme.text}
                                />
                            </TouchableOpacity>
                            {isMascotaDropdownOpen ? (
                                <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                    {mascotas.length === 0 ? (
                                        <View style={styles.emptyStateBox}>
                                            <Text style={[styles.emptyStateText, { color: theme.muted }]}>{'No hay mascotas registradas.'}</Text>
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
                    ) : null}

                    {/* ── Nombre de la vacuna ── */}
                    <View style={[styles.card, { zIndex: 200, backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{'NOMBRE DE LA VACUNA'}</Text>
                        <View
                            style={[
                                styles.dropdownTrigger,
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

                        {/* Indicador de vacuna ya registrada */}
                        {nombreVacuna.trim() ? (
                            <View style={[styles.vacunaConfirmRow, { backgroundColor: `${theme.brandSoft}14` }]}>
                                <Ionicons name="checkmark-circle" size={16} color={theme.brandSoft} />
                                <Text style={[styles.vacunaConfirmText, { color: theme.brandSoft }]}>
                                    Registrando: <Text style={{ fontWeight: '800' }}>{nombreVacuna.trim()}</Text>
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* ── Fecha ── */}
                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.appliedDateLabel || 'Fecha aplicada'}</Text>
                        <Calendar
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markedDates={{
                                [selectedDate]: { selected: true, marked: true, selectedColor: theme.brand },
                            }}
                            theme={{
                                backgroundColor: theme.card,
                                calendarBackground: theme.card,
                                textSectionTitleColor: theme.muted,
                                dayTextColor: theme.text,
                                monthTextColor: theme.text,
                                todayTextColor: theme.accent,
                                arrowColor: theme.brand,
                                textDisabledColor: theme.border,
                                textDayFontWeight: '500',
                            }}
                        />
                        {selectedDate ? (
                            <Text style={[styles.dateText, { color: theme.brand }]}>{t.chosenDatePrefix || 'Fecha elegida:'} {selectedDate}</Text>
                        ) : null}
                    </View>

                    {/* ── Veterinaria ── */}
                    <View style={[styles.card, { zIndex: 100, backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.vetFallback || 'Veterinaria'}</Text>
                        <TouchableOpacity
                            style={[styles.dropdownTrigger, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                            onPress={() => {
                                setIsVetDropdownOpen(!isVetDropdownOpen);
                                setIsMascotaDropdownOpen(false);
                                setShowSuggestions(false);
                            }}
                        >
                            <Ionicons name="business-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <Text style={[styles.dropdownValue, { color: selectedVeterinaria ? theme.text : theme.muted }]}>
                                {selectedVeterinaria?.nombre || t.chooseVetPlaceholder || 'Elige una veterinaria'}
                            </Text>
                            <MaterialIcons
                                name={isVetDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={24}
                                color={theme.text}
                            />
                        </TouchableOpacity>
                        {isVetDropdownOpen ? (
                            <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                {veterinarias.length === 0 ? (
                                    <View style={styles.emptyStateBox}>
                                        <Text style={[styles.emptyStateText, { color: theme.muted }]}>{t.noSavedVets || 'No hay veterinarias guardadas.'}</Text>
                                    </View>
                                ) : (
                                    veterinarias.map((option) => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => { setSelectedVeterinaria(option); setIsVetDropdownOpen(false); }}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: theme.text }]}>{option.nombre}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        ) : null}
                    </View>

                    {/* ── Confirmar ── */}
                    <TouchableOpacity
                        style={[styles.vaccineButton, { backgroundColor: theme.brand }]}
                        onPress={async () => {
                            const saved = await handleSave();
                            if (saved) {
                                navigation.replace('VacunaRegistrada', { fechaAplicada: selectedDate });
                                setSelectedDate('');
                            }
                        }}
                    >
                        <View style={styles.vaccineButtonContent}>
                            <FontAwesome5 name="syringe" size={16} color="white" />
                            <Text style={styles.vaccineButtonText}>{t.confirm || 'Confirmar'}</Text>
                            <Ionicons name="checkmark-circle" size={18} color="#D4EDDA" style={{ marginLeft: 8 }} />
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 44 },
    heroCard: { borderRadius: 18, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22, marginBottom: 12 },
    heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    heroIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    heroPill: { borderRadius: 16, paddingVertical: 5, paddingHorizontal: 10 },
    heroPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    heroKicker: { color: 'rgba(255,255,255,0.74)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    heroSubtitle: { color: 'rgba(255,255,255,0.79)', fontSize: 13, lineHeight: 18, marginTop: 6 },
    card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 14 },
    label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
    dateText: { marginTop: 10, fontSize: 13, textAlign: 'center', fontWeight: '700' },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, minHeight: 48, paddingHorizontal: 10 },
    leftIcon: { marginRight: 8 },
    dropdownValue: { flex: 1, fontSize: 14 },
    dropdownList: { marginTop: 6, borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
    dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
    dropdownItemText: { fontSize: 13 },
    emptyStateBox: { padding: 14, alignItems: 'center' },
    emptyStateText: { fontSize: 13 },
    vaccineButton: { minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    vaccineButtonContent: { flexDirection: 'row', alignItems: 'center' },
    vaccineButtonText: { color: 'white', fontSize: 15, fontWeight: '700', marginLeft: 10, marginRight: 5 },
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