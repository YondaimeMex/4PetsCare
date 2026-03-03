import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { spacing, borderRadius, lightTheme } from '../../constants';
import { useApp } from '../../context';

export default function FloatingButton({
    onPress,
    icon,
    label,
    position = 'right', // 'left', 'right', 'center'
    style,
}) {
    const { colors: contextColors } = useApp();
    const colors = contextColors || lightTheme;

    const positionStyle = {
        left: { left: spacing.lg },
        right: { right: spacing.lg },
        center: { alignSelf: 'center', left: '50%', marginLeft: -30 },
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                positionStyle[position],
                { backgroundColor: colors.card },
                style
            ]}
            onPress={onPress}
            accessibilityLabel={label}
        >
            <View style={styles.content}>
                {icon}
                {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: spacing.xl,
        padding: spacing.md,
        borderRadius: borderRadius.round,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        minWidth: 60,
        minHeight: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        marginTop: 2,
    },
});
