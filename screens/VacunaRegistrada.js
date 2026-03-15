import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function VacunaRegistrada() {
    const navigation = useNavigation();
    const route = useRoute();
    const { fechaAplicada } = route.params || {};
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
        success: colors?.success || '#2E7D32',
    }), [colors]);

    const handleAccept = () => {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    };

    return (
        <ScreenWrapper showBack>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <FontAwesome5 name="syringe" size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.heroKicker}>{t.vaccineRegisteredKicker || 'REGISTRO COMPLETADO'}</Text>
                        <Text style={styles.heroTitle}>{t.vaccineRegisteredTitle || 'Vacuna registrada'}</Text>
                        <Text style={styles.heroSubtitle}>{t.vaccineRegisteredSubtitle || 'La aplicacion quedo guardada correctamente en tu calendario.'}</Text>
                    </View>

                    <View style={[styles.dateCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.dateLabel, { color: theme.muted }]}>{t.registeredDateLabel || 'Fecha registrada'}</Text>

                        {fechaAplicada ? (
                            <Text style={[styles.dateText, { color: theme.success }]}>{fechaAplicada}</Text>
                        ) : (
                            <Text style={[styles.dateText, { color: '#E53935', fontSize: 18 }]}>
                                {t.noRegisteredDate || 'No se encontro la fecha de registro.'}
                            </Text>
                        )}

                        <View style={[styles.badge, { backgroundColor: `${theme.success}1f` }]}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                            <Text style={[styles.badgeText, { color: theme.success }]}>{t.applicationConfirmed || 'Aplicacion confirmada'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.acceptButton, { backgroundColor: theme.brand }]} onPress={handleAccept}>
                        <Ionicons name="home-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.acceptButtonText}>{t.backToHome || 'Volver al inicio'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 44,
        alignItems: 'center',
    },
    heroCard: {
        width: '100%',
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 22,
        paddingBottom: 22,
        marginBottom: 14,
        alignItems: 'center',
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    heroKicker: {
        color: 'rgba(255,255,255,0.74)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
        textAlign: 'center',
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.79)',
        fontSize: 13,
        lineHeight: 18,
        marginTop: 6,
        textAlign: 'center',
    },
    dateCard: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 1,
        paddingVertical: 22,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 6,
    },
    dateText: {
        fontSize: 30,
        textAlign: 'center',
        fontWeight: '800',
        marginBottom: 18,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
    },
    acceptButton: {
        marginTop: 16,
        width: '100%',
        minHeight: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
    },
});