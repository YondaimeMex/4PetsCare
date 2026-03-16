import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

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

    const allCategory = t.allCategory || 'Todo';

    const localizedTips = useMemo(() => {
        const cNutrition = t.categoryNutrition || 'Nutricion';
        const cActivity = t.categoryActivity || 'Actividad';
        const cHealth = t.categoryHealth || 'Salud';
        const cSafety = t.categorySafety || 'Seguridad';
        const cBehavior = t.categoryBehavior || 'Comportamiento';
        const cPrevention = t.categoryPrevention || 'Prevencion';

        return [
            {
                title: t.tip1Title || 'Nutricion esencial',
                text: t.tip1Text || 'Asegurate de que la dieta de tu mascota sea balanceada y apropiada para su edad y nivel de actividad. Evita darle comida humana toxica como chocolate o uvas.',
                category: cNutrition,
                icon: 'nutrition-outline',
            },
            {
                title: t.tip2Title || 'Ejercicio diario',
                text: t.tip2Text || 'El ejercicio regular es vital. Un perro necesita paseos; un gato, tiempo de juego. Esto previene obesidad y problemas de comportamiento.',
                category: cActivity,
                icon: 'walk-outline',
            },
            {
                title: t.tip3Title || 'Salud dental',
                text: t.tip3Text || 'Cepilla los dientes de tu mascota varias veces por semana con pasta especial para animales y reduce el riesgo de enfermedad periodontal.',
                category: cHealth,
                icon: 'medical-outline',
            },
            {
                title: t.tip4Title || 'Revisiones veterinarias',
                text: t.tip4Text || 'No esperes a que tu mascota este enferma. Las revisiones periodicas y las vacunas al dia permiten detectar problemas temprano.',
                category: cHealth,
                icon: 'bandage-outline',
            },
            {
                title: t.tip5Title || 'Identificacion segura',
                text: t.tip5Text || 'Coloca una placa actualizada y considera microchip. Si se pierde, estos datos aumentan mucho la probabilidad de recuperarla rapido.',
                category: cSafety,
                icon: 'shield-checkmark-outline',
            },
            {
                title: t.tip6Title || 'Hidratacion constante',
                text: t.tip6Text || 'Proporciona agua fresca y limpia en todo momento. Lava el cuenco a diario para evitar crecimiento de bacterias.',
                category: cNutrition,
                icon: 'water-outline',
            },
            {
                title: t.tip7Title || 'Socializacion temprana',
                text: t.tip7Text || 'Expon a tu mascota de forma segura a personas, sonidos y entornos para fomentar confianza y un temperamento equilibrado.',
                category: cBehavior,
                icon: 'people-outline',
            },
            {
                title: t.tip8Title || 'Control de parasitos',
                text: t.tip8Text || 'Manten un calendario de desparasitacion interna y externa siguiendo las indicaciones de tu veterinario.',
                category: cPrevention,
                icon: 'bug-outline',
            },
        ];
    }, [t]);

    const categories = useMemo(
        () => [allCategory, ...Array.from(new Set(localizedTips.map((tip) => tip.category)))],
        [allCategory, localizedTips]
    );

    const [activeCategory, setActiveCategory] = useState(allCategory);
    const [currentTip, setCurrentTip] = useState(localizedTips[0]);

    useEffect(() => {
        setActiveCategory(allCategory);
        setCurrentTip(localizedTips[0]);
    }, [allCategory, localizedTips]);

    const filteredTips = useMemo(() => {
        if (activeCategory === allCategory) return localizedTips;
        return localizedTips.filter((tip) => tip.category === activeCategory);
    }, [activeCategory, allCategory, localizedTips]);

    const pickRandomTip = useCallback((list) => {
        if (!list.length) return;

        setCurrentTip((prevTip) => {
            let next = list[Math.floor(Math.random() * list.length)];

            if (list.length > 1 && prevTip?.title === next.title) {
                const prevIndex = list.findIndex((tip) => tip.title === next.title);
                next = list[(prevIndex + 1) % list.length];
            }

            return next;
        });
    }, []);

    const updateTip = useCallback(() => {
        pickRandomTip(filteredTips);
        Alert.alert(t.updated || 'Actualizado', t.tipsUpdated || 'Aquí tienes un nuevo consejo.');
    }, [filteredTips, pickRandomTip, t]);

    useEffect(() => {
        pickRandomTip(filteredTips);
    }, [activeCategory, filteredTips, pickRandomTip]);

    return (
        <ScreenWrapper>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroGlowTop} />
                        <View style={styles.heroGlowBottom} />
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
                        <Text style={styles.heroTitle}>{t.tipsHeroTitle || 'Guia diaria de bienestar'}</Text>
                        <Text style={styles.heroSubtitle}>
                            {t.tipsHeroSubtitle || 'Recomendaciones practicas para mejorar la salud y rutina de tu mascota.'}
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
                        <Text style={[styles.quickTitle, { color: theme.text }]}>{t.quickChecklist || 'Checklist rapido'}</Text>

                        <View style={styles.quickItem}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.brandSoft} />
                            <Text style={[styles.quickText, { color: theme.text }]}>{t.checklistWater || 'Agua limpia y fresca disponible.'}</Text>
                        </View>
                        <View style={styles.quickItem}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.brandSoft} />
                            <Text style={[styles.quickText, { color: theme.text }]}>{t.checklistActivity || 'Actividad fisica acorde a su edad.'}</Text>
                        </View>
                        <View style={styles.quickItem}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.brandSoft} />
                            <Text style={[styles.quickText, { color: theme.text }]}>{t.checklistReview || 'Revision de senales de malestar.'}</Text>
                        </View>
                    </View>
                </ScrollView>
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
        paddingBottom: 24,
    },
    heroCard: {
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 24,
        overflow: 'hidden',
    },
    heroGlowTop: {
        position: 'absolute',
        top: -38,
        right: -26,
        width: 135,
        height: 135,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroGlowBottom: {
        position: 'absolute',
        bottom: -48,
        left: -22,
        width: 120,
        height: 120,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
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
        letterSpacing: 0.2,
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
});