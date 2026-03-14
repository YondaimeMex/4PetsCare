import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context';
import { lightTheme } from '../../constants';

export default function SideMenu() {
    const navigation = useNavigation();
    const { isMenuOpen, closeMenu, colors: contextColors, t, userData } = useApp();
    const colors = contextColors || lightTheme;

    const theme = {
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
    };
    const topInset = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0;

    const menuItems = [
        { name: 'Home', label: t.home || 'Inicio', icon: 'home', iconType: 'ionicons' },
        { name: 'Mascotas', label: t.pets || 'Mascotas', icon: 'paw-outline', iconType: 'ionicons' },
        { name: 'Calendario', label: t.calendar || 'Calendario', icon: 'calendar-number', iconType: 'ionicons' },
        { name: 'Consejos', label: t.tips || 'Consejos', icon: 'tips-and-updates', iconType: 'material' },
        { name: 'Emergencias', label: t.emergencies || 'Emergencias', icon: 'emergency', iconType: 'material' },
        { name: 'Configuracion', label: t.settings || 'Configuración', icon: 'settings', iconType: 'ionicons' },
    ];

    const handleNavigate = (screenName) => {
        closeMenu();
        navigation.navigate(screenName);
    };

    const renderIcon = (item, active = false) => {
        const color = active ? '#FFFFFF' : theme.brand;
        if (item.iconType === 'ionicons') {
            return <Ionicons name={item.icon} size={20} color={color} />;
        }
        return <MaterialIcons name={item.icon} size={20} color={color} />;
    };

    // No renderizar si el menú está cerrado para evitar interceptar toques
    if (!isMenuOpen) return null;

    return (
        <View
            style={[
                styles.sideMenu,
                {
                    backgroundColor: theme.card,
                    borderRightColor: theme.border,
                    paddingTop: topInset + 12,
                }
            ]}
        >
            <View style={styles.menuHeader}>
                <View style={styles.userBlock}>
                    <Image source={{ uri: userData?.avatar }} style={[styles.avatar, { borderColor: `${theme.brand}33` }]} />
                    <View style={styles.userMeta}>
                        <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{userData?.name || 'Usuario'}</Text>
                        <Text style={[styles.userEmail, { color: theme.muted }]} numberOfLines={1}>{userData?.email || ''}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={closeMenu} accessibilityLabel="Cerrar menú">
                    <Ionicons name="close" size={22} color={theme.muted} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.menuTitle, { color: theme.muted }]}>{t.menu || 'Menú'}</Text>

            <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                {menuItems.map((item, index) => {
                    const active = index === 0;
                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[
                                styles.menuItem,
                                {
                                    backgroundColor: active ? theme.brand : theme.card,
                                    borderColor: active ? theme.brand : theme.border,
                                },
                            ]}
                            onPress={() => handleNavigate(item.name)}
                            accessibilityLabel={`Ir a ${item.label}`}
                        >
                            <View style={[styles.menuIconWrap, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : `${theme.brand}14` }]}>
                                {renderIcon(item, active)}
                            </View>
                            <Text style={[styles.menuItemText, { color: active ? '#FFFFFF' : theme.text }]}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color={active ? 'rgba(255,255,255,0.8)' : theme.muted} />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    sideMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 300,
        paddingHorizontal: 14,
        paddingBottom: 10,
        zIndex: 20,
        borderRightWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 8,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        marginTop: 12,
    },
    userBlock: {
        flexDirection: 'row',
        flex: 1,
        paddingRight: 8,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
    },
    userMeta: {
        marginLeft: 9,
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
    },
    userEmail: {
        fontSize: 11,
        marginTop: 2,
    },
    menuTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.7,
        marginBottom: 8,
        marginLeft: 4,
    },
    menuList: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 54,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    menuIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
});
