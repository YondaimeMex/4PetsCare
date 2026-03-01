import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography, borderRadius } from '../../constants';
import { useApp } from '../../context';

export default function Card({
    children,
    title,
    subtitle,
    style,
    contentStyle,
}) {
    const { colors } = useApp();

    return (
        <View style={[styles.card, { backgroundColor: colors.card }, style]}>
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
