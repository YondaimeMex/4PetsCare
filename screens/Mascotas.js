import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, PetCard, FloatingButton } from '../components';
import { spacing, typography } from '../constants';
import { useApp } from '../context';

// Datos de mascotas (en una app real vendrían de una API o estado global)
const petsData = [
    {
        id: 1,
        name: 'Toby',
        age: '2 años',
        weight: '30 kg',
        breed: 'Husky',
        type: 'Doméstico (Perro)',
        nextVaccine: 'Moquillo',
        imageUrl: 'https://images.pexels.com/photos/46505/swiss-shepherd-dog-dog-pet-portrait-46505.jpeg',
    },
    {
        id: 2,
        name: 'Gerardo',
        age: '1 año',
        weight: '10 kg',
        breed: 'Siamés',
        type: 'Doméstico (Gato)',
        nextVaccine: 'FeLV',
        imageUrl: 'https://images.pexels.com/photos/1208938/pexels-photo-1208938.jpeg',
    },
];

export default function Mascotas() {
    const navigation = useNavigation();
    const { colors, t } = useApp();

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={[styles.screenTitle, { color: colors.text }]}>{t.myPets}</Text>

                {petsData.map((pet) => (
                    <PetCard
                        key={pet.id}
                        name={pet.name}
                        age={pet.age}
                        weight={pet.weight}
                        breed={pet.breed}
                        type={pet.type}
                        nextVaccine={pet.nextVaccine}
                        imageUrl={pet.imageUrl}
                        onVaccinePress={() => navigation.navigate('ConfirmacionVacuna')}
                    />
                ))}
            </ScrollView>

            {/* Botón flotante para programar cita */}
            <TouchableOpacity
                style={[styles.floatingAddButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('ProgramarCita')}
                accessibilityLabel={t.scheduleAppointment}
            >
                <MaterialIcons name="add" size={30} color={colors.textWhite} />
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    scrollContent: {
        paddingTop: spacing.md,
        paddingBottom: 100,
    },
    screenTitle: {
        ...typography.title,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    floatingAddButton: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 15,
    },
});
