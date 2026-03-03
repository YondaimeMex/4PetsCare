import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context';
import { ScreenWrapper, Card, FloatingButton, EmptyState } from '../components';
import { spacing, typography, borderRadius, lightTheme } from '../constants';

// Diccionario centralizado de imágenes por especie
const IMAGES = {
    default: 'https://images.pexels.com/photos/662417/pexels-photo-662417.jpeg',
    perro: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
    gato: 'https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg',
    ave: 'https://images.pexels.com/photos/6279041/pexels-photo-6279041.jpeg',
    acuatico: 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg',
    reptil: 'https://images.pexels.com/photos/735174/pexels-photo-735174.jpeg',
    fallback: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
};

const getImageForEspecie = (m) => {
    if (m?.image) return m.image;
    const especie = m?.especie?.toLowerCase() || '';
    if (!especie) return IMAGES.default;

    if (especie.includes('domestico')) {
        const domesticOptions = [IMAGES.perro, IMAGES.gato];
        return domesticOptions[Math.floor(Math.random() * domesticOptions.length)];
    }
    if (especie.includes('perro') || especie.includes('dog')) return IMAGES.perro;
    if (especie.includes('gato') || especie.includes('cat')) return IMAGES.gato;
    if (especie.includes('ave')) return IMAGES.ave;
    if (especie.includes('acuatico')) return IMAGES.acuatico;
    if (especie.includes('reptil') || especie.includes('reptiles')) return IMAGES.reptil;

    return IMAGES.fallback;
};

// Componente para tarjeta de mascota
const PetCardItem = ({ mascota, onPress, onDelete, onVaccine, colors }) => (
    <TouchableOpacity onPress={onPress}>
        <Card style={styles.petCard}>
            <View style={styles.petCardContent}>
                <View style={styles.petInfo}>
                    <Text style={[styles.petName, { color: colors.text }]}>
                        {mascota.nombre}
                    </Text>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Especie:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{mascota.especie || '-'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Edad:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{mascota.edad || '-'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Peso:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{mascota.peso ? `${mascota.peso} kg` : '-'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Raza:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{mascota.raza || '-'}</Text>
                    </View>
                </View>
                <Image
                    source={{ uri: getImageForEspecie(mascota) }}
                    style={styles.petImage}
                />
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${colors.secondary}15` }]}
                    onPress={onVaccine}
                >
                    <Ionicons name="medkit" size={18} color={colors.secondary} />
                    <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Vacuna</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: `${colors.danger}15` }]}
                    onPress={onDelete}
                >
                    <Ionicons name="trash" size={18} color={colors.danger} />
                    <Text style={[styles.actionButtonText, { color: colors.danger }]}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </Card>
    </TouchableOpacity>
);

export default function Mascotas() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { colors: contextColors, t } = useApp();
    const colors = contextColors || lightTheme;

    const [listaMascotas, setListaMascotas] = useState([]);

    const loadMascotas = async () => {
        try {
            const raw = await AsyncStorage.getItem('@mascotas');
            const arr = raw ? JSON.parse(raw) : [];
            setListaMascotas(arr);
        } catch (err) {
            console.error('loadMascotas error:', err);
            Alert.alert('Error', 'No se pudieron cargar las mascotas.');
        }
    };

    const deleteMascota = async (mascota) => {
        Alert.alert(
            'Eliminar',
            `¿Eliminar a ${mascota.nombre}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const raw = await AsyncStorage.getItem('@mascotas');
                            const arr = raw ? JSON.parse(raw) : [];
                            const filtered = arr.filter(m => m.id !== mascota.id);
                            await AsyncStorage.setItem('@mascotas', JSON.stringify(filtered));
                            setListaMascotas(filtered);
                        } catch (err) {
                            Alert.alert('Error', 'No se pudo eliminar la mascota.');
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        if (isFocused) loadMascotas();
    }, [isFocused]);

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Título de la pantalla */}
                <Text style={[styles.screenTitle, { color: colors.text }]}>
                    {t.myPets || 'Mis Mascotas'}
                </Text>

                {listaMascotas.length === 0 ? (
                    <EmptyState
                        icon="paw"
                        title={t.noPets || 'No tienes mascotas registradas'}
                        message="Registra tu primera mascota para comenzar a cuidarla"
                        actionLabel={t.addPet || 'Agregar Mascota'}
                        onAction={() => navigation.navigate('RegistroMascota')}
                    />
                ) : (
                    listaMascotas.map((mascota) => (
                        <PetCardItem
                            key={mascota.id}
                            mascota={mascota}
                            colors={colors}
                            onPress={() =>
                                navigation.navigate("PerfilMascotaStack", {
                                    screen: "PerfilMascota",
                                    params: { mascota }
                                })
                            }
                            onDelete={() => deleteMascota(mascota)}
                            onVaccine={() => navigation.navigate('ConfirmacionVacuna', { mascota })}
                        />
                    ))
                )}
            </ScrollView>

            {/* Botones flotantes */}
            <FloatingButton
                position="left"
                icon={<MaterialIcons name="edit-calendar" size={24} color={colors.textWhite} />}
                onPress={() => navigation.navigate('ProgramarCita')}
                style={{ backgroundColor: colors.secondary }}
            />
            <FloatingButton
                position="right"
                icon={<MaterialIcons name="add" size={28} color={colors.textWhite} />}
                onPress={() => navigation.navigate('RegistroMascota')}
                style={{ backgroundColor: colors.success }}
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
    screenTitle: {
        ...typography.title,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    petCard: {
        marginBottom: spacing.md,
    },
    petCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    petInfo: {
        flex: 1,
        paddingRight: spacing.md,
    },
    petName: {
        ...typography.subtitle,
        marginBottom: spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    detailLabel: {
        ...typography.bodySmall,
        fontWeight: '600',
        width: 70,
    },
    detailValue: {
        ...typography.bodySmall,
        flex: 1,
    },
    petImage: {
        width: 100,
        height: 120,
        borderRadius: borderRadius.md,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    actionButtonText: {
        ...typography.caption,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
});
