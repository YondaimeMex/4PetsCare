import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context';
import { spacing, typography, iconSizes, borderRadius, lightTheme } from '../../constants';

export default function SideMenu() {
    const navigation = useNavigation();
    const { isMenuOpen, closeMenu, colors: contextColors, t } = useApp();
    const colors = contextColors || lightTheme;

    const menuItems = [
        { name: 'Home', label: t.home, icon: 'home', iconType: 'ionicons', color: colors.text },
        { name: 'Mascotas', label: t.pets, icon: 'paw-outline', iconType: 'ionicons', color: colors.success },
        { name: 'Calendario', label: t.calendar, icon: 'calendar-number', iconType: 'ionicons', color: colors.secondary },
        { name: 'Consejos', label: t.tips, icon: 'tips-and-updates', iconType: 'material', color: colors.warning },
        { name: 'Emergencias', label: t.emergencies, icon: 'emergency', iconType: 'material', color: colors.danger },
    ];

    const handleNavigate = (screenName) => {
        closeMenu();
        navigation.navigate(screenName);
    };

    const renderIcon = (item) => {
        if (item.iconType === 'ionicons') {
            return <Ionicons name={item.icon} size={iconSizes.lg} color={item.color} />;
        }
        return <MaterialIcons name={item.icon} size={iconSizes.lg} color={item.color} />;
    };

    // No renderizar si el menú está cerrado para evitar interceptar toques
    if (!isMenuOpen) return null;

    return (
        <View
            style={[
                styles.sideMenu,
                {
                    backgroundColor: colors.background,
                }
            ]}
        >
            {/* Header del menú */}
            <View style={styles.menuHeader}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{t.menu}</Text>
                <TouchableOpacity onPress={closeMenu} accessibilityLabel="Cerrar menú">
                    <Ionicons name="close" size={iconSizes.lg} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Items del menú */}
            {menuItems.map((item) => (
                <TouchableOpacity
                    key={item.name}
                    style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                    onPress={() => handleNavigate(item.name)}
                    accessibilityLabel={`Ir a ${item.label}`}
                >
                    {renderIcon(item)}
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    sideMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 280,
        padding: spacing.lg,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingTop: spacing.xl,
    },
    menuTitle: {
        ...typography.title,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        borderBottomWidth: 1,
    },
    menuItemText: {
        ...typography.menuItem,
        marginLeft: spacing.md,
    },
});
