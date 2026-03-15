import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';
import NotificationService from './Notificaciones';

const formatTimeDisplay = (hora) => {
    if (!hora) return null;
    const [h, m] = hora.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    const formattedM = m < 10 ? `0${m}` : m;
    return `${formattedH}:${formattedM} ${ampm}`;
};

export default function Calendario() {
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
        danger: colors?.danger || '#E53935',
        success: colors?.success || '#2E7D32',
    }), [colors]);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [allCitas, setAllCitas] = useState([]);
    const [markedDatesData, setMarkedDatesData] = useState({});

    const FIXED_CAMPANAS = [
        { fecha: '2025-11-20', tipo: 'campaña', nombre: 'Campaña de Desparasitación' },
        { fecha: '2025-12-15', tipo: 'campaña', nombre: 'Campaña de Vacunación Anual' },
    ];

    const deleteCita = async (citaToDelete) => {
        Alert.alert(
            t.confirmDeletion || 'Confirmar eliminacion',
            `${t.deleteAppointmentQuestion || 'Eliminar la cita con'} ${citaToDelete.veterinaria}?`,
            [
                { text: t.cancel || 'Cancelar', style: 'cancel' },
                {
                    text: t.delete || 'Eliminar', style: 'destructive',
                    onPress: async () => {
                        try {
                            const raw = await AsyncStorage.getItem('@citas');
                            const citas = raw ? JSON.parse(raw) : [];
                            const updated = citas.filter(c =>
                                citaToDelete.id != null && c.id != null
                                    ? c.id !== citaToDelete.id
                                    : c.fecha !== citaToDelete.fecha ||
                                    c.usuario !== citaToDelete.usuario ||
                                    c.veterinaria !== citaToDelete.veterinaria ||
                                    c.tipo !== 'Cita'
                            );
                            await AsyncStorage.setItem('@citas', JSON.stringify(updated));
                            if (citaToDelete.id) {
                                await NotificationService.cancelAppointmentNotification(citaToDelete.id);
                            }
                            await loadCalendarData();
                        } catch {
                            Alert.alert(t.error || 'Error', t.deleteAppointmentError || 'No se pudo eliminar la cita.');
                        }
                    },
                },
            ]
        );
    };

    const deleteVacuna = async (vacunaToDelete) => {
        Alert.alert(
            t.confirmDeletion || 'Confirmar eliminacion',
            t.deleteVaccineQuestion || 'Eliminar este registro de vacuna?',
            [
                { text: t.cancel || 'Cancelar', style: 'cancel' },
                {
                    text: t.delete || 'Eliminar', style: 'destructive',
                    onPress: async () => {
                        try {
                            const raw = await AsyncStorage.getItem('@citas');
                            const citas = raw ? JSON.parse(raw) : [];
                            const updated = citas.filter(c =>
                                vacunaToDelete.id != null && c.id != null
                                    ? c.id !== vacunaToDelete.id
                                    : !(c.fecha === vacunaToDelete.fecha &&
                                        c.usuario === vacunaToDelete.usuario &&
                                        c.veterinaria === vacunaToDelete.veterinaria &&
                                        (c.tipo === 'Vacuna' || c.veterinaria === 'Vacuna Registrada'))
                            );
                            await AsyncStorage.setItem('@citas', JSON.stringify(updated));
                            await loadCalendarData();
                        } catch {
                            Alert.alert(t.error || 'Error', t.deleteVaccineError || 'No se pudo eliminar la vacuna.');
                        }
                    },
                },
            ]
        );
    };

    const loadCalendarData = async () => {
        try {
            const newMarked = {};
            const allFetched = [];

            FIXED_CAMPANAS.forEach(c => {
                if (!newMarked[c.fecha]) newMarked[c.fecha] = { dots: [] };
                newMarked[c.fecha].dots.push({ key: `campana-${c.fecha}`, color: theme.danger, selectedDotColor: '#FFF' });
                allFetched.push(c);
            });

            const raw = await AsyncStorage.getItem('@citas');
            const citas = raw ? JSON.parse(raw) : [];

            citas.forEach(cita => {
                const date = cita.fecha;
                if (!date) return;
                if (!newMarked[date]) newMarked[date] = { dots: [] };

                const esCita = cita.tipo === 'Cita';
                const esVacuna = cita.tipo === 'Vacuna' || cita.veterinaria === 'Vacuna Registrada';

                if (esCita) {
                    if (!newMarked[date].dots.find(d => d.color === theme.brandSoft)) {
                        newMarked[date].dots.push({ key: `cita-${date}`, color: theme.brandSoft, selectedDotColor: '#FFF' });
                    }
                    allFetched.push({ ...cita, tipo: 'cita' });
                } else if (esVacuna) {
                    if (!newMarked[date].dots.find(d => d.color === theme.success)) {
                        newMarked[date].dots.push({ key: `vacuna-${date}`, color: theme.success, selectedDotColor: '#FFF' });
                    }
                    allFetched.push({ ...cita, tipo: 'vacuna' });
                }
            });

            setMarkedDatesData(newMarked);
            setAllCitas(allFetched);
        } catch { /* ignore */ }
    };

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        setSelectedDayEvents(allCitas.filter(item => item.fecha === day.dateString));
    };

    const getDisplayDates = () => {
        const combined = { ...markedDatesData };
        if (selectedDate) {
            combined[selectedDate] = {
                ...(combined[selectedDate] || { dots: [] }),
                selected: true,
                selectedColor: theme.brand,
            };
        }
        return combined;
    };

    useFocusEffect(useCallback(() => {
        loadCalendarData();
        setSelectedDate('');
        setSelectedDayEvents([]);
    }, []));

    const upcomingCount = allCitas.filter(c => c.tipo === 'cita' && c.fecha >= new Date().toISOString().slice(0, 10)).length;

    return (
        <ScreenWrapper>
            <ScrollView
                style={{ backgroundColor: theme.bg }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero ── */}
                <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                    <View style={styles.heroGlowTop} />
                    <View style={styles.heroGlowBottom} />
                    <View style={styles.heroTopRow}>
                        <View style={styles.heroTopInfo}>
                            <Text style={styles.heroKicker}>{t.calendarKicker || 'CALENDARIO'}</Text>
                            <Text style={styles.heroTitle} numberOfLines={2}>{t.calendarHeroTitle || 'Tus citas y eventos'}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.heroCtaBtn, { backgroundColor: theme.accent }]}
                            onPress={() => navigation.navigate('ProgramarCita')}
                        >
                            <Ionicons name="add" size={18} color="#FFF" />
                            <Text style={styles.heroCtaText} numberOfLines={1}>{t.newAppointment || 'Nueva cita'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroPillRow}>
                        <View style={styles.heroPill}>
                            <Ionicons name="calendar-outline" size={13} color="#FFF" />
                            <Text style={styles.heroPillText}>{upcomingCount} {t.upcomingShort || 'proximas'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.heroPill}
                            onPress={() => navigation.navigate('ConfirmacionVacuna')}
                        >
                            <FontAwesome5 name="syringe" size={11} color="#FFF" />
                            <Text style={styles.heroPillText} numberOfLines={1}>{t.registerVaccine || 'Registrar vacuna'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Calendario ── */}
                <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Calendar
                        onDayPress={handleDayPress}
                        markingType="multi-dot"
                        markedDates={getDisplayDates()}
                        theme={{
                            backgroundColor: theme.card,
                            calendarBackground: theme.card,
                            textSectionTitleColor: theme.muted,
                            dayTextColor: theme.text,
                            todayTextColor: theme.accent,
                            arrowColor: theme.brand,
                            textDayFontWeight: '500',
                            selectedDayBackgroundColor: theme.brand,
                            selectedDayTextColor: '#FFFFFF',
                            monthTextColor: theme.text,
                            textDisabledColor: theme.border,
                        }}
                    />
                </View>

                {/* ── Leyenda ── */}
                <View style={[styles.legendCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: theme.brandSoft }]} />
                        <Text style={[styles.legendText, { color: theme.text }]}>{t.scheduledAppointmentsLegend || 'Citas programadas'}</Text>
                        <View style={[styles.legendDot, { backgroundColor: theme.success, marginLeft: 16 }]} />
                        <Text style={[styles.legendText, { color: theme.text }]}>{t.appliedVaccinesLegend || 'Vacunas aplicadas'}</Text>
                        <View style={[styles.legendDot, { backgroundColor: theme.danger, marginLeft: 16 }]} />
                        <Text style={[styles.legendText, { color: theme.text }]}>{t.campaignsLegend || 'Campanas'}</Text>
                    </View>
                </View>

                {/* ── Eventos del día ── */}
                {selectedDate ? (
                    <View style={[styles.eventsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.eventsTitle, { color: theme.text }]}>
                            {selectedDate}
                        </Text>

                        {selectedDayEvents.length === 0 ? (
                            <Text style={[styles.emptyEvents, { color: theme.muted }]}>
                                {t.noEventsForDay || 'Sin eventos para este dia.'}
                            </Text>
                        ) : (
                            selectedDayEvents.map((event, i) => {
                                if (event.tipo === 'cita') {
                                    return (
                                        <View
                                            key={`cita-${i}`}
                                            style={[styles.eventRow, { borderColor: theme.border }]}
                                        >
                                            <View style={[styles.eventDot, { backgroundColor: theme.brandSoft }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.eventLabel, { color: theme.brandSoft }]}>{t.scheduledAppointmentLabel || 'Cita programada'}</Text>
                                                <Text style={[styles.eventDetail, { color: theme.text }]}>{event.veterinaria}</Text>
                                                {event.hora ? (
                                                    <Text style={[styles.eventMeta, { color: theme.muted }]}>{formatTimeDisplay(event.hora)}</Text>
                                                ) : null}
                                            </View>
                                            <View style={styles.eventActions}>
                                                <TouchableOpacity
                                                    style={[styles.iconBtn, { backgroundColor: `${theme.brandSoft}18` }]}
                                                    onPress={() => navigation.navigate('EditarCita', { cita: event })}
                                                >
                                                    <MaterialIcons name="edit" size={16} color={theme.brandSoft} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.iconBtn, { backgroundColor: `${theme.danger}18` }]}
                                                    onPress={() => deleteCita(event)}
                                                >
                                                    <MaterialIcons name="delete" size={16} color={theme.danger} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                } else if (event.tipo === 'campaña') {
                                    return (
                                        <View key={`camp-${i}`} style={[styles.eventRow, { borderColor: theme.border }]}>
                                            <View style={[styles.eventDot, { backgroundColor: theme.danger }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.eventLabel, { color: theme.danger }]}>{t.campaignLabel || 'Campana'}</Text>
                                                <Text style={[styles.eventDetail, { color: theme.text }]}>{event.nombre}</Text>
                                            </View>
                                            <MaterialIcons name="local-hospital" size={20} color={theme.danger} />
                                        </View>
                                    );
                                } else if (event.tipo === 'vacuna') {
                                    return (
                                        <View key={`vac-${i}`} style={[styles.eventRow, { borderColor: theme.border }]}>
                                            <View style={[styles.eventDot, { backgroundColor: theme.success }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.eventLabel, { color: theme.success }]}>{t.vaccineAppliedLabel || 'Vacuna aplicada'}</Text>
                                                <Text style={[styles.eventDetail, { color: theme.text }]}>{event.veterinaria}</Text>
                                            </View>
                                            <View style={styles.eventActions}>
                                                <TouchableOpacity
                                                    style={[styles.iconBtn, { backgroundColor: `${theme.success}18` }]}
                                                    onPress={() => navigation.navigate('EditarVacuna', { vacuna: event })}
                                                >
                                                    <MaterialIcons name="edit" size={16} color={theme.success} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.iconBtn, { backgroundColor: `${theme.danger}18` }]}
                                                    onPress={() => deleteVacuna(event)}
                                                >
                                                    <MaterialIcons name="delete" size={16} color={theme.danger} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                }
                                return null;
                            })
                        )}
                    </View>
                ) : null}
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 48,
    },
    /* Hero */
    heroCard: {
        marginHorizontal: 16,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 28,
        marginBottom: 16,
        overflow: 'hidden',
    },
    heroGlowTop: {
        position: 'absolute',
        right: -28,
        top: -36,
        width: 130,
        height: 130,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroGlowBottom: {
        position: 'absolute',
        left: -32,
        bottom: -40,
        width: 120,
        height: 120,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    heroTopInfo: {
        flex: 1,
        minWidth: 0,
        paddingRight: 8,
    },
    heroKicker: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    heroCtaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        gap: 5,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    heroCtaText: {
        flexShrink: 1,
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    heroPillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    heroPill: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '100%',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    heroPillText: {
        flexShrink: 1,
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    /* Calendar section */
    calendarCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 18,
        borderWidth: 1,
        overflow: 'hidden',
    },
    /* Legend */
    legendCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 14,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    legendDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
    },
    /* Events */
    eventsCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    eventsTitle: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 12,
    },
    emptyEvents: {
        textAlign: 'center',
        fontSize: 14,
        fontStyle: 'italic',
        paddingVertical: 12,
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    eventDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    eventLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
        marginBottom: 2,
    },
    eventDetail: {
        fontSize: 14,
        fontWeight: '500',
    },
    eventMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    eventActions: {
        flexDirection: 'row',
        gap: 6,
    },
    iconBtn: {
        padding: 6,
        borderRadius: 10,
    },
});
