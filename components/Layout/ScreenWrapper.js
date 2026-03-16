import React, { useCallback, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from './Header';
import SideMenu from './SideMenu';
import NotificationsPanel from './NotificationsPanel';
import TutorialOverlay from './TutorialOverlay';
import { useApp } from '../../context';
import { lightTheme } from '../../constants';

export default function ScreenWrapper({
    children,
    showMenu = true,
    showNotifications = true,
    showProfile = true,
    showBack = false,
    showHeader = true,
    style,
}) {
    const {
        isOverlayVisible,
        isMenuOpen,
        isNotificationsOpen,
        closeAll,
        colors: contextColors,
        isDarkMode,
        registerTutorialViewport,
    } = useApp();
    const colors = contextColors || lightTheme;
    const containerRef = useRef(null);

    const measureViewport = useCallback(() => {
        setTimeout(() => {
            containerRef.current?.measureInWindow((x, y, width, height) => {
                if (width > 0 && height > 0) {
                    registerTutorialViewport({ x, y, width, height });
                }
            });
        }, 0);
    }, [registerTutorialViewport]);

    return (
        <SafeAreaView
            ref={containerRef}
            onLayout={measureViewport}
            style={[styles.container, { backgroundColor: colors.background }, style]}
        >
            <StatusBar
                style={isDarkMode ? 'light' : 'dark'}
                translucent={false}
                backgroundColor={colors.background}
            />

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
            <View style={[styles.content, showHeader && styles.contentWithHeader]}>
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
            {isMenuOpen && <SideMenu />}

            {/* Panel de notificaciones */}
            {isNotificationsOpen && <NotificationsPanel />}

            {/* Tutorial guiado */}
            <TutorialOverlay />
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
    contentWithHeader: {
        paddingTop: 2,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 15,
    },
});
