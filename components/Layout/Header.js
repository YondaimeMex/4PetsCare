import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context';
import { spacing, iconSizes } from '../../constants';

export default function Header({
    showMenu = true,
    showNotifications = true,
    showProfile = true,
    showBack = false,
}) {
    const navigation = useNavigation();
    const { toggleMenu, toggleNotifications, colors } = useApp();

    return (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            {/* Lado izquierdo */}
            <View style={styles.headerLeft}>
                {showBack && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.goBack()}
                        accessibilityLabel="Volver"
                    >
                        <Ionicons name="arrow-back" size={iconSizes.lg} color={colors.text} />
                    </TouchableOpacity>
                )}

                {showMenu && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={toggleMenu}
                        accessibilityLabel="Abrir menú"
                    >
                        <MaterialIcons name="menu" size={iconSizes.lg} color={colors.text} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Lado derecho */}
            <View style={styles.headerRight}>
                {showNotifications && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={toggleNotifications}
                        accessibilityLabel="Ver notificaciones"
                    >
                        <Ionicons name="notifications" size={iconSizes.lg} color={colors.text} />
                    </TouchableOpacity>
                )}

                {showProfile && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Perfil')}
                        accessibilityLabel="Ir al perfil"
                    >
                        <Ionicons name="person-circle-outline" size={iconSizes.lg} color={colors.text} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: 50,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconButton: {
        padding: spacing.xs,
    },
});
