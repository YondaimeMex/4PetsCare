import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';

function VetCard({ vet, theme, onCall }) {
    return (
        <View style={[styles.vetCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.vetHeader}>
                <View style={[styles.vetIcon, { backgroundColor: `${theme.danger}18` }]}>
                    <Ionicons name="medical-outline" size={18} color={theme.danger} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.vetName, { color: theme.text }]}>{vet.name}</Text>
                    <Text style={[styles.vetAddress, { color: theme.muted }]}>{vet.address}</Text>
                </View>
            </View>

            {vet.phone ? (
                <View style={styles.metaRow}>
                    <Ionicons name="call-outline" size={15} color={theme.muted} />
                    <Text style={[styles.metaText, { color: theme.text }]}>{vet.phone}</Text>
                </View>
            ) : null}

            {vet.hours ? (
                <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={15} color={theme.muted} />
                    <Text style={[styles.metaText, { color: theme.text }]}>{vet.hours}</Text>
                </View>
            ) : null}

            <TouchableOpacity
                style={[
                    styles.callBtn,
                    { backgroundColor: vet.phone ? theme.danger : theme.border },
                ]}
                disabled={!vet.phone}
                onPress={() => onCall(vet.phone)}
            >
                <Ionicons name="call" size={18} color="#FFFFFF" />
                <Text style={styles.callBtnText}>Llamar ahora</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function Emergencias() {
    const navigation = useNavigation();
    const { colors, t } = useApp();
    const [veterinarias, setVeterinarias] = useState([]);

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        danger: colors?.danger || '#E53935',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
        accent: colors?.accent || '#FF7F5A',
    }), [colors]);

    const loadVeterinarias = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@veterinarias');
            const data = jsonValue != null ? JSON.parse(jsonValue) : [];

            const mapped = data
                .map((vet, index) => ({
                    id: vet.id ?? `${vet.label || vet.name || 'vet'}-${index}`,
                    name: vet.label || vet.name || 'Veterinaria sin nombre',
                    phone: vet.numero || vet.phone || '',
                    address: vet.ubicacion || vet.address || 'Ubicación no disponible',
                    hours: vet.hours || '',
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setVeterinarias(mapped);
        } catch (error) {
            console.error('Error cargando veterinarias en Emergencias:', error);
            setVeterinarias([]);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadVeterinarias();
        }, [])
    );

    const handleCall = (phone) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <ScreenWrapper>
            <FlatList
                data={veterinarias}
                keyExtractor={(item) => String(item.id)}
                style={{ backgroundColor: theme.bg }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroGlowTop} />
                        <View style={styles.heroGlowBottom} />
                        <Text style={styles.heroKicker}>EMERGENCIAS</Text>
                        <Text style={styles.heroTitle}>{t.emergencies || 'Atención inmediata'}</Text>
                        <Text style={styles.heroSubtitle}>{t.emergencyContacts || 'Contactos veterinarios de respaldo'}</Text>
                        <View style={styles.heroPills}>
                            <View style={styles.heroPill}>
                                <Ionicons name="medkit-outline" size={13} color="#FFFFFF" />
                                <Text style={styles.heroPillText}>{veterinarias.length} registradas</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.heroAddBtn, { backgroundColor: theme.accent }]}
                                onPress={() => navigation.navigate('RegistroVeterinaria')}
                            >
                                <Ionicons name="add" size={16} color="#FFFFFF" />
                                <Text style={styles.heroAddText}>Agregar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="medical-outline" size={28} color={theme.muted} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin contactos de emergencia</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.muted }]}>
                            Registra una veterinaria para tener un acceso rápido en caso urgente.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <VetCard vet={item} theme={theme} onCall={handleCall} />
                )}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.brand }]}
                onPress={() => navigation.navigate('RegistroVeterinaria')}
                activeOpacity={0.85}
            >
                <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 88,
    },
    heroCard: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 22,
        marginBottom: 14,
        overflow: 'hidden',
    },
    heroGlowTop: {
        position: 'absolute',
        right: -30,
        top: -35,
        width: 125,
        height: 125,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroGlowBottom: {
        position: 'absolute',
        left: -32,
        bottom: -40,
        width: 115,
        height: 115,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.08)',
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
        fontSize: 23,
        fontWeight: '800',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 13,
        marginTop: 6,
    },
    heroPills: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    heroPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    heroPillText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    heroAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    heroAddText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    vetCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
    },
    vetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    vetIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    vetName: {
        fontSize: 15,
        fontWeight: '700',
    },
    vetAddress: {
        fontSize: 12,
        marginTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    metaText: {
        marginLeft: 6,
        fontSize: 13,
    },
    callBtn: {
        marginTop: 10,
        minHeight: 42,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    callBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    emptyCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        alignItems: 'center',
    },
    emptyTitle: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: '700',
    },
    emptySubtitle: {
        marginTop: 6,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    fab: {
        position: 'absolute',
        right: 18,
        bottom: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
});