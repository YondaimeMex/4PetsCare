import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform, StatusBar as RNStatusBar } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context';
import { spacing, lightTheme } from '../../constants';

export default function Header({
    showMenu = true,
    showNotifications = true,
    showProfile = true,
    showBack = false,
}) {
    const navigation = useNavigation();
    const route = useRoute();
    const { toggleMenu, toggleNotifications, colors: contextColors, notifications, t } = useApp();
    const colors = contextColors || lightTheme;

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
    }), [colors]);

    const screenLabels = {
        Home: t.home || 'Inicio',
        Perfil: t.profile || 'Perfil',
        Mascotas: t.pets || 'Mascotas',
        RegistroMascota: t.registerPet || 'Registrar mascota',
        RegistroVeterinaria: 'Registrar veterinaria',
        Calendario: t.calendar || 'Calendario',
        ProgramarCita: 'Programar cita',
        EditarCita: 'Editar cita',
        EditarVacuna: 'Editar vacuna',
        ConfirmacionVacuna: 'Confirmar vacuna',
        VacunaRegistrada: 'Vacuna registrada',
        Consejos: t.tips || 'Consejos',
        Emergencias: t.emergencies || 'Emergencias',
        Mapas: 'Mapa vet',
        BuscadorGoogle: 'Buscador',
        Configuracion: t.settings || 'Configuración',
        EditarPerfil: t.editProfile || 'Editar perfil',
        Recuperación: 'Recuperación',
        Registro: 'Registro',
    };

    const title = screenLabels[route.name] || route.name;
    const topInset = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0;

    return (
        <View style={[styles.safeTopWrap, { paddingTop: topInset + 8 }]}>
            <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.headerLeft}>
                    {showBack && (
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: `${theme.brand}14` }]}
                            onPress={() => navigation.goBack()}
                            accessibilityLabel="Volver"
                        >
                            <Ionicons name="arrow-back" size={20} color={theme.brand} />
                        </TouchableOpacity>
                    )}

                    {showMenu && (
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: `${theme.brand}14` }]}
                            onPress={toggleMenu}
                            accessibilityLabel="Abrir menú"
                        >
                            <MaterialIcons name="menu" size={20} color={theme.brand} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.centerBlock}>
                    <Text style={[styles.titleText, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                    <Text style={[styles.subtitleText, { color: theme.muted }]} numberOfLines={1}>4PetsCare</Text>
                </View>

                <View style={styles.headerRight}>
                    {showNotifications && (
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: `${theme.brand}14` }]}
                            onPress={toggleNotifications}
                            accessibilityLabel="Ver notificaciones"
                        >
                            <Ionicons name="notifications-outline" size={20} color={theme.brand} />
                            {notifications.length > 0 ? (
                                <View style={[styles.badge, { backgroundColor: theme.brand }]}>
                                    <Text style={styles.badgeText}>{Math.min(notifications.length, 9)}</Text>
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    )}

                    {showProfile && (
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: `${theme.brand}14` }]}
                            onPress={() => navigation.navigate('Perfil')}
                            accessibilityLabel="Ir al perfil"
                        >
                            <Ionicons name="person-circle-outline" size={20} color={theme.brand} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeTopWrap: {
        paddingHorizontal: 16,
        paddingBottom: 6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1,
        minHeight: 68,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 92,
        gap: 8,
    },
    centerBlock: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    titleText: {
        fontSize: 15,
        fontWeight: '800',
    },
    subtitleText: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: '500',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 92,
        justifyContent: 'flex-end',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
    },
});
