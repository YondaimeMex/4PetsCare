import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

const petTips = [
    {
        title: 'Nutrición esencial',
        text: 'Asegúrate de que la dieta de tu mascota sea balanceada y apropiada para su edad y nivel de actividad. Evita darle comida humana tóxica como chocolate o uvas.',
        category: 'Nutrición',
        icon: 'nutrition-outline',
    },
    {
        title: 'Ejercicio diario',
        text: 'El ejercicio regular es vital. Un perro necesita paseos; un gato, tiempo de juego. Esto previene obesidad y problemas de comportamiento.',
        category: 'Actividad',
        icon: 'walk-outline',
    },
    {
        title: 'Salud dental',
        text: 'Cepilla los dientes de tu mascota varias veces por semana con pasta especial para animales y reduce el riesgo de enfermedad periodontal.',
        category: 'Salud',
        icon: 'medical-outline',
    },
    {
        title: 'Revisiones veterinarias',
        text: 'No esperes a que tu mascota esté enferma. Las revisiones periódicas y las vacunas al día permiten detectar problemas temprano.',
        category: 'Salud',
        icon: 'bandage-outline',
    },
    {
        title: 'Identificación segura',
        text: 'Coloca una placa actualizada y considera microchip. Si se pierde, estos datos aumentan mucho la probabilidad de recuperarla rápido.',
        category: 'Seguridad',
        icon: 'shield-checkmark-outline',
    },
    {
        title: 'Hidratación constante',
        text: 'Proporciona agua fresca y limpia en todo momento. Lava el cuenco a diario para evitar crecimiento de bacterias.',
        category: 'Nutrición',
        icon: 'water-outline',
    },
    {
        title: 'Socialización temprana',
        text: 'Expón a tu mascota de forma segura a personas, sonidos y entornos para fomentar confianza y un temperamento equilibrado.',
        category: 'Comportamiento',
        icon: 'people-outline',
    },
    {
        title: 'Control de parásitos',
        text: 'Mantén un calendario de desparasitación interna y externa siguiendo las indicaciones de tu veterinario.',
        category: 'Prevención',
        icon: 'bug-outline',
    },
];

export default function Consejos() {
    const { colors, t } = useApp();

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        accent: colors?.accent || '#FF7F5A',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
        warning: colors?.warning || '#F9A825',
    }), [colors]);

    const categories = useMemo(
        () => ['Todo', ...Array.from(new Set(petTips.map((tip) => tip.category)))],
        []
    );

    const [activeCategory, setActiveCategory] = useState('Todo');
    const [currentTip, setCurrentTip] = useState(petTips[0]);

    const filteredTips = useMemo(() => {
        if (activeCategory === 'Todo') return petTips;
        return petTips.filter((tip) => tip.category === activeCategory);
    }, [activeCategory]);

    const pickRandomTip = useCallback((list) => {
        if (!list.length) return;

        let next = list[Math.floor(Math.random() * list.length)];
        if (list.length > 1 && currentTip?.title === next.title) {
            next = list[(list.findIndex((tip) => tip.title === next.title) + 1) % list.length];
        }
        setCurrentTip(next);
    }, [currentTip]);

    const updateTip = useCallback(() => {
        pickRandomTip(filteredTips);
        Alert.alert(t.updated || 'Actualizado', t.tipsUpdated || 'Aquí tienes un nuevo consejo.');
    }, [filteredTips, pickRandomTip, t]);

    useEffect(() => {
        pickRandomTip(filteredTips);
    }, [activeCategory]);

    return (
        <ScreenWrapper>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroTopRow}>
                            <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                                <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color="#FFFFFF" />
                            </View>
                            <TouchableOpacity
                                style={[styles.heroRefreshBtn, { backgroundColor: theme.accent }]}
                                onPress={updateTip}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                                <Text style={styles.heroRefreshText}>{t.refresh || 'Nuevo'}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.heroKicker}>{(t.tips || 'Consejos').toUpperCase()}</Text>
                        <Text style={styles.heroTitle}>Guía diaria de bienestar</Text>
                        <Text style={styles.heroSubtitle}>
                            Recomendaciones prácticas para mejorar la salud y rutina de tu mascota.
                        </Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryRow}
                    >
                        {categories.map((category) => {
                            const active = category === activeCategory;
                            return (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: active ? theme.brand : theme.card,
                                            borderColor: active ? theme.brand : theme.border,
                                        },
                                    ]}
                                    onPress={() => setActiveCategory(category)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.categoryText, { color: active ? '#FFFFFF' : theme.text }]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.featureHeader}>
                            <View style={[styles.featureIcon, { backgroundColor: `${theme.warning}1f` }]}>
                                <Ionicons name={currentTip.icon} size={18} color={theme.warning} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.featureCategory, { color: theme.muted }]}>{currentTip.category}</Text>
                                <Text style={[styles.featureTitle, { color: theme.text }]}>{currentTip.title}</Text>
                            </View>
                        </View>
                        <Text style={[styles.featureBody, { color: theme.text }]}>{currentTip.text}</Text>
                    </View>

                    <View style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.quickTitle, { color: theme.text }]}>Checklist rápido</Text>

                        <View style={styles.quickItem}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.brandSoft} />
                            <Text style={[styles.quickText, { color: theme.text }]}>Agua limpia y fresca disponible.</Text>
                        </View>
                        <View style={styles.quickItem}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.brandSoft} />
                            <Text style={[styles.quickText, { color: theme.text }]}>Actividad física acorde a su edad.</Text>
                        </View>
                        <View style={styles.quickItem}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.brandSoft} />
                            <Text style={[styles.quickText, { color: theme.text }]}>Revisión de señales de malestar.</Text>
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity
                    style={[styles.bottomButton, { backgroundColor: theme.brand }]}
                    onPress={updateTip}
                    activeOpacity={0.85}
                >
                    <Ionicons name="refresh" size={18} color="#FFFFFF" />
                    <Text style={styles.bottomButtonText}>Generar otro consejo</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 96,
    },
    heroCard: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 22,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    heroIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroRefreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 16,
        paddingVertical: 7,
        paddingHorizontal: 11,
    },
    heroRefreshText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    heroKicker: {
        color: 'rgba(255,255,255,0.74)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.79)',
        fontSize: 13,
        lineHeight: 19,
        marginTop: 6,
    },
    categoryRow: {
        paddingVertical: 12,
        gap: 8,
    },
    categoryChip: {
        minHeight: 34,
        borderRadius: 17,
        borderWidth: 1,
        paddingHorizontal: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
    },
    featureCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 12,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    featureCategory: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
        marginBottom: 2,
    },
    featureTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    featureBody: {
        fontSize: 14,
        lineHeight: 22,
    },
    quickCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
    },
    quickTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
    },
    quickItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 8,
    },
    quickText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    bottomButton: {
        position: 'absolute',
        right: 16,
        left: 16,
        bottom: 16,
        minHeight: 50,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    bottomButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});