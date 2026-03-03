import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../../context';
import { spacing, typography, borderRadius, lightTheme } from '../../constants';

// Componente para cada notificación
const NotificationItem = ({ text, colors }) => (
    <View style={[styles.notificationItem, { borderBottomColor: colors.border }]}>
        <View style={[styles.bullet, { backgroundColor: colors.notificationDot }]} />
        <Text style={[styles.notificationText, { color: colors.text }]}>{text}</Text>
    </View>
);

export default function NotificationsPanel() {
    const { isNotificationsOpen, notifications, colors: contextColors, t } = useApp();
    const colors = contextColors || lightTheme;

    if (!isNotificationsOpen) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.headerText, { color: colors.text }]}>{t.notifications}</Text>

            {notifications.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t.noNotifications}</Text>
            ) : (
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {notifications.map((text, index) => (
                        <NotificationItem key={index} text={text} colors={colors} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        right: spacing.lg,
        width: 300,
        maxHeight: 400,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerText: {
        ...typography.subtitle,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    list: {
        flexGrow: 0,
    },
    emptyText: {
        ...typography.body,
        textAlign: 'center',
        paddingVertical: spacing.lg,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
        marginTop: 5,
    },
    notificationText: {
        ...typography.body,
        flex: 1,
    },
});
