import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';
import { supabase } from '../lib/Supabase';

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
            `${t.deleteAppointmentQuestion || 'Eliminar la cita con'} ${citaToDelete.veterinaria_nombre}?`,
            [
                { text: t.cancel || 'Cancelar', style: 'cancel' },
                {
                    text: t.delete || 'Eliminar', style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('citas')
                                .delete()
                                .eq('id', citaToDelete.id);

                            if (error) {
                                Alert.alert(t.error || 'Error', t.deleteAppointmentError || 'No se pudo eliminar la cita.');
                                return;
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
                            const { error } = await supabase
                                .from('vacunas')
                                .delete()
                                .eq('id', vacunaToDelete.id);

                            if (error) {
                                Alert.alert(t.error || 'Error', t.deleteVaccineError || 'No se pudo eliminar la vacuna.');
                                return;
                            }
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

            // Campañas fijas
            FIXED_CAMPANAS.forEach(c => {
                if (!newMarked[c.fecha]) newMarked[c.fecha] = { dots: [] };
                newMarked[c.fecha].dots.push({ key: `campana-${c.fecha}`, color: theme.danger, selectedDotColor: '#FFF' });
                allFetched.push(c);
            });

            // Citas desde Supabase
            const { data: citas } = await supabase
                .from('citas')
                .select('*, veterinarias(nombre)')
                .eq('tipo', 'Cita')
                .order('fecha', { ascending: true });

            (citas || []).forEach(cita => {
                const date = cita.fecha;
                if (!date) return;
                if (!newMarked[date]) newMarked[date] = { dots: [] };
                if (!newMarked[date].dots.find(d => d.color === theme.brandSoft)) {
                    newMarked[date].dots.push({ key: `cita-${date}`, color: theme.brandSoft, selectedDotColor: '#FFF' });
                }
                allFetched.push({
                    ...cita,
                    tipo: 'cita',
                    veterinaria_nombre: cita.veterinarias?.nombre || cita.usuario || '',
                });
            });

            // Vacunas aplicadas (hasta hoy)
            const { data: vacunasAplicadas } = await supabase
                .from('vacunas')
                .select('*, mascotas(nombre), veterinarias(nombre)')
                .lte('fecha_aplicacion', today)
                .order('fecha_aplicacion', { ascending: true });

            (vacunasAplicadas || []).forEach(vacuna => {
                const date = vacuna.fecha_aplicacion;
                if (!date) return;
                if (!newMarked[date]) newMarked[date] = { dots: [] };
                if (!newMarked[date].dots.find(d => d.color === theme.success)) {
                    newMarked[date].dots.push({ key: `vacuna-${date}`, color: theme.success, selectedDotColor: '#FFF' });
                }
                allFetched.push({
                    ...vacuna,
                    fecha: vacuna.fecha_aplicacion,
                    tipo: 'vacuna',
                    veterinaria_nombre: vacuna.veterinarias?.nombre || '',
                    mascota_nombre: vacuna.mascotas?.nombre || '',
                });
            });

            // Vacunas pendientes (fechas futuras)
            const { data: vacunasPendientes } = await supabase
                .from('vacunas')
                .select('*, mascotas(nombre), veterinarias(nombre)')
                .gt('fecha_aplicacion', today)
                .order('fecha_aplicacion', { ascending: true });

            (vacunasPendientes || []).forEach(vacuna => {
                const date = vacuna.fecha_aplicacion;
                if (!date) return;
                if (!newMarked[date]) newMarked[date] = { dots: [] };
                if (!newMarked[date].dots.find(d => d.color === theme.warning)) {
                    newMarked[date].dots.push({ key: `vacuna-pend-${date}`, color: theme.warning || '#F59E0B', selectedDotColor: '#FFF' });
                }
                allFetched.push({
                    ...vacuna,
                    fecha: vacuna.fecha_aplicacion,
                    tipo: 'vacuna_pendiente',
                    veterinaria_nombre: vacuna.veterinarias?.nombre || '',
                    mascota_nombre: vacuna.mascotas?.nombre || '',
                });
            });

            setMarkedDatesData(newMarked);
            setAllCitas(allFetched);
        } catch (err) {
            console.error('loadCalendarData error:', err);
        }
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
                        <Text style={[styles.legendText, { color: theme.text }]}>{t.scheduledAppointmentsLegend || 'Citas'}</Text>
                        <View style={[styles.legendDot, { backgroundColor: theme.success, marginLeft: 12 }]} />
                        <Text style={[styles.legendText, { color: theme.text }]}>{t.appliedVaccinesLegend || 'Vacunas aplicadas'}</Text>
                        <View style={[styles.legendDot, { backgroundColor: theme.warning || '#F59E0B', marginLeft: 12 }]} />
                        <Text style={[styles.legendText, { color: theme.text }]}>{'Vacunas pendientes'}</Text>
                        <View style={[styles.legendDot, { backgroundColor: theme.danger, marginLeft: 12 }]} />
                        <Text style={[styles.legendText, { color: theme.text }]}>{t.campaignsLegend || 'Campanas'}</Text>
                    </View>
                </View>


                {/* ── Todas las citas ── */}
                {allCitas.filter(e => e.tipo === 'cita').length > 0 ? (
                    <View style={[styles.eventsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconWrap, { backgroundColor: `${theme.brandSoft}18` }]}>
                                <Ionicons name="calendar-outline" size={16} color={theme.brandSoft} />
                            </View>
                            <Text style={[styles.eventsTitle, { color: theme.text, marginBottom: 0 }]}>
                                {t.scheduledAppointmentsLegend || 'Citas programadas'}
                            </Text>
                            <View style={[styles.countPill, { backgroundColor: `${theme.brandSoft}18` }]}>
                                <Text style={[styles.countPillText, { color: theme.brandSoft }]}>
                                    {allCitas.filter(e => e.tipo === 'cita').length}
                                </Text>
                            </View>
                        </View>
                        {allCitas.filter(e => e.tipo === 'cita').map((event, i, arr) => (
                            <View
                                key={`all-cita-${event.id || i}`}
                                style={[
                                    styles.listRow,
                                    { borderColor: theme.border },
                                    i === arr.length - 1 && styles.listRowLast,
                                ]}
                            >
                                <View style={[styles.listDateBadge, { backgroundColor: `${theme.brandSoft}14` }]}>
                                    <Text style={[styles.listDateText, { color: theme.brandSoft }]}>
                                        {event.fecha ? event.fecha.slice(5).replace('-', '/') : '—'}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={1}>
                                        {event.veterinaria_nombre || t.vetFallback || 'Veterinaria'}
                                    </Text>
                                    {event.hora ? (
                                        <Text style={[styles.listMeta, { color: theme.muted }]}>
                                            {formatTimeDisplay(event.hora)}
                                        </Text>
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
                        ))}
                    </View>
                ) : null}

                {/* ── Todas las vacunas ── */}
                {allCitas.filter(e => e.tipo === 'vacuna' || e.tipo === 'vacuna_pendiente').length > 0 ? (
                    <View style={[styles.eventsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIconWrap, { backgroundColor: `${theme.success}18` }]}>
                                <FontAwesome5 name="syringe" size={14} color={theme.success} />
                            </View>
                            <Text style={[styles.eventsTitle, { color: theme.text, marginBottom: 0 }]}>
                                {t.appliedVaccinesLegend || 'Vacunas registradas'}
                            </Text>
                            <View style={[styles.countPill, { backgroundColor: `${theme.success}18` }]}>
                                <Text style={[styles.countPillText, { color: theme.success }]}>
                                    {allCitas.filter(e => e.tipo === 'vacuna' || e.tipo === 'vacuna_pendiente').length}
                                </Text>
                            </View>
                        </View>
                        {allCitas.filter(e => e.tipo === 'vacuna' || e.tipo === 'vacuna_pendiente').map((event, i, arr) => {
                            const isPending = event.tipo === 'vacuna_pendiente';
                            const dotColor = isPending ? (theme.warning || '#F59E0B') : theme.success;
                            return (
                                <View
                                    key={`all-vac-${event.id || i}`}
                                    style={[
                                        styles.listRow,
                                        { borderColor: theme.border },
                                        i === arr.length - 1 && styles.listRowLast,
                                    ]}
                                >
                                    <View style={[styles.listDateBadge, { backgroundColor: `${dotColor}14` }]}>
                                        <Text style={[styles.listDateText, { color: dotColor }]}>
                                            {event.fecha ? event.fecha.slice(5).replace('-', '/') : '—'}
                                        </Text>
                                        {isPending ? (
                                            <Text style={[styles.listPendingTag, { color: dotColor }]}>{'pend.'}</Text>
                                        ) : null}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={1}>
                                            {event.nombre_vacuna || t.pendingVaccine || 'Vacuna'}
                                        </Text>
                                        <Text style={[styles.listMeta, { color: theme.muted }]} numberOfLines={1}>
                                            {event.mascota_nombre || t.petFallback || 'Mascota'}
                                            {event.veterinaria_nombre ? ` · ${event.veterinaria_nombre}` : ''}
                                        </Text>
                                    </View>
                                    <View style={styles.eventActions}>
                                        <TouchableOpacity
                                            style={[styles.iconBtn, { backgroundColor: `${dotColor}18` }]}
                                            onPress={() => navigation.navigate('EditarVacuna', { vacuna: event })}
                                        >
                                            <MaterialIcons name="edit" size={16} color={dotColor} />
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
                        })}
                    </View>
                ) : null}

                {/* ── Eventos del día ── */}
                {selectedDate ? (
                    <View style={[styles.eventsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.eventsTitle, { color: theme.text }]}>{selectedDate}</Text>

                        {selectedDayEvents.length === 0 ? (
                            <Text style={[styles.emptyEvents, { color: theme.muted }]}>
                                {t.noEventsForDay || 'Sin eventos para este dia.'}
                            </Text>
                        ) : (
                            selectedDayEvents.map((event, i) => {
                                if (event.tipo === 'cita') {
                                    return (
                                        <View key={`cita-${i}`} style={[styles.eventRow, { borderColor: theme.border }]}>
                                            <View style={[styles.eventDot, { backgroundColor: theme.brandSoft }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.eventLabel, { color: theme.brandSoft }]}>{t.scheduledAppointmentLabel || 'Cita programada'}</Text>
                                                <Text style={[styles.eventDetail, { color: theme.text }]}>{event.veterinaria_nombre}</Text>
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
                                                <Text style={[styles.eventDetail, { color: theme.text }]}>{event.nombre_vacuna || event.mascota_nombre}</Text>
                                                {event.veterinaria_nombre ? (
                                                    <Text style={[styles.eventMeta, { color: theme.muted }]}>{event.veterinaria_nombre}</Text>
                                                ) : null}
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
                                } else if (event.tipo === 'vacuna_pendiente') {
                                    return (
                                        <View key={`vacpend-${i}`} style={[styles.eventRow, { borderColor: theme.border }]}>
                                            <View style={[styles.eventDot, { backgroundColor: theme.warning || '#F59E0B' }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.eventLabel, { color: theme.warning || '#F59E0B' }]}>{'Vacuna pendiente'}</Text>
                                                <Text style={[styles.eventDetail, { color: theme.text }]}>{event.nombre_vacuna || event.mascota_nombre}</Text>
                                                {event.veterinaria_nombre ? (
                                                    <Text style={[styles.eventMeta, { color: theme.muted }]}>{event.veterinaria_nombre}</Text>
                                                ) : null}
                                            </View>
                                            <View style={styles.eventActions}>
                                                <TouchableOpacity
                                                    style={[styles.iconBtn, { backgroundColor: `${theme.warning || '#F59E0B'}18` }]}
                                                    onPress={() => navigation.navigate('EditarVacuna', { vacuna: event })}
                                                >
                                                    <MaterialIcons name="edit" size={16} color={theme.warning || '#F59E0B'} />
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
    scrollContent: { paddingBottom: 48 },
    heroCard: { marginHorizontal: 16, borderRadius: 20, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28, marginBottom: 16, overflow: 'hidden' },
    heroGlowTop: { position: 'absolute', right: -28, top: -36, width: 130, height: 130, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
    heroGlowBottom: { position: 'absolute', left: -32, bottom: -40, width: 120, height: 120, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.08)' },
    heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    heroTopInfo: { flex: 1, minWidth: 0, paddingRight: 8 },
    heroKicker: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2, marginBottom: 4 },
    heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
    heroCtaBtn: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 5, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
    heroCtaText: { flexShrink: 1, color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
    heroPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    heroPill: { flexDirection: 'row', alignItems: 'center', maxWidth: '100%', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
    heroPillText: { flexShrink: 1, color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    calendarCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    legendCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14 },
    legendRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
    legendDot: { width: 9, height: 9, borderRadius: 5 },
    legendText: { fontSize: 12 },
    eventsCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
    eventsTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
    emptyEvents: { textAlign: 'center', fontSize: 14, fontStyle: 'italic', paddingVertical: 12 },
    eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
    eventDot: { width: 10, height: 10, borderRadius: 5 },
    eventLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, marginBottom: 2 },
    eventDetail: { fontSize: 14, fontWeight: '500' },
    eventMeta: { fontSize: 12, marginTop: 2 },
    eventActions: { flexDirection: 'row', gap: 6 },
    iconBtn: { padding: 6, borderRadius: 10 },
    // Secciones de lista completa
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionIconWrap: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    countPill: { marginLeft: 'auto', minWidth: 24, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7 },
    countPillText: { fontSize: 12, fontWeight: '700' },
    listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
    listRowLast: { borderBottomWidth: 0 },
    listDateBadge: { minWidth: 42, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 5, alignItems: 'center' },
    listDateText: { fontSize: 12, fontWeight: '800' },
    listTitle: { fontSize: 14, fontWeight: '600' },
    listMeta: { fontSize: 12, marginTop: 2 },
    listPendingTag: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },
});