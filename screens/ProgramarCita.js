import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';
import NotificationService from './Notificaciones';
import { supabase } from '../lib/Supabase';

export default function ProgramarCita() {
    const navigation = useNavigation();
    const { colors, t } = useApp();

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
    }), [colors]);

    const [nombreUsuario, setNombreUsuario] = useState('');
    const [selectedVeterinaria, setSelectedVeterinaria] = useState(null); // { id, nombre }
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [veterinarias, setVeterinarias] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadVeterinarias = async () => {
        try {
            const { data, error } = await supabase
                .from('veterinarias')
                .select('id, nombre')
                .order('nombre', { ascending: true });

            if (error) { console.error('loadVeterinarias error:', error); return; }
            setVeterinarias(data || []);
        } catch (err) {
            console.error('loadVeterinarias exception:', err);
        }
    };

    useFocusEffect(useCallback(() => { loadVeterinarias(); }, []));

    const formatTime = (date) => {
        const h = date.getHours();
        const m = date.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${m < 10 ? `0${m}` : m} ${ampm}`;
    };

    const onTimeChange = (event, selected) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selected) setSelectedTime(selected);
    };

    const handleSave = async () => {
        const usuario = nombreUsuario.trim();

        if (!usuario || !selectedVeterinaria || !selectedDate) {
            Alert.alert(
                t.missingData || 'Faltan datos',
                `${t.completeAllFields || 'Completa todos los campos:'}\n${!usuario ? `- ${t.nameFieldLabel || 'Nombre'}\n` : ''}${!selectedVeterinaria ? `- ${t.vetFallback || 'Veterinaria'}\n` : ''}${!selectedDate ? `- ${t.dateFieldLabel || 'Fecha'}` : ''}`
            );
            return;
        }

        setLoading(true);
        const horaFormateada = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert(t.error || 'Error', 'No autenticado.');
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('citas')
                .insert({
                    user_id: user.id,
                    usuario,
                    veterinaria_id: selectedVeterinaria.id,
                    fecha: selectedDate,
                    hora: horaFormateada,
                    tipo: 'Cita',
                })
                .select()
                .single();

            if (error) {
                console.error('ProgramarCita error:', error);
                Alert.alert(t.error || 'Error', t.saveAppointmentError || 'No se pudo guardar la cita.');
                setLoading(false);
                return;
            }

            // Notificación
            await NotificationService.scheduleAppointmentNotification({
                id: data.id,
                usuario,
                veterinaria: selectedVeterinaria.nombre,
                fecha: selectedDate,
                hora: horaFormateada,
                tipo: 'Cita',
            }, 24);

            setLoading(false);
            Alert.alert(
                t.appointmentSavedTitle || 'Cita guardada',
                `${selectedVeterinaria.nombre} - ${selectedDate} ${t.atTimeConnector || 'a las'} ${formatTime(selectedTime)}`,
                [{ text: 'OK', onPress: () => navigation.navigate('Calendario') }]
            );

            setNombreUsuario('');
            setSelectedVeterinaria(null);
            setSelectedDate('');
            setSelectedTime(new Date());
        } catch (err) {
            console.error('ProgramarCita exception:', err);
            setLoading(false);
            Alert.alert(t.error || 'Error', t.saveAppointmentError || 'No se pudo guardar la cita.');
        }
    };

    return (
        <ScreenWrapper showBack={true}>
            <ScrollView
                style={{ backgroundColor: theme.bg }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero ── */}
                <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                    <View style={styles.heroGlowTop} />
                    <View style={styles.heroGlowBottom} />
                    <Text style={styles.heroKicker}>{t.newAppointmentKicker || 'NUEVA CITA'}</Text>
                    <Text style={styles.heroTitle}>{t.scheduleAppointmentCta || 'Programar cita'}</Text>
                    <Text style={styles.heroSubtitle}>{t.chooseVetDateTime || 'Elige veterinaria, fecha y hora'}</Text>
                </View>

                {/* ── Nombre del usuario ── */}
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.label, { color: theme.muted }]}>{t.userNameLabel || 'Nombre del usuario'}</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                        value={nombreUsuario}
                        onChangeText={setNombreUsuario}
                        placeholder={t.userNamePlaceholder || 'Ej. Gabriel Perez'}
                        placeholderTextColor={theme.muted}
                    />
                </View>

                {/* ── Veterinaria ── */}
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, zIndex: 100 }]}>
                    <Text style={[styles.label, { color: theme.muted }]}>{t.vetFallback || 'Veterinaria'}</Text>
                    <TouchableOpacity
                        style={[styles.dropdownTrigger, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <Text style={[styles.dropdownText, { color: selectedVeterinaria ? theme.text : theme.muted }]}>
                            {selectedVeterinaria?.nombre || t.chooseVetPlaceholder || 'Elige una veterinaria'}
                        </Text>
                        <MaterialIcons
                            name={isDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={22}
                            color={theme.muted}
                        />
                    </TouchableOpacity>

                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            {veterinarias.length === 0 ? (
                                <View style={styles.dropdownEmpty}>
                                    <Text style={[styles.dropdownEmptyText, { color: theme.muted }]}>
                                        {t.noSavedVets || 'No hay veterinarias guardadas.'}
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.addVetBtn, { backgroundColor: theme.brand }]}
                                        onPress={() => { setIsDropdownOpen(false); navigation.navigate('RegistroVeterinaria'); }}
                                    >
                                        <Ionicons name="add" size={16} color="#FFF" />
                                        <Text style={styles.addVetBtnText}>{t.registerVet || 'Registrar veterinaria'}</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    {veterinarias.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => { setSelectedVeterinaria(opt); setIsDropdownOpen(false); }}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: theme.text }]}>{opt.nombre}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={[styles.dropdownFooter, { borderTopColor: theme.border }]}
                                        onPress={() => { setIsDropdownOpen(false); navigation.navigate('RegistroVeterinaria'); }}
                                    >
                                        <Ionicons name="add-circle-outline" size={18} color={theme.brandSoft} />
                                        <Text style={[styles.dropdownFooterText, { color: theme.brandSoft }]}>{t.addNewVet || 'Agregar nueva veterinaria'}</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* ── Fecha ── */}
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.label, { color: theme.muted }]}>{t.appointmentDateLabel || 'Fecha de la cita'}</Text>
                    <Calendar
                        onDayPress={day => setSelectedDate(day.dateString)}
                        markingType="simple"
                        markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: theme.brand } } : {}}
                        theme={{
                            backgroundColor: theme.card,
                            calendarBackground: theme.card,
                            textSectionTitleColor: theme.muted,
                            dayTextColor: theme.text,
                            monthTextColor: theme.text,
                            todayTextColor: theme.accent,
                            arrowColor: theme.brand,
                            textDayFontWeight: '500',
                            textDisabledColor: theme.border,
                            selectedDayBackgroundColor: theme.brand,
                            selectedDayTextColor: '#FFFFFF',
                        }}
                    />
                    {selectedDate ? (
                        <View style={[styles.selectedDatePill, { backgroundColor: `${theme.brand}14` }]}>
                            <Ionicons name="calendar" size={14} color={theme.brand} />
                            <Text style={[styles.selectedDateText, { color: theme.brand }]}>{t.selectedDatePrefix || 'Seleccionado:'} {selectedDate}</Text>
                        </View>
                    ) : null}
                </View>

                {/* ── Hora ── */}
                <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.label, { color: theme.muted }]}>{t.appointmentTimeLabel || 'Hora de la cita'}</Text>
                    <TouchableOpacity
                        style={[styles.timeRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Ionicons name="time-outline" size={20} color={theme.brand} />
                        <Text style={[styles.timeText, { color: theme.text }]}>{formatTime(selectedTime)}</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color={theme.muted} />
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker
                            value={selectedTime}
                            mode="time"
                            is24Hour={false}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onTimeChange}
                        />
                    )}
                </View>

                {/* ── Guardar ── */}
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: loading ? theme.muted : theme.brand }]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
                            <Text style={styles.saveBtnText}>{t.scheduleAppointmentCta || 'Programar cita'}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: { paddingBottom: 48 },
    heroCard: { marginHorizontal: 16, borderRadius: 20, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28, marginBottom: 16, overflow: 'hidden' },
    heroGlowTop: { position: 'absolute', right: -28, top: -38, width: 130, height: 130, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
    heroGlowBottom: { position: 'absolute', left: -34, bottom: -40, width: 120, height: 120, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.08)' },
    heroKicker: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2, marginBottom: 4 },
    heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
    heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
    label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, marginBottom: 8 },
    input: { borderWidth: 1, borderRadius: 12, height: 48, paddingHorizontal: 14, fontSize: 15 },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 12, height: 48, paddingHorizontal: 14 },
    dropdownText: { fontSize: 15 },
    dropdownList: { marginTop: 8, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
    dropdownItem: { paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: 1 },
    dropdownItemText: { fontSize: 15 },
    dropdownFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 13, borderTopWidth: 1 },
    dropdownFooterText: { fontSize: 14, fontWeight: '600' },
    dropdownEmpty: { padding: 20, alignItems: 'center', gap: 12 },
    dropdownEmptyText: { fontSize: 13 },
    addVetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 20 },
    addVetBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    selectedDatePill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
    selectedDateText: { fontSize: 13, fontWeight: '600' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
    timeText: { flex: 1, fontSize: 16, fontWeight: '600' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, marginBottom: 14, paddingVertical: 16, borderRadius: 14 },
    saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});