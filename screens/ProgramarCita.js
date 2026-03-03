import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper, Card, Button } from '../components';
import { spacing, typography, borderRadius, lightTheme } from '../constants';
import NotificationService from './Notificaciones';

export default function ProgramarCita() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { colors: contextColors, t } = useApp();
    const colors = contextColors || lightTheme;

    // --- ESTADOS ---
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreVeterinaria, setVeterinaria] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [veterinarias, setVeterinarias] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- CARGA DE VETERINARIAS ---
    const loadVeterinarias = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@veterinarias');
            const data = jsonValue != null ? JSON.parse(jsonValue) : [];
            data.sort((a, b) => a.label.localeCompare(b.label));
            setVeterinarias(data);
        } catch (error) {
            console.error("Error cargando veterinarias", error);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadVeterinarias();
        }
    }, [isFocused]);

    // --- MANEJADORES ---
    const selectVeterinaria = (option) => {
        setVeterinaria(option.label);
        setIsDropdownOpen(false);
    };

    const getMarkedDates = () => {
        if (!selectedDate) return {};
        return {
            [selectedDate]: { selected: true, selectedColor: colors.primary }
        };
    };

    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const onTimeChange = (event, selected) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selected) {
            setSelectedTime(selected);
        }
    };

    // --- GUARDAR CITA ---
    const handleSave = async () => {
        const usuario = nombreUsuario.trim();
        const vet = nombreVeterinaria.trim();

        if (!usuario || !vet || !selectedDate) {
            Alert.alert(
                'Faltan datos',
                `Por favor completa todos los campos:\n${!usuario ? '- Nombre del usuario\n' : ''}${!vet ? '- Veterinaria\n' : ''}${!selectedDate ? '- Fecha' : ''}`
            );
            return;
        }

        setLoading(true);

        const horaFormateada = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;

        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];

            const nuevaCita = {
                id: Date.now().toString(),
                usuario: usuario,
                veterinaria: vet,
                fecha: selectedDate,
                hora: horaFormateada,
                tipo: 'Cita'
            };

            const nuevasCitas = [...citas, nuevaCita];
            await AsyncStorage.setItem('@citas', JSON.stringify(nuevasCitas));

            await NotificationService.scheduleAppointmentNotification(nuevaCita, 24);

            setLoading(false);
            Alert.alert(
                'Cita guardada',
                `¡Cita en ${vet} registrada para el ${selectedDate} a las ${formatTime(selectedTime)}!`,
                [{ text: "OK", onPress: () => navigation.navigate('Calendario') }]
            );

            setNombreUsuario('');
            setVeterinaria('');
            setSelectedDate('');
            setSelectedTime(new Date());

        } catch (error) {
            console.error("Error guardando cita:", error);
            setLoading(false);
            Alert.alert("Error", "No se pudo guardar la cita.");
        }
    };

    return (
        <ScreenWrapper showBack={true}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Título */}
                <Text style={[styles.screenTitle, { color: colors.text }]}>
                    Programar Cita
                </Text>

                {/* Campo: Nombre del usuario */}
                <Card>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Nombre del usuario:</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                        value={nombreUsuario}
                        onChangeText={setNombreUsuario}
                        placeholder="Ej. Gabriel Pérez"
                        placeholderTextColor={colors.textMuted}
                    />
                </Card>

                {/* Campo: Veterinaria */}
                <Card style={{ zIndex: 100 }}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Seleccione la veterinaria:</Text>

                    <TouchableOpacity
                        style={[styles.dropdownTrigger, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <Text style={[styles.dropdownText, { color: nombreVeterinaria ? colors.text : colors.textMuted }]}>
                            {nombreVeterinaria || 'Elige una veterinaria'}
                        </Text>
                        <MaterialIcons
                            name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {veterinarias.length === 0 ? (
                                <View style={styles.emptyDropdown}>
                                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                        No hay veterinarias guardadas.
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.addVetButton, { backgroundColor: colors.secondary }]}
                                        onPress={() => {
                                            setIsDropdownOpen(false);
                                            navigation.navigate('RegistroVeterinaria');
                                        }}
                                    >
                                        <MaterialIcons name="add" size={18} color={colors.textWhite} />
                                        <Text style={[styles.addVetButtonText, { color: colors.textWhite }]}>
                                            Registrar Veterinaria
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    {veterinarias.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                                            onPress={() => selectVeterinaria(option)}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={[styles.dropdownFooter, { borderTopColor: colors.border }]}
                                        onPress={() => {
                                            setIsDropdownOpen(false);
                                            navigation.navigate('RegistroVeterinaria');
                                        }}
                                    >
                                        <MaterialIcons name="add-circle-outline" size={20} color={colors.success} />
                                        <Text style={[styles.dropdownFooterText, { color: colors.success }]}>
                                            Agregar nueva veterinaria
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </Card>

                {/* Campo: Calendario */}
                <Card>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Fecha de la cita:</Text>
                    <Calendar
                        onDayPress={day => setSelectedDate(day.dateString)}
                        markingType={'simple'}
                        markedDates={getMarkedDates()}
                        theme={{
                            backgroundColor: colors.card,
                            calendarBackground: colors.card,
                            textSectionTitleColor: colors.textMuted,
                            dayTextColor: colors.text,
                            monthTextColor: colors.text,
                            todayTextColor: colors.secondary,
                            arrowColor: colors.primary,
                            textDayFontWeight: '500',
                            textDisabledColor: colors.textMuted,
                            selectedDayBackgroundColor: colors.primary,
                            selectedDayTextColor: colors.textWhite,
                        }}
                        style={[styles.calendar, { borderColor: colors.border }]}
                    />
                    {selectedDate && (
                        <Text style={[styles.selectedDateText, { color: colors.secondary }]}>
                            Fecha elegida: {selectedDate}
                        </Text>
                    )}
                </Card>

                {/* Campo: Hora */}
                <Card>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Hora de la cita:</Text>
                    <TouchableOpacity
                        style={[styles.timePicker, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Ionicons name="time-outline" size={24} color={colors.primary} />
                        <Text style={[styles.timeText, { color: colors.text }]}>
                            {formatTime(selectedTime)}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.textMuted} />
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
                </Card>

                {/* Botón Guardar */}
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.success }, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textWhite} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={colors.textWhite} />
                            <Text style={styles.saveButtonText}>Programar Cita</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    screenTitle: {
        ...typography.title,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.label,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderRadius: borderRadius.sm,
        height: 50,
        paddingHorizontal: spacing.md,
        ...typography.body,
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: borderRadius.sm,
        height: 50,
        paddingHorizontal: spacing.md,
    },
    dropdownText: {
        ...typography.body,
    },
    dropdownList: {
        marginTop: spacing.xs,
        borderWidth: 1,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: spacing.md,
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        ...typography.body,
    },
    dropdownFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderTopWidth: 1,
    },
    dropdownFooterText: {
        ...typography.body,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
    emptyDropdown: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.bodySmall,
        marginBottom: spacing.md,
    },
    addVetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.round,
    },
    addVetButtonText: {
        ...typography.buttonText,
        marginLeft: spacing.xs,
    },
    calendar: {
        borderWidth: 1,
        borderRadius: borderRadius.sm,
    },
    selectedDateText: {
        ...typography.body,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: spacing.md,
    },
    timePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    timeText: {
        ...typography.subtitle,
        flex: 1,
        marginLeft: spacing.sm,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.lg,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        ...typography.buttonText,
        color: '#FFFFFF',
        marginLeft: spacing.sm,
    },
});
