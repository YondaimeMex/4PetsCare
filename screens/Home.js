import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card, FloatingButton } from '../components';
import { spacing, typography } from '../constants';
import { useApp } from '../context';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { colors, t } = useApp();

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Tarjeta de próximas vacunas/citas */}
                <Card title={t.nextVaccine}>
                    <Text style={[styles.text, { color: colors.text }]}>Lunes 27 de Octubre</Text>
                    <Text style={[styles.text, { color: colors.text }]}>Jueves 20 de Noviembre</Text>
                </Card>

                {/* Tarjeta de recordatorios */}
                <Card title={t.reminders}>
                    <Text style={[styles.text, { color: colors.text }]}>Visita al médico cada mes</Text>
                    <Text style={[styles.text, { color: colors.text }]}>Alimentarlo por porciones</Text>
                </Card>

                {/* Tarjeta de accesos rápidos */}
                <Card title={t.quickAccess}>
                    <View style={styles.quickAccessContainer}>
                        <QuickAccessButton
                            icon={<MaterialCommunityIcons name="dog" size={24} color={colors.success} />}
                            label={t.pets}
                            onPress={() => navigation.navigate('Mascotas')}
                            colors={colors}
                        />
                        <QuickAccessButton
                            icon={<MaterialIcons name="calendar-today" size={24} color={colors.secondary} />}
                            label={t.calendar}
                            onPress={() => navigation.navigate('Calendario')}
                            colors={colors}
                        />

                        <QuickAccessButton
                            icon={<MaterialIcons name="emergency" size={24} color={colors.danger} />}
                            label={t.emergencies}
                            onPress={() => navigation.navigate('Emergencias')}
                            colors={colors}
                        />
                    </View>
                </Card>
            </ScrollView>

            {/* Botón flotante izquierdo (Buscador) */}
            <FloatingButton
                position="left"
                icon={<MaterialIcons name="search" size={24} color={colors.text} />}
                onPress={() => navigation.navigate('BuscadorGoogle')}
            />

            {/* Botón flotante derecho (Agregar mascota) */}
            <FloatingButton
                position="right"
                icon={<MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.text} />}
                onPress={() => navigation.navigate('RegistroMascota')}
            />
        </ScreenWrapper>
    );
}

// Componente auxiliar para accesos rápidos
function QuickAccessButton({ icon, label, onPress, colors }) {
    return (
        <TouchableOpacity style={styles.quickAccessButton} onPress={onPress}>
            <View style={[styles.quickAccessIcon, { backgroundColor: colors.backgroundLight }]}>
                {icon}
            </View>
            <Text style={[styles.quickAccessLabel, { color: colors.text }]}>{label}</Text>
        </TouchableOpacity>
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
    text: {
        ...typography.body,
        marginBottom: spacing.xs,
    },
    quickAccessContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    quickAccessButton: {
        width: '48%',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    quickAccessIcon: {
        padding: spacing.md,
        borderRadius: 50,
        marginBottom: spacing.xs,
    },
    quickAccessLabel: {
        ...typography.bodySmall,
    },
});
