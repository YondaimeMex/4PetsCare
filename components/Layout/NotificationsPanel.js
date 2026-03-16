import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context';

function NotificationItem({ text, theme, index }) {
    return (
        <View
            style={[
                styles.notificationItem,
                { borderBottomColor: theme.border },
            ]}
        >
            <View style={[styles.bullet, { backgroundColor: theme.brandSoft }]} />
            <View style={styles.contentWrap}>
                <Text style={[styles.notificationText, { color: theme.text }]}>{text}</Text>
                <Text style={[styles.metaText, { color: theme.muted }]}>Notificación {index + 1}</Text>
            </View>
        </View>
    );
}

export default function NotificationsPanel() {
    const { isNotificationsOpen, notifications, colors, t } = useApp();
    const topInset = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0;

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        bg: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
    }), [colors]);

    if (!isNotificationsOpen) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border, top: topInset + 94 }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View style={styles.headerLeft}>
                    <View style={[styles.headerIconWrap, { backgroundColor: `${theme.brand}14` }]}>
                        <Ionicons name="notifications-outline" size={16} color={theme.brand} />
                    </View>
                    <Text style={[styles.headerText, { color: theme.text }]}>{t.notifications || 'Notificaciones'}</Text>
                </View>
                <View style={[styles.countPill, { backgroundColor: `${theme.brandSoft}1f` }]}>
                    <Text style={[styles.countPillText, { color: theme.brandSoft }]}>{notifications.length}</Text>
                </View>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <Ionicons name="mail-open-outline" size={20} color={theme.muted} />
                    <Text style={[styles.emptyText, { color: theme.muted }]}>{t.noNotifications || 'Sin notificaciones'}</Text>
                </View>
            ) : (
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                    {notifications.map((text, index) => (
                        <NotificationItem key={index} text={text} theme={theme} index={index} />
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity style={[styles.footerBtn, { borderTopColor: theme.border }]} activeOpacity={0.8}>
                <Text style={[styles.footerBtnText, { color: theme.brand }]}>Ver todas</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 16,
        width: 320,
        maxHeight: 420,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        zIndex: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 8,
    },
    header: {
        minHeight: 52,
        borderBottomWidth: 1,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    headerText: {
        fontSize: 15,
        fontWeight: '700',
    },
    countPill: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    countPillText: {
        fontSize: 12,
        fontWeight: '700',
    },
    list: {
        maxHeight: 308,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 11,
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 8,
    },
    contentWrap: {
        flex: 1,
    },
    notificationText: {
        fontSize: 13,
        lineHeight: 18,
    },
    metaText: {
        fontSize: 11,
        marginTop: 3,
    },
    emptyWrap: {
        minHeight: 120,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyText: {
        fontSize: 13,
    },
    footerBtn: {
        minHeight: 42,
        borderTopWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
});