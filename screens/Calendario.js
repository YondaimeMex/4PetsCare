import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { ScreenWrapper, Card } from '../components';
import { spacing, typography } from '../constants';
import { useApp } from '../context';

export default function Calendario() {
    const { colors, t } = useApp();
    const [selectedDate, setSelectedDate] = useState('');

    // Fechas de eventos (rojos) y citas (azules)
    const [events] = useState(['2025-11-30', '2025-11-17']);
    const [appointments] = useState(['2025-11-04', '2025-11-07']);

    // Función que marca las fechas con puntos de colores en el calendario
    const getMarkedDates = () => {
        const marked = {};

        // Fechas de eventos
        events.forEach(date => {
            if (!marked[date]) marked[date] = { dots: [] };
            marked[date].dots.push({ key: `event-${date}`, color: colors.danger, selectedDotColor: 'white' });
        });

        // Fechas de citas
        appointments.forEach(date => {
            if (!marked[date]) marked[date] = { dots: [] };
            marked[date].dots.push({ key: `appt-${date}`, color: colors.secondary, selectedDotColor: 'white' });
        });

        // Fecha seleccionada por el usuario
        if (selectedDate) {
            const prev = marked[selectedDate] || {};
            marked[selectedDate] = {
                ...prev,
                selected: true,
                selectedColor: colors.primary,
            };
        }

        return marked;
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Tarjeta con título */}
                <Card
                    title={t.calendar}
                    subtitle={t.calendarDescription}
                />

                {/* Calendario interactivo */}
                <View style={styles.calendarContainer}>
                    <Calendar
                        onDayPress={day => setSelectedDate(day.dateString)}
                        markingType={'multi-dot'}
                        markedDates={getMarkedDates()}
                        theme={{
                            todayTextColor: colors.secondary,
                            arrowColor: colors.primary,
                            selectedDayBackgroundColor: colors.primary,
                        }}
                    />

                    {selectedDate ? (
                        <Text style={[styles.dateText, { color: colors.text }]}>{t.selectedDate}: {selectedDate}</Text>
                    ) : null}

                    {/* Leyenda */}
                    <Card>
                        <View style={styles.legendRow}>
                            <FontAwesome5 name="circle" size={16} color={colors.danger} />
                            <Text style={[styles.legendText, { color: colors.text }]}>{t.vaccinationEvents}</Text>
                        </View>

                        <View style={styles.legendRow}>
                            <FontAwesome5 name="circle" size={16} color={colors.secondary} />
                            <Text style={[styles.legendText, { color: colors.text }]}>{t.appointments}</Text>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    calendarContainer: {
        paddingBottom: spacing.xl,
    },
    dateText: {
        marginTop: spacing.lg,
        ...typography.subtitle,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    legendText: {
        marginLeft: spacing.sm,
        ...typography.body,
    },
});