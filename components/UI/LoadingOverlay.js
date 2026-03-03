import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, lightTheme } from '../../constants';
import { useApp } from '../../context';

export default function LoadingOverlay({
    visible = false,
    message = 'Cargando...',
    showIcon = true,
}) {
    const { colors: contextColors } = useApp();
    const colors = contextColors || lightTheme;

    if (!visible) return null;

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
        >
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.container, { backgroundColor: colors.card }]}>
                    {showIcon && (
                        <MaterialCommunityIcons
                            name="paw"
                            size={40}
                            color={colors.primary}
                            style={styles.icon}
                        />
                    )}
                    <ActivityIndicator
                        size="large"
                        color={colors.primary}
                        style={styles.spinner}
                    />
                    <Text style={[styles.message, { color: colors.text }]}>
                        {message}
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    icon: {
        marginBottom: spacing.md,
    },
    spinner: {
        marginBottom: spacing.md,
    },
    message: {
        ...typography.body,
        textAlign: 'center',
    },
});
