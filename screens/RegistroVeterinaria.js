import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';
import { supabase } from '../lib/Supabase';

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
    const { colors, t } = useApp();
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
            Alert.alert(t.missingData || 'Faltan datos', t.enterNameAndLocation || 'Ingresa el nombre y la ubicacion.');
            return;
        }
        if (numeroLimpio && numeroLimpio.length < 8) {
            Alert.alert(t.invalidNumberTitle || 'Numero invalido', t.invalidPhoneMessage || 'Ingresa un numero de telefono valido.');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert(t.error || 'Error', 'No autenticado.');
                return;
            }

            // Verificar duplicado
            const nombreNormalizado = normalizeTextForCompare(nombreLimpio);
            const ubicacionNormalizada = normalizeTextForCompare(ubicacionLimpia);

            const { data: existentes } = await supabase
                .from('veterinarias')
                .select('nombre, ubicacion')
                .eq('user_id', user.id);

            const alreadyExists = (existentes || []).some((vet) => {
                return normalizeTextForCompare(vet.nombre || '') === nombreNormalizado &&
                       normalizeTextForCompare(vet.ubicacion || '') === ubicacionNormalizada;
            });

            if (alreadyExists) {
                Alert.alert(t.duplicateTitle || 'Duplicado', t.vetAlreadyExists || 'Esa veterinaria ya esta registrada en esa ubicacion.');
                return;
            }

            const { error } = await supabase
                .from('veterinarias')
                .insert({
                    user_id: user.id,
                    nombre: nombreLimpio,
                    ubicacion: ubicacionLimpia,
                    telefono: numeroLimpio || null,
                });

            if (error) {
                console.error('RegistroVeterinaria error:', error);
                Alert.alert(t.error || 'Error', t.saveVetError || 'No se pudo guardar la veterinaria.');
                return;
            }

            Alert.alert(t.success || 'Exito', `${t.vetRegisteredPrefix || 'Veterinaria registrada:'} ${nombreLimpio}`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('RegistroVeterinaria exception:', error);
            Alert.alert(t.error || 'Error', t.saveVetError || 'No se pudo guardar la veterinaria.');
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
                        <Text style={styles.heroTitle}>{t.registerClinic || 'Registrar clinica'}</Text>
                        <Text style={styles.heroSubtitle}>{t.saveForAppointmentsAndEmergencies || 'Guardala para usarla en citas y emergencias.'}</Text>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Field
                            label={t.petName || 'Nombre'}
                            icon="business-outline"
                            value={nombreVeterinaria}
                            onChangeText={setNombreVeterinaria}
                            placeholder={t.vetNameExample || 'Ej. Veterinaria Luz'}
                            theme={theme}
                        />
                        <Field
                            label={t.location || 'Ubicacion'}
                            icon="location-outline"
                            value={ubiVeterinaria}
                            onChangeText={setUbiVeterinaria}
                            placeholder={t.locationExample || 'Ej. Lopez Portillo'}
                            theme={theme}
                        />
                        <Field
                            label={t.phoneLabel || 'Numero'}
                            icon="call-outline"
                            value={numero}
                            onChangeText={(text) => setNumero(normalizePhone(text))}
                            placeholder={t.phoneExample || 'Ej. 9988776655'}
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
                            <Text style={styles.saveButtonText}>{t.saveVet || 'Guardar veterinaria'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                            <Text style={[styles.cancelText, { color: theme.muted }]}>{t.cancel || 'Cancelar'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 42 },
    heroCard: { borderRadius: 18, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22, marginBottom: 12 },
    heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    heroIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
    heroMiniBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    heroKicker: { color: 'rgba(255,255,255,0.74)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    heroSubtitle: { color: 'rgba(255,255,255,0.79)', fontSize: 13, lineHeight: 18, marginTop: 6 },
    formCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
    fieldWrap: { marginBottom: 12 },
    label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
    inputRow: { minHeight: 48, borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    leftIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 14, paddingVertical: 11 },
    saveButton: { marginTop: 6, minHeight: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    cancelButton: { marginTop: 10, alignItems: 'center', paddingVertical: 6 },
    cancelText: { fontSize: 13, fontWeight: '600' },
});