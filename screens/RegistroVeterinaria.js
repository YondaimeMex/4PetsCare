import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';

function Field({ label, icon, value, onChangeText, placeholder, keyboardType, maxLength, theme }) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name={icon} size={18} color={theme.brandSoft} style={styles.leftIcon} />
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.muted}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                />
            </View>
        </View>
    );
}

export default function RegistroVeterinaria() {
    const navigation = useNavigation();
    const { colors } = useApp();

    const [nombreVeterinaria, setNombreVeterinaria] = useState('');
    const [ubiVeterinaria, setUbiVeterinaria] = useState('');
    const [numero, setNumero] = useState('');

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

    const normalizePhone = (value) => value.replace(/\D/g, '');
    const normalizeTextForCompare = (value) => value.trim().replace(/\s+/g, ' ').toLowerCase();

    const handleSave = async () => {
        const nombreLimpio = nombreVeterinaria.trim();
        const ubicacionLimpia = ubiVeterinaria.trim();
        const numeroLimpio = normalizePhone(numero);

        if (!nombreLimpio || !ubicacionLimpia) {
            Alert.alert('Faltan datos', 'Ingresa el nombre y la ubicación.');
            return;
        }

        if (numeroLimpio && numeroLimpio.length < 8) {
            Alert.alert('Número inválido', 'Ingresa un número de teléfono válido.');
            return;
        }

        try {
            const nuevaVeterinaria = {
                id: Date.now(),
                label: nombreLimpio,
                ubicacion: ubicacionLimpia,
                numero: numeroLimpio,
            };

            const existentesRaw = await AsyncStorage.getItem('@veterinarias');
            const existentes = existentesRaw ? JSON.parse(existentesRaw) : [];

            const nombreNormalizado = normalizeTextForCompare(nombreLimpio);
            const ubicacionNormalizada = normalizeTextForCompare(ubicacionLimpia);

            const alreadyExists = existentes.some((vet) => {
                const vetName = normalizeTextForCompare(vet.label || '');
                const vetLocation = normalizeTextForCompare(vet.ubicacion || '');
                return vetName === nombreNormalizado && vetLocation === ubicacionNormalizada;
            });

            if (alreadyExists) {
                Alert.alert('Duplicado', 'Esa veterinaria ya está registrada en esa ubicación.');
                return;
            }

            const actualizada = [...existentes, nuevaVeterinaria];
            await AsyncStorage.setItem('@veterinarias', JSON.stringify(actualizada));

            Alert.alert('Éxito', `Veterinaria "${nombreLimpio}" registrada.`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar la veterinaria.');
        }
    };

    return (
        <ScreenWrapper showBack>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroTopRow}>
                            <View style={styles.heroIconWrap}>
                                <Ionicons name="medkit-outline" size={22} color="#FFFFFF" />
                            </View>
                            <TouchableOpacity
                                style={[styles.heroMiniBtn, { backgroundColor: theme.accent }]}
                                onPress={() => navigation.goBack()}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="close" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.heroKicker}>VETERINARIAS</Text>
                        <Text style={styles.heroTitle}>Registrar clínica</Text>
                        <Text style={styles.heroSubtitle}>Guárdala para usarla en citas y emergencias.</Text>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Field
                            label="Nombre"
                            icon="business-outline"
                            value={nombreVeterinaria}
                            onChangeText={setNombreVeterinaria}
                            placeholder="Ej. Veterinaria Luz"
                            theme={theme}
                        />

                        <Field
                            label="Ubicación"
                            icon="location-outline"
                            value={ubiVeterinaria}
                            onChangeText={setUbiVeterinaria}
                            placeholder="Ej. López Portillo"
                            theme={theme}
                        />

                        <Field
                            label="Número"
                            icon="call-outline"
                            value={numero}
                            onChangeText={(text) => setNumero(normalizePhone(text))}
                            placeholder="Ej. 9988776655"
                            keyboardType="numeric"
                            maxLength={15}
                            theme={theme}
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.brand }]}
                            onPress={handleSave}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.saveButtonText}>Guardar veterinaria</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                            <Text style={[styles.cancelText, { color: theme.muted }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
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
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    heroIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    heroMiniBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
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
    formCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
    },
    fieldWrap: {
        marginBottom: 12,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 6,
    },
    inputRow: {
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 10,
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
    saveButton: {
        marginTop: 6,
        minHeight: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    cancelButton: {
        marginTop: 10,
        alignItems: 'center',
        paddingVertical: 6,
    },
    cancelText: {
        fontSize: 13,
        fontWeight: '600',
    },
});