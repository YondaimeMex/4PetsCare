import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper, EmptyState } from '../components';

// Diccionario centralizado de imágenes por especie
const IMAGES = {
    default: 'https://images.pexels.com/photos/662417/pexels-photo-662417.jpeg',
    perro: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
    gato: 'https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg',
    ave: 'https://images.pexels.com/photos/6279041/pexels-photo-6279041.jpeg',
    acuatico: 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg',
    reptil: 'https://images.pexels.com/photos/735174/pexels-photo-735174.jpeg',
    fallback: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg',
};

const getImageForEspecie = (m) => {
    if (m?.image) return m.image;
    const especie = m?.especie?.toLowerCase() || '';
    if (!especie) return IMAGES.default;
    if (especie.includes('perro') || especie.includes('dog')) return IMAGES.perro;
    if (especie.includes('gato') || especie.includes('cat')) return IMAGES.gato;
    if (especie.includes('ave')) return IMAGES.ave;
    if (especie.includes('acuatico')) return IMAGES.acuatico;
    if (especie.includes('reptil')) return IMAGES.reptil;
    return IMAGES.fallback;
};

function PetCard({ mascota, theme, onPress, onDelete, onVaccine, t }) {
    return (
        <TouchableOpacity
            style={[styles.petCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Image
                source={{ uri: getImageForEspecie(mascota) }}
                style={styles.petImage}
            />
            <View style={styles.petBody}>
                <Text style={[styles.petName, { color: theme.text }]}>{mascota.nombre}</Text>

                <View style={styles.chipRow}>
                    {mascota.especie ? (
                        <View style={[styles.chip, { backgroundColor: `${theme.brandSoft}18` }]}>
                            <Text style={[styles.chipText, { color: theme.brandSoft }]}>{mascota.especie}</Text>
                        </View>
                    ) : null}
                    {mascota.raza ? (
                        <View style={[styles.chip, { backgroundColor: `${theme.muted}14` }]}>
                            <Text style={[styles.chipText, { color: theme.muted }]}>{mascota.raza}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.metaRow}>
                    {mascota.edad ? (
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={13} color={theme.muted} />
                            <Text style={[styles.metaText, { color: theme.muted }]}>{mascota.edad}</Text>
                        </View>
                    ) : null}
                    {mascota.peso ? (
                        <View style={styles.metaItem}>
                            <Ionicons name="barbell-outline" size={13} color={theme.muted} />
                            <Text style={[styles.metaText, { color: theme.muted }]}>{mascota.peso} kg</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: `${theme.brandSoft}18` }]}
                        onPress={onVaccine}
                    >
                        <Ionicons name="medkit-outline" size={15} color={theme.brandSoft} />
                        <Text style={[styles.actionBtnText, { color: theme.brandSoft }]}>{t.vaccineAction || 'Vacuna'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#E5393514' }]}
                        onPress={onDelete}
                    >
                        <Ionicons name="trash-outline" size={15} color="#E53935" />
                        <Text style={[styles.actionBtnText, { color: '#E53935' }]}>{t.removeAction || 'Eliminar'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function Mascotas() {
    const navigation = useNavigation();
    const { colors, t } = useApp();

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        accent: colors?.accent || '#FF7F5A',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
    }), [colors]);

    const [listaMascotas, setListaMascotas] = useState([]);

    const loadMascotas = async () => {
        try {
            const raw = await AsyncStorage.getItem('@mascotas');
            setListaMascotas(raw ? JSON.parse(raw) : []);
        } catch {
            Alert.alert(t.error || 'Error', t.loadPetsError || 'No se pudieron cargar las mascotas.');
        }
    };

    const deleteMascota = (mascota) => {
        Alert.alert(
            t.removeAction || 'Eliminar',
            `${t.deleteQuestion || 'Eliminar a'} ${mascota.nombre}?`,
            [
                { text: t.cancel || 'Cancelar', style: 'cancel' },
                {
                    text: t.delete || 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const raw = await AsyncStorage.getItem('@mascotas');
                            const arr = raw ? JSON.parse(raw) : [];
                            const filtered = arr.filter(m => m.id !== mascota.id);
                            await AsyncStorage.setItem('@mascotas', JSON.stringify(filtered));
                            setListaMascotas(filtered);
                        } catch {
                            Alert.alert(t.error || 'Error', t.deletePetError || 'No se pudo eliminar la mascota.');
                        }
                    },
                },
            ]
        );
    };

    useFocusEffect(useCallback(() => { loadMascotas(); }, []));

    const ListHeader = () => (
        <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
            <View style={styles.heroGlowTop} />
            <View style={styles.heroGlowBottom} />
            <View style={styles.heroTopRow}>
                <View style={styles.heroTopInfo}>
                    <Text style={styles.heroKicker}>{t.myPetsKicker || 'MIS MASCOTAS'}</Text>
                    <Text style={styles.heroTitle} numberOfLines={2}>{t.furryFamilyTitle || 'Tu familia peluda'}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.heroAddBtn, { backgroundColor: theme.accent }]}
                    onPress={() => navigation.navigate('RegistroMascota')}
                    activeOpacity={0.85}
                >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.heroAddText} numberOfLines={1}>{t.add || 'Agregar'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.heroPillRow}>
                <View style={styles.heroPill}>
                    <Ionicons name="paw" size={13} color="#FFFFFF" />
                    <Text style={styles.heroPillText}>
                        {listaMascotas.length} {listaMascotas.length === 1 ? (t.petCountSingle || 'mascota') : (t.petCountPlural || 'mascotas')}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.heroPill}
                    onPress={() => navigation.navigate('ProgramarCita')}
                >
                    <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.heroPillText} numberOfLines={1}>{t.scheduleAppointmentCta || 'Programar cita'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenWrapper>
            <FlatList
                data={listaMascotas}
                keyExtractor={(item) => String(item.id)}
                style={{ backgroundColor: theme.bg }}
                contentContainerStyle={[
                    styles.listContent,
                    listaMascotas.length === 0 && { flexGrow: 1 },
                ]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<ListHeader />}
                ListEmptyComponent={
                    <EmptyState
                        icon="paw"
                        title={t.noPets || 'No tienes mascotas registradas'}
                        message={t.noPetsMessage || 'Registra tu primera mascota para comenzar a cuidarla'}
                        actionLabel={t.addPet || 'Agregar Mascota'}
                        onAction={() => navigation.navigate('RegistroMascota')}
                    />
                }
                renderItem={({ item: mascota }) => (
                    <PetCard
                        mascota={mascota}
                        theme={theme}
                        t={t}
                        onPress={() =>
                            navigation.navigate('PerfilMascotaStack', {
                                screen: 'PerfilMascota',
                                params: { mascota },
                            })
                        }
                        onDelete={() => deleteMascota(mascota)}
                        onVaccine={() => navigation.navigate('ConfirmacionVacuna', { mascota })}
                    />
                )}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    /* Hero */
    heroCard: {
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 28,
        marginBottom: 16,
        overflow: 'hidden',
    },
    heroGlowTop: {
        position: 'absolute',
        top: -42,
        right: -24,
        width: 145,
        height: 145,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroGlowBottom: {
        position: 'absolute',
        bottom: -56,
        left: -22,
        width: 130,
        height: 130,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    heroTopInfo: {
        flex: 1,
        minWidth: 0,
        paddingRight: 8,
    },
    heroKicker: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
    heroAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        gap: 5,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    heroAddText: {
        flexShrink: 1,
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    heroPillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    heroPill: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '100%',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.22)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 11,
    },
    heroPillText: {
        flexShrink: 1,
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    /* List */
    listContent: {
        paddingBottom: 40,
    },
    /* Pet card */
    petCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    petImage: {
        width: 110,
        height: '100%',
        minHeight: 140,
    },
    petBody: {
        flex: 1,
        padding: 14,
        justifyContent: 'space-between',
    },
    petName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 6,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    chip: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    chipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
