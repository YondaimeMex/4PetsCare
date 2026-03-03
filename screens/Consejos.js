import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context';
import { ScreenWrapper, Card, FloatingButton } from '../components';
import { spacing, typography, borderRadius, lightTheme } from '../constants';

// Lista de consejos disponibles
const petTips = [
    { title: 'Nutrición Esencial 🍎', text: 'Asegúrate de que la dieta de tu mascota sea balanceada y apropiada para su edad y nivel de actividad. Evita darle comida humana que pueda ser tóxica (como el chocolate o las uvas).' },
    { title: 'Ejercicio Diario 🏃‍♀️', text: 'El ejercicio regular es vital. Un perro necesita paseos; un gato, tiempo de juego. Esto previene la obesidad y problemas de comportamiento.' },
    { title: 'Salud Dental 🦷', text: 'Cepilla los dientes de tu mascota varias veces a la semana con pasta especial para animales para prevenir enfermedades periodontales.' },
    { title: 'Revisiones Veterinarias 🩺', text: 'No esperes a que tu mascota esté enferma. Las revisiones anuales y las vacunas al día son clave para la detección temprana de problemas.' },
    { title: 'Identificación Segura 🏷️', text: 'Coloca un collar con placa de identificación actualizada y considera el microchip. Si se pierde, esto es fundamental para recuperarla.' },
    { title: 'Hidratación Constante 💧', text: 'Proporciona agua fresca y limpia en todo momento. Lávate el cuenco a diario para evitar el crecimiento de bacterias.' },
    { title: 'Socialización Temprana 🐾', text: 'Expón a tu mascota (especialmente cachorros) a diferentes personas, sonidos y entornos de forma segura para fomentar un buen temperamento.' },
    { title: 'Control de Parásitos 🐛', text: 'Mantén un calendario estricto para desparasitación interna y externa (pulgas y garrapatas), siguiendo las indicaciones de tu veterinario.' },
];

export default function Consejos() {
    const navigation = useNavigation();
    const { colors: contextColors, t } = useApp();
    const colors = contextColors || lightTheme;

    // Estado para guardar el consejo actual
    const [currentTip, setCurrentTip] = useState(petTips[0]);

    // Función para actualizar el consejo
    const updateTip = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * petTips.length);
        const newTip = petTips[randomIndex];
        setCurrentTip(newTip);
        Alert.alert(t.updated || "Actualizado", t.tipsUpdated || "¡Aquí tienes un nuevo consejo!");
    }, [t]);

    // Cargar el primer consejo al iniciar el componente
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * petTips.length);
        setCurrentTip(petTips[randomIndex]);
    }, []);

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Card: Consejos Básicos */}
                <Card>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {t.tips || 'Consejos'} Básicos
                    </Text>
                    <Text style={[styles.cardText, { color: colors.textLight }]}>
                        Cuida a tu mascota con amor, buena alimentación y visitas al veterinario.
                        Mantén su espacio limpio y dale agua fresca siempre.
                    </Text>
                </Card>

                {/* Card: Consejo Dinámico */}
                <Card style={[styles.dynamicCard, { borderLeftColor: colors.warning }]}>
                    <Text style={[styles.dynamicTitle, { color: colors.warning }]}>
                        {currentTip.title}
                    </Text>
                    <Text style={[styles.dynamicCardText, { color: colors.text }]}>
                        {currentTip.text}
                    </Text>
                </Card>

                {/* Card: Consejo adicional */}
                <Card>
                    <Text style={[styles.cardText, { color: colors.textLight }]}>
                        Juega con ella y mantenla limpia y protegida. El amor y la atención
                        son tan importantes como la alimentación adecuada.
                    </Text>
                </Card>

                {/* Card: Tips rápidos */}
                <Card style={[styles.tipsCard, { borderLeftColor: colors.success }]}>
                    <Text style={[styles.tipsTitle, { color: colors.success }]}>
                        💡 Tips Rápidos
                    </Text>
                    <View style={styles.tipItem}>
                        <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
                        <Text style={[styles.tipText, { color: colors.text }]}>
                            Pasea a tu perro al menos 2 veces al día
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
                        <Text style={[styles.tipText, { color: colors.text }]}>
                            Cambia el agua del bebedero cada día
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={[styles.tipBullet, { color: colors.primary }]}>•</Text>
                        <Text style={[styles.tipText, { color: colors.text }]}>
                            Revisa las orejas de tu mascota semanalmente
                        </Text>
                    </View>
                </Card>
            </ScrollView>

            {/* Botón flotante para actualizar consejo */}
            <FloatingButton
                position="center"
                icon={<MaterialCommunityIcons name="refresh" size={28} color={colors.text} />}
                label={t.refresh || "Actualizar"}
                onPress={updateTip}
                style={{ backgroundColor: colors.warning }}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 120,
    },
    title: {
        ...typography.title,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    cardText: {
        ...typography.body,
        lineHeight: 24,
        textAlign: 'center',
    },
    dynamicCard: {
        borderLeftWidth: 5,
    },
    dynamicTitle: {
        ...typography.subtitle,
        marginBottom: spacing.sm,
    },
    dynamicCardText: {
        ...typography.body,
        lineHeight: 24,
    },
    tipsCard: {
        borderLeftWidth: 5,
    },
    tipsTitle: {
        ...typography.subtitle,
        marginBottom: spacing.md,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    tipBullet: {
        fontSize: 20,
        marginRight: spacing.sm,
        lineHeight: 24,
    },
    tipText: {
        ...typography.body,
        flex: 1,
        lineHeight: 24,
    },
});
