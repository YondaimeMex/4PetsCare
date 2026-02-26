import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants';

export default function EmptyState({
    icon = 'paw',
    title = 'No hay datos',
    message = 'Aún no hay información disponible',
    iconSize = 60,
}) {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons
                name={icon}
                size={iconSize}
                color={colors.textMuted}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
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
    title: {
        ...typography.subtitle,
        color: colors.textLight,
        marginTop: spacing.md,
    },
    message: {
        ...typography.bodySmall,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});
