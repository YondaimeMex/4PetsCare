import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, lightTheme } from '../../constants';
import { useApp } from '../../context';

export default function PetCard({
    name,
    age,
    weight,
    breed,
    type,
    nextVaccine,
    imageUrl,
    onVaccinePress,
    style,
}) {
    const { colors: contextColors } = useApp();
    const colors = contextColors || lightTheme;

    return (
        <View style={[styles.card, { backgroundColor: colors.card }, style]}>
            <Text style={[styles.title, { color: colors.text }]}>Mascota: "{name}"</Text>

            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>Edad:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{age}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>Peso:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{weight}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>Raza:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{breed}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>Tipo:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{type}</Text>
            </View>

            {nextVaccine && (
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textLight }]}>Próx Vacuna:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{nextVaccine}</Text>
                </View>
            )}

            {imageUrl && (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.petImage}
                />
            )}

            {onVaccinePress && (
                <TouchableOpacity 
                    style={[styles.vaccineButton, { backgroundColor: colors.background }]} 
                    onPress={onVaccinePress}
                >
                    <FontAwesome5 name="syringe" size={18} color={colors.secondary} />
                    <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.success}
                        style={{ marginLeft: 5 }}
                    />
                </TouchableOpacity>
            )}
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
        ...typography.subtitle,
        marginBottom: spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    detailLabel: {
        ...typography.label,
        width: 100,
    },
    detailValue: {
        ...typography.body,
        flex: 1,
    },
    petImage: {
        width: '100%',
        height: 150,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    vaccineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        alignSelf: 'flex-start',
    },
});
