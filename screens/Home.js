import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { colors: contextColors } = useApp();
    const colors = contextColors || {};

    const [upcomingVacunas, setUpcomingVacunas] = useState([]);
    const [upcomingCitas, setUpcomingCitas] = useState([]);
    const [appliedVacunas, setAppliedVacunas] = useState([]);

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short' };
        const date = new Date(dateString);
        return isNaN(date) ? dateString : date.toLocaleDateString('es-ES', options);
    };

    const isPastDate = (dateString) => {
        try {
            const [year, month, day] = dateString.split('-').map(Number);
            const targetDate = new Date(year, month - 1, day);
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return targetDate < startOfToday;
        } catch (error) {
            console.error('Error en isPastDate:', error);
            return false;
        }
    };

    const loadCitas = async () => {
        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const allCitas = citasRaw ? JSON.parse(citasRaw) : [];

            const proxVacunas = [];
            const proxCitas = [];
            const pasadasVacunas = [];

            allCitas.forEach((cita) => {
                const esPasada = isPastDate(cita.fecha);
                const esVacuna = cita.tipo === 'Vacuna' || cita.veterinaria === 'Vacuna Registrada';
                const esCita = cita.tipo === 'Cita';

                if (esPasada) {
                    if (esVacuna) pasadasVacunas.push(cita);
                } else {
                    if (esVacuna) proxVacunas.push(cita);
                    else if (esCita) proxCitas.push(cita);
                }
            });

            proxVacunas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            proxCitas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            pasadasVacunas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            setUpcomingVacunas(proxVacunas);
            setUpcomingCitas(proxCitas);
            setAppliedVacunas(pasadasVacunas);
        } catch (error) {
            console.error('Error al cargar citas:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCitas();
        }, [])
    );

    const upcomingEvents = useMemo(() => {
        const vacunas = upcomingVacunas.map((cita) => ({ ...cita, category: 'Vacuna' }));
        const citas = upcomingCitas.map((cita) => ({ ...cita, category: 'Cita' }));
        return [...vacunas, ...citas]
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 4);
    }, [upcomingVacunas, upcomingCitas]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos dias';
        if (hour < 19) return 'Buenas tardes';
        return 'Buenas noches';
    }, []);

    const brand = colors?.primaryDark || '#2F6E4F';
    const brandSoft = colors?.primary || '#43A047';
    const accent = colors?.accent || '#FF7F5A';
    const pageBackground = colors?.backgroundLight || '#F6F8F4';
    const cardBackground = colors?.background || '#FFFFFF';
    const border = colors?.border || '#E4E9E5';
    const textMain = colors?.text || '#22352D';
    const textMuted = colors?.textMuted || '#5D6E64';

    return (
        <ScreenWrapper>
            <ScrollView
                style={[styles.scrollView, { backgroundColor: pageBackground }]}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.heroCard, { backgroundColor: brand }]}>
                    <View style={styles.heroGlowTop} />
                    <View style={styles.heroGlowBottom} />
                    <Text style={styles.heroKicker}>{greeting}</Text>
                    <Text style={styles.heroTitle}>Todo el cuidado de tus mascotas, hoy.</Text>
                    <Text style={styles.heroSubtitle}>Mantiene vacunas, citas y recordatorios en orden sin esfuerzo.</Text>

                    <View style={styles.heroPillRow}>
                        <View style={[styles.heroPill, { backgroundColor: '#3B7C5E' }]}>
                            <Ionicons name="pulse-outline" size={14} color="#FFFFFF" />
                            <Text style={styles.heroPillText}>{upcomingEvents.length} pendientes próximos</Text>
                        </View>
                    </View>

                    <View style={styles.heroActionsRow}>
                        <TouchableOpacity
                            style={[styles.heroButton, { backgroundColor: accent }]}
                            onPress={() => navigation.navigate('ProgramarCita')}
                            activeOpacity={0.9}
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.heroButtonText}>Programar cita</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.heroGhostButton}
                            onPress={() => navigation.navigate('Mascotas')}
                            activeOpacity={0.9}
                        >
                            <Ionicons name="paw-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.heroGhostText}>Ver mascotas</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: cardBackground, borderColor: border }]}>
                        <Text style={[styles.metricLabel, { color: textMuted }]}>Vacunas próximas</Text>
                        <Text style={[styles.metricValue, { color: textMain }]}>{upcomingVacunas.length}</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: cardBackground, borderColor: border }]}>
                        <Text style={[styles.metricLabel, { color: textMuted }]}>Citas próximas</Text>
                        <Text style={[styles.metricValue, { color: textMain }]}>{upcomingCitas.length}</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: cardBackground, borderColor: border }]}>
                        <Text style={[styles.metricLabel, { color: textMuted }]}>Aplicadas</Text>
                        <Text style={[styles.metricValue, { color: textMain }]}>{appliedVacunas.length}</Text>
                    </View>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: cardBackground, borderColor: border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textMain }]}>Lo próximo</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
                            <Text style={[styles.linkText, { color: brandSoft }]}>Ver calendario</Text>
                        </TouchableOpacity>
                    </View>

                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event, index) => {
                            const isVaccine = event.category === 'Vacuna';
                            return (
                                <View
                                    key={`${event.fecha}-${event.veterinaria}-${index}`}
                                    style={[
                                        styles.eventRow,
                                        index === upcomingEvents.length - 1 && styles.eventRowLast,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.eventIconWrap,
                                            { backgroundColor: isVaccine ? '#E7F5FF' : '#EAF8EB' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={isVaccine ? 'medkit-outline' : 'calendar-outline'}
                                            size={18}
                                            color={isVaccine ? '#1E78C8' : brandSoft}
                                        />
                                    </View>
                                    <View style={styles.eventContent}>
                                        <Text style={[styles.eventTitle, { color: textMain }]}>
                                            {isVaccine ? 'Vacuna pendiente' : 'Cita pendiente'}
                                        </Text>
                                        <Text style={[styles.eventMeta, { color: textMuted }]} numberOfLines={1}>
                                            {event.usuario || 'Mascota'} - {event.veterinaria || 'Veterinaria'}
                                        </Text>
                                    </View>
                                    <Text style={[styles.eventDate, { color: textMuted }]}>{formatDate(event.fecha)}</Text>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyStateWrap}>
                            <Ionicons name="sparkles-outline" size={20} color={accent} />
                            <Text style={[styles.emptyStateText, { color: textMuted }]}>Aún no hay eventos. Programa la primera cita en 1 minuto.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.quickGrid}>
                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: cardBackground, borderColor: border }]}
                        onPress={() => navigation.navigate('RegistroMascota')}
                        activeOpacity={0.9}
                    >
                        <MaterialCommunityIcons name="paw" size={20} color={brandSoft} />
                        <Text style={[styles.quickTitle, { color: textMain }]}>Registrar mascota</Text>
                        <Text style={[styles.quickSubtitle, { color: textMuted }]}>Alta rápida en segundos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: cardBackground, borderColor: border }]}
                        onPress={() => navigation.navigate('Calendario')}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="calendar-clear-outline" size={20} color={brandSoft} />
                        <Text style={[styles.quickTitle, { color: textMain }]}>Calendario</Text>
                        <Text style={[styles.quickSubtitle, { color: textMuted }]}>Agenda completa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: cardBackground, borderColor: border }]}
                        onPress={() => navigation.navigate('Emergencias')}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="alert-circle-outline" size={20} color={accent} />
                        <Text style={[styles.quickTitle, { color: textMain }]}>Emergencias</Text>
                        <Text style={[styles.quickSubtitle, { color: textMuted }]}>Atención inmediata</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: cardBackground, borderColor: border }]}
                        onPress={() => navigation.navigate('Mapas')}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="map-outline" size={20} color={brandSoft} />
                        <Text style={[styles.quickTitle, { color: textMain }]}>Mapa vet</Text>
                        <Text style={[styles.quickSubtitle, { color: textMuted }]}>Encuentra opciones</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    heroCard: {
        borderRadius: 20,
        padding: 18,
        overflow: 'hidden',
    },
    heroGlowTop: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 999,
        right: -36,
        top: -42,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroGlowBottom: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 999,
        left: -34,
        bottom: -38,
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    heroKicker: {
        color: '#CDE2D6',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    heroTitle: {
        marginTop: 6,
        color: '#FFFFFF',
        fontSize: 24,
        lineHeight: 30,
        fontWeight: '800',
    },
    heroSubtitle: {
        marginTop: 8,
        color: '#E3EFE8',
        fontSize: 14,
        lineHeight: 20,
    },
    heroPillRow: {
        marginTop: 14,
    },
    heroPill: {
        alignSelf: 'flex-start',
        borderRadius: 999,
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
    heroActionsRow: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    heroButton: {
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
    },
    heroGhostButton: {
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    heroButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    heroGhostText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    metricCard: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
        minHeight: 78,
        justifyContent: 'space-between',
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16,
        minHeight: 32,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 30,
        includeFontPadding: false,
        fontVariant: ['tabular-nums'],
    },
    sectionCard: {
        marginTop: 14,
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    linkText: {
        fontSize: 13,
        fontWeight: '700',
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    eventRowLast: {
        borderBottomWidth: 0,
    },
    eventIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    eventContent: {
        flex: 1,
        marginRight: 8,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    eventMeta: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: '500',
    },
    eventDate: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyStateWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
    },
    emptyStateText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    quickGrid: {
        marginTop: 14,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickAction: {
        width: '48.5%',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 14,
        marginBottom: 10,
    },
    quickTitle: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '700',
    },
    quickSubtitle: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '500',
    },
});
