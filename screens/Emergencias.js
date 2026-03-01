import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card, FloatingButton } from '../components';
import { spacing, typography } from '../constants';
import { useApp } from '../context';

const veterinariasData = [
    {
        id: 1,
        name: 'Veterinaria Luz',
        phone: '9988776655',
        address: 'Av. Portillo #123',
        hours: '24 horas',
    },
    {
        id: 2,
        name: 'Veterinaria Lares',
        phone: '9988776655',
        address: 'Av. Andres Quintana Roo #456',
        hours: 'Lun-Dom 8:00 - 22:00',
    },
];

export default function Emergencias() {
    const navigation = useNavigation();
    const { colors, t } = useApp();

    const handleCall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={[styles.screenTitle, { color: colors.danger }]}>{t.emergencies}</Text>
                <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>
                    {t.emergencyContacts}
                </Text>

                {veterinariasData.map((vet) => (
                    <Card key={vet.id}>
                        <View style={styles.vetHeader}>
                            <Ionicons name="medical" size={24} color={colors.danger} />
                            <Text style={[styles.vetName, { color: colors.text }]}>{vet.name}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={18} color={colors.textMuted} />
                            <Text style={[styles.infoText, { color: colors.text }]}>{vet.phone}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={18} color={colors.textMuted} />
                            <Text style={[styles.infoText, { color: colors.text }]}>{vet.address}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={18} color={colors.textMuted} />
                            <Text style={[styles.infoText, { color: colors.text }]}>{vet.hours}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.callButton, { backgroundColor: colors.success }]}
                            onPress={() => handleCall(vet.phone)}
                        >
                            <Ionicons name="call" size={20} color={colors.textWhite} />
                            <Text style={[styles.callButtonText, { color: colors.textWhite }]}>{t.call}</Text>
                        </TouchableOpacity>
                    </Card>
                ))}
            </ScrollView>

            <FloatingButton
                position="right"
                icon={<MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.text} />}
                onPress={() => navigation.navigate('RegistroVeterinaria')}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    screenTitle: {
        ...typography.title,
        textAlign: 'center',
    },
    screenSubtitle: {
        ...typography.bodySmall,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    vetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    vetName: {
        ...typography.subtitle,
        marginLeft: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    infoText: {
        ...typography.body,
        marginLeft: spacing.sm,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
        borderRadius: 8,
        marginTop: spacing.md,
    },
    callButtonText: {
        ...typography.buttonText,
        marginLeft: spacing.xs,
    },
});