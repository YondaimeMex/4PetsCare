import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants';

export default function Button({
    onPress,
    title,
    variant = 'primary', // 'primary', 'secondary', 'outline', 'danger'
    size = 'medium', // 'small', 'medium', 'large'
    icon,
    disabled = false,
    style,
}) {
    const variantStyles = {
        primary: {
            backgroundColor: colors.primary,
            textColor: colors.textWhite,
        },
        secondary: {
            backgroundColor: colors.secondary,
            textColor: colors.textWhite,
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.primary,
            textColor: colors.primary,
        },
        danger: {
            backgroundColor: colors.danger,
            textColor: colors.textWhite,
        },
    };

    const sizeStyles = {
        small: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            fontSize: 12,
        },
        medium: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            fontSize: 14,
        },
        large: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            fontSize: 16,
        },
    };

    const currentVariant = variantStyles[variant];
    const currentSize = sizeStyles[size];

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: currentVariant.backgroundColor,
                    borderWidth: currentVariant.borderWidth || 0,
                    borderColor: currentVariant.borderColor,
                    paddingVertical: currentSize.paddingVertical,
                    paddingHorizontal: currentSize.paddingHorizontal,
                    opacity: disabled ? 0.5 : 1,
                },
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={styles.content}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={[
                    styles.text,
                    {
                        color: currentVariant.textColor,
                        fontSize: currentSize.fontSize,
                    }
                ]}>
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: spacing.xs,
    },
    text: {
        ...typography.buttonText,
    },
});
