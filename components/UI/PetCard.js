import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../constants';

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
    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>Mascota: "{name}"</Text>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Edad:</Text>
                <Text style={styles.detailValue}>{age}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Peso:</Text>
                <Text style={styles.detailValue}>{weight}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Raza:</Text>
                <Text style={styles.detailValue}>{breed}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tipo:</Text>
                <Text style={styles.detailValue}>{type}</Text>
            </View>

            {nextVaccine && (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Próx Vacuna:</Text>
                    <Text style={styles.detailValue}>{nextVaccine}</Text>
                </View>
            )}

            {imageUrl && (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.petImage}
                />
            )}

            {onVaccinePress && (
                <TouchableOpacity style={styles.vaccineButton} onPress={onVaccinePress}>
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
        backgroundColor: colors.card,
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
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        alignSelf: 'flex-start',
    },
});
