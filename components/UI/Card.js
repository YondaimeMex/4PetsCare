import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { spacing, typography, borderRadius, lightTheme } from '../../constants';
import { useApp } from '../../context';

export default function Card({
    children,
    title,
    subtitle,
    style,
    contentStyle,
    elevated = true,
}) {
    const { colors: contextColors, isDarkMode } = useApp();
    const colors = contextColors || lightTheme;

    const shadowStyle = elevated && !isDarkMode ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    } : elevated && isDarkMode ? {
        borderWidth: 1,
        borderColor: colors.border,
    } : {};

    return (
        <View style={[
            styles.card,
            { backgroundColor: colors.card },
            shadowStyle,
            style
        ]}>
            {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
            {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
            <View style={contentStyle}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.sectionTitle,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.bodySmall,
        marginBottom: spacing.sm,
    },
});
