import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';
import { supabase } from '../lib/Supabase';

export default function HomeScreen() {
    const navigation = useNavigation();
    const {
        colors: contextColors,
        t,
        language,
        registerTutorialTarget,
        maybeStartTutorial,
        isTutorialVisible,
        tutorialStepIndex,
        tutorialSteps,
        tutorialTargets,
        tutorialViewport,
    } = useApp();

    const colors = contextColors || {};
    const scrollViewRef = useRef(null);
    const scrollOffsetRef = useRef(0);
    const registerPetRef = useRef(null);
    const calendarRef = useRef(null);
    const emergenciesRef = useRef(null);
    const vetMapRef = useRef(null);
    const searchRef = useRef(null);

    const [upcomingCitas, setUpcomingCitas] = useState([]);
    const [upcomingVacunas, setUpcomingVacunas] = useState([]);
    const [appliedVacunas, setAppliedVacunas] = useState([]);

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short' };
        const date = new Date(dateString);
        const locale = language === 'en' ? 'en-US' : 'es-ES';
        return isNaN(date) ? dateString : date.toLocaleDateString(locale, options);
    };

    const isPastDate = (dateString) => {
        try {
            const [year, month, day] = dateString.split('-').map(Number);
            const targetDate = new Date(year, month - 1, day);
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            return targetDate < startOfToday;
        } catch {
            return false;
        }
    };

    const loadCitas = async () => {
        try {
            const today = new Date().toISOString().slice(0, 10);

            // Citas próximas desde Supabase
            const { data: citasFuturas } = await supabase
                .from('citas')
                .select('*, veterinarias(nombre)')
                .eq('tipo', 'Cita')
                .gte('fecha', today)
                .order('fecha', { ascending: true })
                .limit(5);

            // Vacunas próximas (citas tipo vacuna si las hubiera)
            const { data: vacunasFuturas } = await supabase
                .from('vacunas')
                .select('*, mascotas(nombre), veterinarias(nombre)')
                .gte('fecha_aplicacion', today)
                .order('fecha_aplicacion', { ascending: true })
                .limit(5);

            // Vacunas aplicadas (pasadas)
            const { data: vacunasAplicadas } = await supabase
                .from('vacunas')
                .select('*, mascotas(nombre), veterinarias(nombre)')
                .lt('fecha_aplicacion', today)
                .order('fecha_aplicacion', { ascending: false })
                .limit(10);

            setUpcomingCitas((citasFuturas || []).map(c => ({
                ...c,
                fecha: c.fecha,
                veterinaria: c.veterinarias?.nombre || '',
                usuario: c.usuario || '',
                category: 'Cita',
            })));

            setUpcomingVacunas((vacunasFuturas || []).map(v => ({
                ...v,
                fecha: v.fecha_aplicacion,
                veterinaria: v.veterinarias?.nombre || '',
                usuario: v.mascotas?.nombre || '',
                nombre_vacuna: v.nombre_vacuna || '',
                category: 'Vacuna',
            })));

            setAppliedVacunas(vacunasAplicadas || []);
        } catch (error) {
            console.error('Error al cargar datos del home:', error);
        }
    };

    const measureTarget = useCallback((key, ref) => {
        setTimeout(() => {
            ref?.current?.measureInWindow((x, y, width, height) => {
                if (width > 0 && height > 0) {
                    registerTutorialTarget(key, { x, y, width, height });
                }
            });
        }, 0);
    }, [registerTutorialTarget]);

    const refreshTutorialTargets = useCallback(() => {
        measureTarget('home.search', searchRef);
        measureTarget('home.registerPet', registerPetRef);
        measureTarget('home.calendar', calendarRef);
        measureTarget('home.emergencies', emergenciesRef);
        measureTarget('home.vetMap', vetMapRef);
    }, [measureTarget]);

    useFocusEffect(
        useCallback(() => {
            loadCitas();
            setTimeout(() => {
                refreshTutorialTargets();
                maybeStartTutorial();
            }, 220);
        }, [maybeStartTutorial, refreshTutorialTargets])
    );

    useEffect(() => {
        if (!isTutorialVisible) return;
        const currentStep = tutorialSteps[tutorialStepIndex];
        const targetKey = currentStep?.targetKey;
        if (!targetKey?.startsWith('home.')) return;
        const target = tutorialTargets[targetKey];
        const viewportHeight = tutorialViewport?.height || 0;
        if (!target || viewportHeight <= 0) {
            const retryTimer = setTimeout(() => { refreshTutorialTargets(); }, 180);
            return () => clearTimeout(retryTimer);
        }
        const topSafeArea = 150;
        const bottomSafeArea = 210;
        const targetTop = target.y;
        const targetBottom = target.y + target.height;
        let nextScrollOffset = null;
        if (targetBottom > viewportHeight - bottomSafeArea) {
            nextScrollOffset = Math.max(0, scrollOffsetRef.current + (targetBottom - (viewportHeight - bottomSafeArea)));
        } else if (targetTop < topSafeArea) {
            nextScrollOffset = Math.max(0, scrollOffsetRef.current - (topSafeArea - targetTop));
        }
        if (nextScrollOffset == null) return;
        scrollViewRef.current?.scrollTo({ y: nextScrollOffset, animated: true });
        const measureTimer = setTimeout(() => { refreshTutorialTargets(); }, 420);
        return () => clearTimeout(measureTimer);
    }, [isTutorialVisible, refreshTutorialTargets, tutorialStepIndex, tutorialSteps, tutorialTargets, tutorialViewport]);

    const upcomingEvents = useMemo(() => {
        return [...upcomingVacunas, ...upcomingCitas]
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 4);
    }, [upcomingVacunas, upcomingCitas]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return t.morningGreeting || 'Buenos dias';
        if (hour < 19) return t.afternoonGreeting || 'Buenas tardes';
        return t.eveningGreeting || 'Buenas noches';
    }, [t]);

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
                ref={scrollViewRef}
                style={[styles.scrollView, { backgroundColor: pageBackground }]}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={(event) => { scrollOffsetRef.current = event.nativeEvent.contentOffset.y; }}
                onMomentumScrollEnd={refreshTutorialTargets}
                onScrollEndDrag={refreshTutorialTargets}
            >
                {/* ── Hero ── */}
                <View style={[styles.heroCard, { backgroundColor: brand }]}>
                    <View style={styles.heroGlowTop} />
                    <View style={styles.heroGlowBottom} />
                    <Text style={styles.heroKicker}>{greeting}</Text>
                    <Text style={styles.heroTitle}>{t.homeHeroTitle || 'Todo el cuidado de tus mascotas, hoy.'}</Text>
                    <Text style={styles.heroSubtitle}>{t.homeHeroSubtitle || 'Mantiene vacunas, citas y recordatorios en orden sin esfuerzo.'}</Text>
                    <View style={styles.heroPillRow}>
                        <View style={[styles.heroPill, { backgroundColor: '#3B7C5E' }]}>
                            <Ionicons name="pulse-outline" size={14} color="#FFFFFF" />
                            <Text style={styles.heroPillText}>{upcomingEvents.length} {t.pendingSoon || 'pendientes proximos'}</Text>
                        </View>
                    </View>
                    <View style={styles.heroActionsRow}>
                        <TouchableOpacity
                            style={[styles.heroButton, { backgroundColor: accent }]}
                            onPress={() => navigation.navigate('ProgramarCita')}
                            activeOpacity={0.9}
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.heroButtonText} numberOfLines={1}>{t.scheduleAppointmentCta || 'Programar cita'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.heroGhostButton}
                            onPress={() => navigation.navigate('Mascotas')}
                            activeOpacity={0.9}
                        >
                            <Ionicons name="paw-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.heroGhostText} numberOfLines={1}>{t.viewPetsCta || 'Ver mascotas'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Métricas ── */}
                <View style={styles.metricsRow}>
                    <View style={[styles.metricCard, { backgroundColor: cardBackground, borderColor: border }]}>
                        <Text style={[styles.metricLabel, { color: textMuted }]}>{t.upcomingVaccines || 'Vacunas proximas'}</Text>
                        <Text style={[styles.metricValue, { color: textMain }]}>{upcomingVacunas.length}</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: cardBackground, borderColor: border }]}>
                        <Text style={[styles.metricLabel, { color: textMuted }]}>{t.upcomingAppointments || 'Citas proximas'}</Text>
                        <Text style={[styles.metricValue, { color: textMain }]}>{upcomingCitas.length}</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: cardBackground, borderColor: border }]}>
                        <Text style={[styles.metricLabel, { color: textMuted }]}>{t.appliedCount || 'Aplicadas'}</Text>
                        <Text style={[styles.metricValue, { color: textMain }]}>{appliedVacunas.length}</Text>
                    </View>
                </View>

                {/* ── Buscador ── */}
                <TouchableOpacity
                    ref={searchRef}
                    style={[styles.searchCard, { backgroundColor: cardBackground, borderColor: border }]}
                    onPress={() => navigation.navigate('BuscadorGoogle')}
                    onLayout={() => measureTarget('home.search', searchRef)}
                    activeOpacity={0.9}
                >
                    <View style={[styles.searchIconWrap, { backgroundColor: '#EEF6F0' }]}>
                        <Ionicons name="search-outline" size={18} color={brandSoft} />
                    </View>
                    <View style={styles.searchTextWrap}>
                        <Text style={[styles.searchPlaceholder, { color: textMuted }]} numberOfLines={1}>
                            {t.homeSearchPlaceholder || 'Busca sintomas, cuidados o recomendaciones'}
                        </Text>
                        <Text style={[styles.searchHint, { color: brandSoft }]} numberOfLines={1}>
                            {t.homeSearchHint || 'Abrir buscador'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={textMuted} />
                </TouchableOpacity>

                {/* ── Lo próximo ── */}
                <View style={[styles.sectionCard, { backgroundColor: cardBackground, borderColor: border }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: textMain }]}>{t.upNext || 'Lo proximo'}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
                            <Text style={[styles.linkText, { color: brandSoft }]}>{t.viewCalendar || 'Ver calendario'}</Text>
                        </TouchableOpacity>
                    </View>
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event, index) => {
                            const isVaccine = event.category === 'Vacuna';
                            return (
                                <View
                                    key={`${event.fecha}-${index}`}
                                    style={[
                                        styles.eventRow,
                                        index === upcomingEvents.length - 1 && styles.eventRowLast,
                                    ]}
                                >
                                    <View style={[styles.eventIconWrap, { backgroundColor: isVaccine ? '#E7F5FF' : '#EAF8EB' }]}>
                                        <Ionicons
                                            name={isVaccine ? 'medkit-outline' : 'calendar-outline'}
                                            size={18}
                                            color={isVaccine ? '#1E78C8' : brandSoft}
                                        />
                                    </View>
                                    <View style={styles.eventContent}>
                                        <Text style={[styles.eventTitle, { color: textMain }]}>
                                            {isVaccine
                                                ? (event.nombre_vacuna || t.pendingVaccine || 'Vacuna pendiente')
                                                : (t.pendingAppointment || 'Cita pendiente')}
                                        </Text>
                                        <Text style={[styles.eventMeta, { color: textMuted }]} numberOfLines={1}>
                                            {event.usuario || t.petFallback || 'Mascota'} — {event.veterinaria || t.vetFallback || 'Veterinaria'}
                                        </Text>
                                    </View>
                                    <Text style={[styles.eventDate, { color: textMuted }]}>{formatDate(event.fecha)}</Text>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.emptyStateWrap}>
                            <Ionicons name="sparkles-outline" size={20} color={accent} />
                            <Text style={[styles.emptyStateText, { color: textMuted }]}>{t.noEventsYet || 'Aun no hay eventos. Programa la primera cita en 1 minuto.'}</Text>
                        </View>
                    )}
                </View>

                {/* ── Acciones rápidas ── */}
                <View style={styles.quickGrid}>
                    <TouchableOpacity
                        ref={registerPetRef}
                        style={[styles.quickAction, { backgroundColor: cardBackground, borderColor: border }]}
                        onPress={() => navigation.navigate('RegistroMascota')}
                        onLayout={() => measureTarget('home.registerPet', registerPetRef)}
                        activeOpacity={0.9}
                    >
                        <MaterialCommunityIcons name="paw" size={20} color={brandSoft} />
                        <Text style={[styles.quickTitle, { color: textMain }]}>{t.registerPet || 'Registrar mascota'}</Text>
                        <Text style={[styles.quickSubtitle, { color: textMuted }]}>{t.quickRegistration || 'Alta rapida en segundos'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        ref={calendarRef}
                        style={[styles.quickAction, { backgroundColor: cardBackground, borderColor: border }]}
                        onPress={() => navigation.navigate('Calendario')}
                        onLayout={() => measureTarget('home.calendar', calendarRef)}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="calendar-clear-outline" size={20} color={brandSoft} />
                        <Text style={[styles.quickTitle, { color: textMain }]}>{t.calendar || 'Calendario'}</Text>
                        <Text style={[styles.quickSubtitle, { color: textMuted }]}>{t.fullAgenda || 'Agenda completa'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        ref={emergenciesRef}
                        style={[styles.quickAction, { backgroundColor: cardBackground, borderColor: border }]}
                        onPress={() => navigation.navigate('Emergencias')}
                        onLayout={() => measureTarget('home.emergencies', emergenciesRef)}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="alert-circle-outline" size={20} color={accent} />
                        <Text style={[styles.quickTitle, { color: textMain }]}>{t.emergencies || 'Emergencias'}</Text>
                        <Text style={[styles.quickSubtitle, { color: textMuted }]}>{t.immediateAttention || 'Atencion inmediata'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        ref={vetMapRef}
                        style={[styles.quickAction, { backgroundColor: cardBackground, borderColor: border }]}
                        onPress={() => navigation.navigate('Mapas')}
                        onLayout={() => measureTarget('home.vetMap', vetMapRef)}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="map-outline" size={20} color={brandSoft} />
                        <Text style={[styles.quickTitle, { color: textMain }]}>{t.vetMap || 'Mapa vet'}</Text>
                        <Text style={[styles.quickSubtitle, { color: textMuted }]}>{t.findOptions || 'Encuentra opciones'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollView: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },
    heroCard: { borderRadius: 20, padding: 18, overflow: 'hidden' },
    heroGlowTop: { position: 'absolute', width: 140, height: 140, borderRadius: 999, right: -36, top: -42, backgroundColor: 'rgba(255,255,255,0.1)' },
    heroGlowBottom: { position: 'absolute', width: 110, height: 110, borderRadius: 999, left: -34, bottom: -38, backgroundColor: 'rgba(0,0,0,0.08)' },
    heroKicker: { color: '#CDE2D6', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    heroTitle: { marginTop: 6, color: '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '800' },
    heroSubtitle: { marginTop: 8, color: '#E3EFE8', fontSize: 14, lineHeight: 20 },
    heroPillRow: { marginTop: 14 },
    heroPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
    heroPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    heroActionsRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', minWidth: 0, gap: 8 },
    heroButton: { flex: 1, minWidth: 0, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    heroGhostButton: { flex: 1, minWidth: 0, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.08)' },
    heroButtonText: { flexShrink: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    heroGhostText: { flexShrink: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    metricsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
    metricCard: { flex: 1, borderRadius: 14, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12, minHeight: 78, justifyContent: 'space-between' },
    metricLabel: { fontSize: 12, fontWeight: '600', lineHeight: 16, minHeight: 32 },
    metricValue: { fontSize: 24, fontWeight: '800', lineHeight: 30, includeFontPadding: false },
    searchCard: { marginTop: 14, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
    searchIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    searchTextWrap: { flex: 1 },
    searchPlaceholder: { fontSize: 13, fontWeight: '600' },
    searchHint: { marginTop: 2, fontSize: 12, fontWeight: '700' },
    sectionCard: { marginTop: 14, borderRadius: 16, borderWidth: 1, padding: 14 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '800' },
    linkText: { fontSize: 13, fontWeight: '700' },
    eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
    eventRowLast: { borderBottomWidth: 0 },
    eventIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    eventContent: { flex: 1, marginRight: 8 },
    eventTitle: { fontSize: 14, fontWeight: '700' },
    eventMeta: { marginTop: 2, fontSize: 12, fontWeight: '500' },
    eventDate: { fontSize: 12, fontWeight: '700' },
    emptyStateWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
    emptyStateText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
    quickGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    quickAction: { width: '48.5%', borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 10 },
    quickTitle: { marginTop: 10, fontSize: 14, fontWeight: '700' },
    quickSubtitle: { marginTop: 4, fontSize: 12, fontWeight: '500' },
});