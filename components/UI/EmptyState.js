import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, lightTheme } from '../../constants';
import { useApp } from '../../context';

export default function EmptyState({
    icon = 'paw',
    title = 'No hay datos',
    message = 'Aún no hay información disponible',
    iconSize = 80,
    actionLabel,
    onAction,
}) {
    const { colors: contextColors } = useApp();
    const colors = contextColors || lightTheme;

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundLight }]}>
                <MaterialCommunityIcons
                    name={icon}
                    size={iconSize}
                    color={colors.primary}
                />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={onAction}
                >
                    <Text style={[styles.actionButtonText, { color: colors.textWhite }]}>
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.subtitle,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    message: {
        ...typography.bodySmall,
        textAlign: 'center',
        marginTop: spacing.xs,
        paddingHorizontal: spacing.lg,
    },
    actionButton: {
        marginTop: spacing.xl,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
    },
    actionButtonText: {
        ...typography.buttonText,
    },
});
