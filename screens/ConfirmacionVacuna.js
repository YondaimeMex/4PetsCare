import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function ConfirmacionVacuna() {
    const navigation = useNavigation();
    const route = useRoute();
    const { mascota } = route.params || {};
    const { colors, t } = useApp();

    const [selectedDate, setSelectedDate] = useState('');
    const [veterinarias, setVeterinarias] = useState([]);
    const [selectedVeterinaria, setSelectedVeterinaria] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    useEffect(() => {
        loadVeterinarias();
    }, []);

    const handleSave = async () => {
        if (!selectedDate) {
            Alert.alert('Error', 'Selecciona la fecha en que la vacuna fue aplicada.');
            return false;
        }

        if (!selectedVeterinaria) {
            Alert.alert('Error', 'Selecciona la veterinaria donde se aplicó la vacuna.');
            return false;
        }

        const newCita = {
            id: Date.now(),
            fecha: selectedDate,
            tipo: 'Vacuna',
            veterinaria: selectedVeterinaria,
            usuario: mascota?.nombre || 'Mi Mascota',
        };

        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];
            const updatedCitas = [...citas, newCita];
            await AsyncStorage.setItem('@citas', JSON.stringify(updatedCitas));
            return true;
        } catch (error) {
            console.error('Error al guardar la cita en AsyncStorage:', error);
            Alert.alert('Error', 'Hubo un problema al guardar el registro de la vacuna.');
            return false;
        }
    };

    return (
        <ScreenWrapper showBack>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroTopRow}>
                            <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <FontAwesome5 name="syringe" size={16} color="#FFFFFF" />
                            </View>
                            <View style={[styles.heroPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={styles.heroPillText}>{mascota?.nombre || 'Mi mascota'}</Text>
                            </View>
                        </View>
                        <Text style={styles.heroKicker}>VACUNA</Text>
                        <Text style={styles.heroTitle}>Confirmar aplicación</Text>
                        <Text style={styles.heroSubtitle}>Selecciona fecha y veterinaria para registrar correctamente.</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>Fecha aplicada</Text>
                        <Calendar
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markedDates={{
                                [selectedDate]: {
                                    selected: true,
                                    marked: true,
                                    selectedColor: theme.brand,
                                },
                            }}
                            theme={{
                                backgroundColor: theme.card,
                                calendarBackground: theme.card,
                                textSectionTitleColor: theme.muted,
                                dayTextColor: theme.text,
                                monthTextColor: theme.text,
                                todayTextColor: theme.accent,
                                arrowColor: theme.brand,
                                textDisabledColor: theme.border,
                                textDayFontWeight: '500',
                            }}
                        />
                        {selectedDate ? (
                            <Text style={[styles.dateText, { color: theme.brand }]}>Fecha elegida: {selectedDate}</Text>
                        ) : null}
                    </View>

                    <View style={[styles.card, { zIndex: 100, backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>Veterinaria</Text>
                        <TouchableOpacity
                            style={[styles.dropdownTrigger, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <Ionicons name="business-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <Text style={[styles.dropdownValue, { color: selectedVeterinaria ? theme.text : theme.muted }]}>
                                {selectedVeterinaria || 'Elige una veterinaria'}
                            </Text>
                            <MaterialIcons
                                name={isDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={24}
                                color={theme.text}
                            />
                        </TouchableOpacity>

                        {isDropdownOpen ? (
                            <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                {veterinarias.length === 0 ? (
                                    <View style={styles.emptyStateBox}>
                                        <Text style={[styles.emptyStateText, { color: theme.muted }]}>No hay veterinarias guardadas.</Text>
                                    </View>
                                ) : (
                                    veterinarias.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => {
                                                setSelectedVeterinaria(option.label);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: theme.text }]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.vaccineButton, { backgroundColor: theme.brand }]}
                        onPress={async () => {
                            const saved = await handleSave();
                            if (saved) {
                                navigation.replace('VacunaRegistrada', { fechaAplicada: selectedDate });
                                setSelectedDate('');
                            }
                        }}
                    >
                        <View style={styles.vaccineButtonContent}>
                            <FontAwesome5 name="syringe" size={16} color="white" />
                            <Text style={styles.vaccineButtonText}>{t.confirm || 'Confirmar'}</Text>
                            <Ionicons name="checkmark-circle" size={18} color="#D4EDDA" style={{ marginLeft: 8 }} />
                        </View>
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
    content: {
        padding: 16,
        paddingBottom: 44,
    },
    heroCard: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 22,
        marginBottom: 12,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    heroIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroPill: {
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    heroPillText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
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
    dateText: {
        marginTop: 10,
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '700',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        minHeight: 48,
        paddingHorizontal: 10,
    },
    leftIcon: {
        marginRight: 8,
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
    vaccineButton: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    vaccineButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vaccineButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 10,
        marginRight: 5,
    },
});