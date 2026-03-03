import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper, Card, FloatingButton } from '../components';
import { spacing, typography, borderRadius, lightTheme } from '../constants';

export default function HomeScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { colors: contextColors, t } = useApp();
    const colors = contextColors || lightTheme;

    // Estados
    const [upcomingVacunas, setUpcomingVacunas] = useState([]);
    const [upcomingCitas, setUpcomingCitas] = useState([]);
    const [appliedVacunas, setAppliedVacunas] = useState([]);
    const [appliedCitas, setAppliedCitas] = useState([]);

    // Función auxiliar para formatear la fecha
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return isNaN(date) ? dateString : date.toLocaleDateString('es-ES', options);
    };

    // Función para determinar si una fecha es pasada
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

    // Función para cargar citas desde AsyncStorage
    const loadCitas = async () => {
        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const allCitas = citasRaw ? JSON.parse(citasRaw) : [];

            const proxVacunas = [];
            const proxCitas = [];
            const pasadasVacunas = [];
            const pasadasCitas = [];

            allCitas.forEach(cita => {
                const esPasada = isPastDate(cita.fecha);
                const esVacuna = cita.tipo === 'Vacuna' || cita.veterinaria === 'Vacuna Registrada';
                const esCita = cita.tipo === 'Cita';

                if (esPasada) {
                    if (esVacuna) pasadasVacunas.push(cita);
                    else if (esCita) pasadasCitas.push(cita);
                } else {
                    if (esVacuna) proxVacunas.push(cita);
                    else if (esCita) proxCitas.push(cita);
                }
            });

            proxVacunas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            proxCitas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            pasadasVacunas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            pasadasCitas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            setUpcomingVacunas(proxVacunas.slice(0, 2));
            setUpcomingCitas(proxCitas.slice(0, 2));
            setAppliedVacunas(pasadasVacunas.slice(0, 3));
            setAppliedCitas(pasadasCitas.slice(0, 3));
        } catch (error) {
            console.error("Error al cargar citas:", error);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadCitas();
        }
    }, [isFocused]);

    // Componente para item de lista
    const ListItem = ({ icon, iconColor, text, textStyle }) => (
        <View style={styles.listItem}>
            {icon}
            <Text style={[styles.listText, { color: colors.text }, textStyle]}>{text}</Text>
        </View>
    );

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Tarjeta: PRÓXIMAS VACUNAS */}
                <Card style={[styles.cardUpcoming, { borderColor: colors.secondary }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        💉 {t.nextVaccine || 'Próximas Vacunas'}
                    </Text>
                    {upcomingVacunas.length > 0 ? (
                        upcomingVacunas.map((cita, index) => (
                            <ListItem
                                key={index}
                                icon={<FontAwesome5 name="syringe" size={16} color={colors.secondary} />}
                                text={`"${cita.usuario}": ${cita.veterinaria} el ${formatDate(cita.fecha)}`}
                            />
                        ))
                    ) : (
                        <Text style={[styles.noDataText, { color: colors.textMuted }]}>
                            No hay vacunas próximas programadas.
                        </Text>
                    )}
                    <TouchableOpacity
                        style={[styles.cardButton, { backgroundColor: colors.secondary }]}
                        onPress={() => navigation.navigate('Calendario')}
                    >
                        <Text style={styles.cardButtonText}>Ver Calendario</Text>
                    </TouchableOpacity>
                </Card>

                {/* Tarjeta: PRÓXIMAS CITAS */}
                <Card style={[styles.cardUpcoming, { borderColor: colors.primary }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>📅 Próximas Citas</Text>
                    {upcomingCitas.length > 0 ? (
                        upcomingCitas.map((cita, index) => (
                            <ListItem
                                key={index}
                                icon={<Ionicons name="calendar" size={16} color={colors.primary} />}
                                text={`"${cita.usuario}": ${cita.veterinaria} el ${formatDate(cita.fecha)}`}
                            />
                        ))
                    ) : (
                        <Text style={[styles.noDataText, { color: colors.textMuted }]}>
                            No hay otras citas próximas programadas.
                        </Text>
                    )}
                    <TouchableOpacity
                        style={[styles.cardButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('Calendario')}
                    >
                        <Text style={styles.cardButtonText}>Ver Calendario</Text>
                    </TouchableOpacity>
                </Card>

                {/* Tarjeta: HISTORIAL APLICADO */}
                <Card style={[styles.cardApplied, { borderColor: colors.success }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>✅ Historial Aplicado</Text>

                    <Text style={[styles.sectionSubtitle, { color: colors.success }]}>Vacunas:</Text>
                    {appliedVacunas.length > 0 ? (
                        appliedVacunas.map((cita, index) => (
                            <ListItem
                                key={index}
                                icon={<FontAwesome5 name="check-circle" size={16} color={colors.success} />}
                                text={`"${cita.usuario}": ${cita.veterinaria} el ${formatDate(cita.fecha)}`}
                                textStyle={{ color: colors.success }}
                            />
                        ))
                    ) : (
                        <Text style={[styles.noDataText, { color: colors.success }]}>
                            Aún no hay vacunas registradas.
                        </Text>
                    )}

                    <Text style={[styles.sectionSubtitle, { color: colors.success, marginTop: spacing.md }]}>
                        Otras Citas:
                    </Text>
                    {appliedCitas.length > 0 ? (
                        appliedCitas.map((cita, index) => (
                            <ListItem
                                key={index}
                                icon={<Ionicons name="time" size={16} color={colors.success} />}
                                text={`"${cita.usuario}": ${cita.veterinaria} el ${formatDate(cita.fecha)}`}
                                textStyle={{ color: colors.success }}
                            />
                        ))
                    ) : (
                        <Text style={[styles.noDataText, { color: colors.success }]}>
                            Aún no hay otras citas registradas.
                        </Text>
                    )}
                </Card>

                {/* Tarjeta: RECORDATORIOS */}
                <Card style={[styles.cardReminder, { borderColor: colors.warning }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>⏰ Recordatorios</Text>
                    <ListItem
                        icon={<MaterialIcons name="alarm" size={16} color={colors.warning} />}
                        text="Visita al médico cada mes"
                    />
                    <ListItem
                        icon={<MaterialIcons name="alarm" size={16} color={colors.warning} />}
                        text="Alimentarlo por porciones"
                    />
                </Card>
            </ScrollView>

            {/* Botones flotantes */}
            <FloatingButton
                position="left"
                icon={<MaterialCommunityIcons name="google" size={24} color={colors.text} />}
                onPress={() => navigation.navigate('BuscadorGoogle')}
            />
            <FloatingButton
                position="center"
                icon={<MaterialIcons name="map" size={24} color={colors.text} />}
                onPress={() => navigation.navigate('Mapas')}
            />
            <FloatingButton
                position="right"
                icon={<MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.text} />}
                onPress={() => navigation.navigate('RegistroMascota')}
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
    cardUpcoming: {
        borderLeftWidth: 4,
    },
    cardApplied: {
        borderLeftWidth: 4,
    },
    cardReminder: {
        borderLeftWidth: 4,
    },
    cardTitle: {
        ...typography.subtitle,
        marginBottom: spacing.md,
    },
    sectionSubtitle: {
        ...typography.label,
        marginBottom: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        paddingBottom: spacing.xs,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
        paddingVertical: spacing.xs,
    },
    listText: {
        ...typography.body,
        marginLeft: spacing.sm,
        flex: 1,
    },
    noDataText: {
        ...typography.bodySmall,
        textAlign: 'center',
        paddingVertical: spacing.md,
    },
    cardButton: {
        marginTop: spacing.md,
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    cardButtonText: {
        ...typography.buttonText,
        color: '#FFFFFF',
    },
});
