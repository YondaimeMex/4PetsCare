import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';
import { buildFormTheme, getSingleSelectedMarkedDates } from '../lib/formTheme';

export default function EditarCita() {
    const navigation = useNavigation();
    const route = useRoute();
    const { cita } = route.params || {};
    const { colors, t } = useApp();

    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreVeterinaria, setVeterinaria] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [veterinarias, setVeterinarias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const theme = useMemo(() => buildFormTheme(colors), [colors]);

    useFocusEffect(
        useCallback(() => {
            if (cita) {
                setNombreUsuario(cita.usuario || '');
                setVeterinaria(cita.veterinaria || '');
                setSelectedDate(cita.fecha || '');
                loadVeterinarias();
            }
        }, [cita])
    );

    const loadVeterinarias = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@veterinarias');
            const data = jsonValue != null ? JSON.parse(jsonValue) : [];
            data.sort((a, b) => a.label.localeCompare(b.label));
            setVeterinarias(data);
        } catch (error) {
            console.error('Error cargando veterinarias', error);
        }
    };

    const selectVeterinaria = (option) => {
        setVeterinaria(option.label);
        setIsDropdownOpen(false);
    };

    const getMarkedDates = () => getSingleSelectedMarkedDates(selectedDate, theme.brand);

    const handleSave = async () => {
        if (!cita) {
            Alert.alert(t.error || 'Error', t.appointmentNotFound || 'No se encontro la cita a editar.');
            return;
        }

        const usuarioLimpio = nombreUsuario.trim();
        const veterinariaLimpia = nombreVeterinaria.trim();

        if (!usuarioLimpio || !veterinariaLimpia || !selectedDate) {
            Alert.alert(t.missingData || 'Faltan datos', t.fillNameVetDate || 'Ingresa nombre, veterinaria y fecha.');
            return;
        }

        setLoading(true);
        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];

            const updatedCitas = citas.filter((c) => {
                if (cita.id != null && c.id != null) {
                    return c.id !== cita.id;
                }

                return !(
                    c.fecha === cita.fecha &&
                    c.usuario === cita.usuario &&
                    c.veterinaria === cita.veterinaria &&
                    c.tipo === 'Cita'
                );
            });

            const citaActualizada = {
                ...cita,
                usuario: usuarioLimpio,
                veterinaria: veterinariaLimpia,
                fecha: selectedDate,
                tipo: 'Cita',
            };

            updatedCitas.push(citaActualizada);
            await AsyncStorage.setItem('@citas', JSON.stringify(updatedCitas));

            setLoading(false);
            Alert.alert(t.success || 'Exito', `${t.appointmentUpdated || 'Cita actualizada para el'} ${selectedDate}!`, [
                { text: 'OK', onPress: () => navigation.navigate('Calendario') },
            ]);
        } catch (error) {
            console.error('Error guardando cambios:', error);
            setLoading(false);
            Alert.alert(t.error || 'Error', t.saveChangesError || 'No se pudieron guardar los cambios.');
        }
    };

    return (
        <ScreenWrapper showBack showMenu={false} showNotifications={false} showProfile={false}>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <Text style={styles.heroKicker}>{t.editAppointmentKicker || 'CITAS'}</Text>
                        <Text style={styles.heroTitle}>{t.editAppointmentTitle || 'Editar cita'}</Text>
                        <Text style={styles.heroSubtitle}>{t.editAppointmentSubtitle || 'Actualiza usuario, clinica y fecha.'}</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.userNameLabel || 'Nombre del usuario'}</Text>
                        <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                            <Ionicons name="person-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                value={nombreUsuario}
                                onChangeText={setNombreUsuario}
                                placeholder={t.userNamePlaceholder || 'Ej. Gabriel Perez'}
                                placeholderTextColor={theme.muted}
                            />
                        </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, zIndex: 100 }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.vetFallback || 'Veterinaria'}</Text>
                        <TouchableOpacity
                            style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                            onPress={() => setIsDropdownOpen((prev) => !prev)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="business-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <Text style={[styles.dropdownValue, { color: nombreVeterinaria ? theme.text : theme.muted }]}>
                                {nombreVeterinaria || t.chooseVetPlaceholder || 'Elige una veterinaria'}
                            </Text>
                            <MaterialIcons
                                name={isDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={22}
                                color={theme.muted}
                            />
                        </TouchableOpacity>

                        {isDropdownOpen ? (
                            <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                {veterinarias.length === 0 ? (
                                    <View style={styles.emptyStateBox}>
                                        <Text style={[styles.emptyStateText, { color: theme.muted }]}>{t.noSavedVets || 'No hay veterinarias guardadas.'}</Text>
                                    </View>
                                ) : (
                                    veterinarias.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => selectVeterinaria(option)}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: theme.text }]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        ) : null}
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.appointmentDateLabel || 'Fecha de la cita'}</Text>
                        <Calendar
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markingType="simple"
                            markedDates={getMarkedDates()}
                            theme={{
                                backgroundColor: theme.card,
                                calendarBackground: theme.card,
                                textSectionTitleColor: theme.muted,
                                dayTextColor: theme.text,
                                todayTextColor: theme.accent,
                                arrowColor: theme.brand,
                                monthTextColor: theme.text,
                                textDayFontWeight: '500',
                                textDisabledColor: theme.border,
                            }}
                        />
                        {selectedDate ? (
                            <Text style={[styles.selectedDateText, { color: theme.brand }]}>{t.chosenDatePrefix || 'Fecha elegida:'} {selectedDate}</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.brand }, loading && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={18} color="#fff" />
                                <Text style={styles.saveButtonText}>{t.saveChanges || 'Guardar cambios'}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.cancelButton, { borderColor: theme.border, backgroundColor: theme.card }]}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.text }]}>{t.cancel || 'Cancelar'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 42,
    },
    heroCard: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 22,
        marginBottom: 12,
    },
    heroKicker: {
        color: 'rgba(255,255,255,0.74)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.79)',
        fontSize: 13,
        lineHeight: 18,
        marginTop: 6,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        padding: 14,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 6,
    },
    inputRow: {
        minHeight: 48,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    leftIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 11,
    },
    dropdownValue: {
        flex: 1,
        fontSize: 14,
    },
    dropdownList: {
        marginTop: 6,
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        fontSize: 13,
    },
    emptyStateBox: {
        padding: 14,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 13,
    },
    selectedDateText: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    saveButton: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        minHeight: 48,
        marginTop: 10,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});