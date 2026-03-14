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

export default function EditarVacuna() {
    const navigation = useNavigation();
    const route = useRoute();
    const { vacuna } = route.params || {};
    const { colors } = useApp();

    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreVeterinaria, setNombreVeterinaria] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [veterinarias, setVeterinarias] = useState([]);
    const [mascotas, setMascotas] = useState([]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMascotasDropdownOpen, setIsMascotasDropdownOpen] = useState(false);

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

    useFocusEffect(
        useCallback(() => {
            if (vacuna) {
                setNombreUsuario(vacuna.usuario || 'Mi Mascota');
                setNombreVeterinaria(vacuna.veterinaria || '');
                setSelectedDate(vacuna.fecha || '');
                loadVeterinarias();
                loadMascotas();
            }
        }, [vacuna])
    );

    const loadMascotas = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@mascotas');
            const data = jsonValue != null ? JSON.parse(jsonValue) : [];
            data.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setMascotas(data);
        } catch (error) {
            console.error('Error cargando mascotas', error);
        }
    };

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

    const selectMascota = (mascota) => {
        setNombreUsuario(mascota.nombre);
        setIsMascotasDropdownOpen(false);
    };

    const selectVeterinaria = (option) => {
        setNombreVeterinaria(option.label);
        setIsDropdownOpen(false);
    };

    const getMarkedDates = () => {
        if (!selectedDate) return {};
        return {
            [selectedDate]: { selected: true, selectedColor: theme.brand },
        };
    };

    const handleSave = async () => {
        if (!vacuna) {
            Alert.alert('Error', 'No se encontró la vacuna a editar.');
            return;
        }

        const mascotaLimpia = nombreUsuario.trim();
        const veterinariaLimpia = nombreVeterinaria.trim();

        if (!mascotaLimpia || !veterinariaLimpia || !selectedDate) {
            Alert.alert('Faltan datos', 'Ingresa mascota, veterinaria y fecha de la vacuna.');
            return;
        }

        setLoading(true);
        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];

            const updatedCitas = citas.filter((c) => {
                if (vacuna.id != null && c.id != null) {
                    return c.id !== vacuna.id;
                }

                return !(
                    c.fecha === vacuna.fecha &&
                    c.usuario === vacuna.usuario &&
                    c.veterinaria === vacuna.veterinaria &&
                    (c.tipo === 'Vacuna' || c.veterinaria === 'Vacuna Registrada')
                );
            });

            const vacunaActualizada = {
                ...vacuna,
                usuario: mascotaLimpia,
                veterinaria: veterinariaLimpia,
                fecha: selectedDate,
                tipo: 'Vacuna',
            };

            updatedCitas.push(vacunaActualizada);
            await AsyncStorage.setItem('@citas', JSON.stringify(updatedCitas));

            setLoading(false);
            Alert.alert('Éxito', `¡Vacuna actualizada para el ${selectedDate}!`, [
                { text: 'OK', onPress: () => navigation.navigate('Calendario') },
            ]);
        } catch (error) {
            console.error('Error guardando cambios:', error);
            setLoading(false);
            Alert.alert('Error', 'No se pudieron guardar los cambios.');
        }
    };

    return (
        <ScreenWrapper showBack showMenu={false} showNotifications={false} showProfile={false}>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <Text style={styles.heroKicker}>VACUNAS</Text>
                        <Text style={styles.heroTitle}>Editar vacuna</Text>
                        <Text style={styles.heroSubtitle}>Ajusta mascota, veterinaria y fecha de aplicación.</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, zIndex: 101 }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>Mascota</Text>
                        <TouchableOpacity
                            style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                            onPress={() => setIsMascotasDropdownOpen((prev) => !prev)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="paw-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <Text style={[styles.dropdownValue, { color: nombreUsuario ? theme.text : theme.muted }]}>
                                {nombreUsuario || 'Selecciona una mascota'}
                            </Text>
                            <MaterialIcons
                                name={isMascotasDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={22}
                                color={theme.muted}
                            />
                        </TouchableOpacity>

                        {isMascotasDropdownOpen ? (
                            <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                {mascotas.length === 0 ? (
                                    <View style={styles.emptyStateBox}>
                                        <Text style={[styles.emptyStateText, { color: theme.muted }]}>No hay mascotas registradas.</Text>
                                    </View>
                                ) : (
                                    mascotas.map((mascota, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => selectMascota(mascota)}
                                        >
                                            <Text style={[styles.dropdownItemText, { color: theme.text }]}>{mascota.nombre}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        ) : null}
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, zIndex: 100 }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>Veterinaria</Text>
                        <TouchableOpacity
                            style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                            onPress={() => setIsDropdownOpen((prev) => !prev)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="business-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                            <Text style={[styles.dropdownValue, { color: nombreVeterinaria ? theme.text : theme.muted }]}>
                                {nombreVeterinaria || 'Selecciona veterinaria'}
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
                                        <Text style={[styles.emptyStateText, { color: theme.muted }]}>No hay veterinarias guardadas.</Text>
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
                        <Text style={[styles.label, { color: theme.muted }]}>Fecha de vacuna</Text>
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
                            <Text style={[styles.selectedDateText, { color: theme.brand }]}>Fecha elegida: {selectedDate}</Text>
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
                                <Text style={styles.saveButtonText}>Guardar cambios</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.cancelButton, { borderColor: theme.border, backgroundColor: theme.card }]}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancelar</Text>
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