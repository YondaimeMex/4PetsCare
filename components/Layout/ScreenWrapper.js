import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from './Header';
import SideMenu from './SideMenu';
import NotificationsPanel from './NotificationsPanel';
import { useApp } from '../../context';

export default function ScreenWrapper({
    children,
    showMenu = true,
    showNotifications = true,
    showProfile = true,
    showBack = false,
    showHeader = true,
    style,
}) {
    const { isOverlayVisible, closeAll, colors, isDarkMode } = useApp();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, style]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />

            {/* Header */}
            {showHeader && (
                <Header
                    showMenu={showMenu}
                    showNotifications={showNotifications}
                    showProfile={showProfile}
                    showBack={showBack}
                />
            )}

            {/* Contenido principal */}
            <View style={styles.content}>
                {children}
            </View>

            {/* Overlay oscuro */}
            {isOverlayVisible && (
                <TouchableOpacity
                    style={[styles.overlay, { backgroundColor: colors.overlay }]}
                    activeOpacity={1}
                    onPress={closeAll}
                />
            )}

            {/* Menú lateral */}
            <SideMenu />

            {/* Panel de notificaciones */}
            <NotificationsPanel />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
});
