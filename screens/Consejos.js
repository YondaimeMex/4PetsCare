import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper, Card } from '../components';
import { spacing, typography } from '../constants';
import { useApp } from '../context';

// Datos de consejos
const consejosData = [
    {
        id: 1,
        title: 'Alimentación',
        text: 'Cuida a tu mascota con amor, buena alimentación y visitas al veterinario. Mantén su espacio limpio y dale agua fresca siempre.',
    },
    {
        id: 2,
        title: 'Ejercicio',
        text: 'Juega con ella y mantenla activa. El ejercicio es fundamental para su salud física y mental.',
    },
    {
        id: 3,
        title: 'Higiene',
        text: 'Mantenla limpia y protegida. Báñala regularmente y revisa su pelaje en busca de parásitos.',
    },
];

export default function Consejos() {
    const { colors, t } = useApp();

    const handleRefresh = () => {
        Alert.alert(t.updated, t.tipsUpdated);
    };

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={[styles.screenTitle, { color: colors.text }]}>{t.tipsForPet}</Text>

                {consejosData.map((consejo) => (
                    <Card key={consejo.id} title={consejo.title}>
                        <Text style={[styles.cardText, { color: colors.text }]}>{consejo.text}</Text>
                    </Card>
                ))}
            </ScrollView>

            {/* Botón flotante para actualizar */}
            <TouchableOpacity style={[styles.floatingBtnCenter, { backgroundColor: colors.background }]} onPress={handleRefresh}>
                <MaterialCommunityIcons name="restart" size={32} color={colors.text} />
                <Text style={[styles.refreshText, { color: colors.text }]}>{t.refresh}</Text>
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 120,
    },
    screenTitle: {
        ...typography.title,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    cardText: {
        ...typography.body,
        lineHeight: 22,
    },
    floatingBtnCenter: {
        position: 'absolute',
        bottom: spacing.xxl,
        alignSelf: 'center',
        borderRadius: 50,
        elevation: 5,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshText: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
});
