import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper, Card, FloatingButton } from '../components';
import { spacing, typography, borderRadius, lightTheme } from '../constants';
import NotificationService from './Notificaciones';

// Función para formatear hora (HH:MM a formato 12h)
const formatTimeDisplay = (hora) => {
    if (!hora) return null;
    const [h, m] = hora.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    const formattedM = m < 10 ? `0${m}` : m;
    return `${formattedH}:${formattedM} ${ampm}`;
};

// Componente para mostrar los detalles de la cita
const CitaDetailItem = ({ cita, onEdit, onDelete, colors }) => (
    <View style={[styles.detailCard, { backgroundColor: colors.card, borderLeftColor: colors.secondary }]}>
        <Ionicons name="paw" size={20} color={colors.secondary} style={{ marginRight: spacing.sm }} />
        <View style={{ flex: 1 }}>
            <Text style={[styles.detailTextTitle, { color: colors.secondary }]}>Cita Programada</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>Usuario: {cita.usuario}</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>Veterinaria: {cita.veterinaria}</Text>
            {cita.hora && (
                <Text style={[styles.detailText, { color: colors.text }]}>Hora: {formatTimeDisplay(cita.hora)}</Text>
            )}
        </View>
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.secondary}15` }]}
                onPress={() => onEdit(cita)}
            >
                <MaterialIcons name="edit" size={20} color={colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.danger}15` }]}
                onPress={() => onDelete(cita)}
            >
                <MaterialIcons name="delete" size={20} color={colors.danger} />
            </TouchableOpacity>
        </View>
    </View>
);

// Componente para mostrar detalles de vacunas
const VacunaDetailItem = ({ vacuna, onEdit, onDelete, colors }) => (
    <View style={[styles.detailCard, { backgroundColor: colors.card, borderLeftColor: colors.success }]}>
        <FontAwesome5 name="syringe" size={16} color={colors.success} style={{ marginRight: spacing.sm }} />
        <View style={{ flex: 1 }}>
            <Text style={[styles.detailTextTitle, { color: colors.success }]}>Vacuna Aplicada</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>{vacuna.veterinaria} - {vacuna.usuario}</Text>
        </View>
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.success}15` }]}
                onPress={() => onEdit(vacuna)}
            >
                <MaterialIcons name="edit" size={18} color={colors.success} />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.danger}15` }]}
                onPress={() => onDelete(vacuna)}
            >
                <MaterialIcons name="delete" size={18} color={colors.danger} />
            </TouchableOpacity>
        </View>
    </View>
);

export default function Calendario() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { colors: contextColors, t } = useApp();
    const colors = contextColors || lightTheme;

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [allCitas, setAllCitas] = useState([]);
    const [markedDatesData, setMarkedDatesData] = useState({});

    // Campañas Fijas
    const FIXED_CAMPANAS = [
        { fecha: '2025-11-20', tipo: 'campaña', nombre: 'Campaña de Desparasitación' },
        { fecha: '2025-12-15', tipo: 'campaña', nombre: 'Campaña de Vacunación Anual' }
    ];

    // --- LÓGICA DE ELIMINACIÓN DE CITA ---
    const deleteCita = async (citaToDelete) => {
        Alert.alert(
            "Confirmar Eliminación",
            `¿Estás seguro de que quieres eliminar la cita con ${citaToDelete.veterinaria}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const citasRaw = await AsyncStorage.getItem('@citas');
                            const citas = citasRaw ? JSON.parse(citasRaw) : [];
                            const updatedCitas = citas.filter(c =>
                                c.fecha !== citaToDelete.fecha ||
                                c.usuario !== citaToDelete.usuario ||
                                c.veterinaria !== citaToDelete.veterinaria
                            );
                            await AsyncStorage.setItem('@citas', JSON.stringify(updatedCitas));
                            if (citaToDelete.id) {
                                await NotificationService.cancelAppointmentNotification(citaToDelete.id);
                            }
                            await loadCalendarData();
                            Alert.alert("Éxito", "Cita eliminada correctamente.");
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar la cita.");
                        }
                    }
                }
            ]
        );
    };

    const editCita = (citaToEdit) => {
        navigation.navigate('EditarCita', { cita: citaToEdit });
    };

    const deleteVacuna = async (vacunaToDelete) => {
        Alert.alert(
            "Confirmar Eliminación",
            `¿Estás seguro de que quieres eliminar el registro de vacuna?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const citasRaw = await AsyncStorage.getItem('@citas');
                            const citas = citasRaw ? JSON.parse(citasRaw) : [];
                            const updatedCitas = citas.filter(c =>
                                !(c.fecha === vacunaToDelete.fecha &&
                                    c.usuario === vacunaToDelete.usuario &&
                                    c.veterinaria === vacunaToDelete.veterinaria &&
                                    (c.tipo === 'Vacuna' || c.veterinaria === 'Vacuna Registrada'))
                            );
                            await AsyncStorage.setItem('@citas', JSON.stringify(updatedCitas));
                            await loadCalendarData();
                            Alert.alert("Éxito", "Vacuna eliminada correctamente.");
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar la vacuna.");
                        }
                    }
                }
            ]
        );
    };

    const editVacuna = (vacunaToEdit) => {
        navigation.navigate('EditarVacuna', { vacuna: vacunaToEdit });
    };

    // --- CARGAR DATOS ---
    const loadCalendarData = async () => {
        try {
            const newMarked = {};
            const allFetchedCitas = [];

            // 1. Agregar campañas fijas
            FIXED_CAMPANAS.forEach(campana => {
                const date = campana.fecha;
                if (!newMarked[date]) {
                    newMarked[date] = { dots: [] };
                }
                newMarked[date].dots.push({
                    key: `campana-${date}`,
                    color: colors.danger,
                    selectedDotColor: colors.textWhite
                });
                allFetchedCitas.push(campana);
            });

            // 2. Agregar citas guardadas
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];

            citas.forEach(cita => {
                const date = cita.fecha;
                if (!date) return;

                if (!newMarked[date]) {
                    newMarked[date] = { dots: [] };
                }

                const esCitaProgramada = cita.tipo === 'Cita';
                const esVacuna = cita.tipo === 'Vacuna' || cita.veterinaria === 'Vacuna Registrada';

                if (esCitaProgramada) {
                    const hasCitaDot = newMarked[date].dots.find(d => d.color === colors.secondary);
                    if (!hasCitaDot) {
                        newMarked[date].dots.push({
                            key: `cita-${date}-${Date.now()}`,
                            color: colors.secondary,
                            selectedDotColor: colors.textWhite
                        });
                    }
                    allFetchedCitas.push({ ...cita, tipo: 'cita' });
                } else if (esVacuna) {
                    const hasVacunaDot = newMarked[date].dots.find(d => d.color === colors.success);
                    if (!hasVacunaDot) {
                        newMarked[date].dots.push({
                            key: `vacuna-${date}-${Date.now()}`,
                            color: colors.success,
                            selectedDotColor: colors.textWhite
                        });
                    }
                    allFetchedCitas.push({ ...cita, tipo: 'vacuna' });
                }
            });

            setMarkedDatesData(newMarked);
            setAllCitas(allFetchedCitas);
        } catch (error) {
            console.error("Error cargando calendario:", error);
        }
    };

    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        const events = allCitas.filter(item => item.fecha === day.dateString);
        setSelectedDayEvents(events);
    };

    const getDisplayDates = () => {
        const combined = { ...markedDatesData };
        if (selectedDate) {
            if (!combined[selectedDate]) {
                combined[selectedDate] = { dots: [] };
            }
            combined[selectedDate] = {
                ...combined[selectedDate],
                selected: true,
                selectedColor: colors.primary
            };
        }
        return combined;
    };

    useEffect(() => {
        if (isFocused) {
            loadCalendarData();
            setSelectedDate('');
            setSelectedDayEvents([]);
        }
    }, [isFocused]);

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Card>
                    <Text style={[styles.title, { color: colors.text }]}>{t.calendar || 'Calendario'}</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        ¡Aquí puedes ver tus citas programadas y campañas activas!
                    </Text>
                </Card>

                <Calendar
                    onDayPress={handleDayPress}
                    markingType={'multi-dot'}
                    markedDates={getDisplayDates()}
                    theme={{
                        backgroundColor: colors.background,
                        calendarBackground: colors.card,
                        textSectionTitleColor: colors.text,
                        dayTextColor: colors.text,
                        todayTextColor: colors.secondary,
                        arrowColor: colors.primary,
                        textDayFontWeight: '500',
                        selectedDayBackgroundColor: colors.primary,
                        selectedDayTextColor: colors.textWhite,
                        monthTextColor: colors.text,
                        textDisabledColor: colors.textMuted,
                    }}
                    style={[styles.calendar, { borderColor: colors.border }]}
                />

                {/* Detalles del día seleccionado */}
                {selectedDate && (
                    <Card style={styles.detailsContainer}>
                        <Text style={[styles.dateText, { color: colors.text }]}>
                            Eventos para el <Text style={{ fontWeight: 'bold' }}>{selectedDate}</Text>:
                        </Text>

                        {selectedDayEvents.length === 0 ? (
                            <Text style={[styles.noEventsText, { color: colors.textMuted }]}>
                                No hay eventos programados para esta fecha.
                            </Text>
                        ) : (
                            selectedDayEvents.map((event, index) => {
                                if (event.tipo === 'cita') {
                                    return (
                                        <CitaDetailItem
                                            key={`${event.id}-${index}`}
                                            cita={event}
                                            onEdit={editCita}
                                            onDelete={deleteCita}
                                            colors={colors}
                                        />
                                    );
                                } else if (event.tipo === 'campaña') {
                                    return (
                                        <View key={`campana-${index}`} style={[styles.campaignCard, { borderLeftColor: colors.danger }]}>
                                            <MaterialIcons name="local-hospital" size={20} color={colors.danger} style={{ marginRight: spacing.sm }} />
                                            <Text style={[styles.campaignText, { color: colors.danger }]}>
                                                {event.nombre || '¡Campaña de Vacunación!'}
                                            </Text>
                                        </View>
                                    );
                                } else if (event.tipo === 'vacuna') {
                                    return (
                                        <VacunaDetailItem
                                            key={`vacuna-${index}`}
                                            vacuna={event}
                                            onEdit={editVacuna}
                                            onDelete={deleteVacuna}
                                            colors={colors}
                                        />
                                    );
                                }
                                return null;
                            })
                        )}
                    </Card>
                )}

                {/* Leyenda */}
                <Card>
                    <Text style={[styles.legendTitle, { color: colors.text }]}>Representación de colores</Text>
                    <View style={styles.legendRow}>
                        <FontAwesome5 name="circle" size={14} color={colors.danger} />
                        <Text style={[styles.legendText, { color: colors.text }]}>Campañas de Vacunación</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <FontAwesome5 name="circle" size={14} color={colors.secondary} />
                        <Text style={[styles.legendText, { color: colors.text }]}>Tus Citas Programadas</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <FontAwesome5 name="circle" size={14} color={colors.success} />
                        <Text style={[styles.legendText, { color: colors.text }]}>Vacunas Aplicadas</Text>
                    </View>
                </Card>
            </ScrollView>

            {/* Botones flotantes */}
            <FloatingButton
                position="left"
                icon={<Ionicons name="add" size={24} color={colors.text} />}
                onPress={() => navigation.navigate('ProgramarCita')}
            />
            <FloatingButton
                position="right"
                icon={<FontAwesome5 name="syringe" size={20} color={colors.text} />}
                onPress={() => navigation.navigate('ConfirmacionVacuna')}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    title: {
        ...typography.title,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.bodySmall,
        textAlign: 'center',
    },
    calendar: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    detailsContainer: {
        marginTop: spacing.sm,
    },
    dateText: {
        ...typography.subtitle,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    noEventsText: {
        ...typography.body,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: spacing.md,
    },
    detailCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,
        borderLeftWidth: 4,
    },
    detailTextTitle: {
        ...typography.label,
        marginBottom: spacing.xs,
    },
    detailText: {
        ...typography.bodySmall,
    },
    campaignCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        padding: spacing.md,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,
        borderLeftWidth: 4,
    },
    campaignText: {
        ...typography.label,
        fontWeight: 'bold',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    actionButton: {
        padding: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    legendTitle: {
        ...typography.sectionTitle,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    legendText: {
        ...typography.body,
        marginLeft: spacing.sm,
    },
});
