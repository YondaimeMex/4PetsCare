import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';

function SettingRow({ icon, label, description, right, onPress, border = true, theme }) {
    const content = (
        <View style={[styles.settingRow, border && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIconWrap, { backgroundColor: `${theme.brand}14` }]}>
                    <Ionicons name={icon} size={18} color={theme.brand} />
                </View>
                <View style={styles.settingTextWrap}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
                    {description ? <Text style={[styles.settingDescription, { color: theme.muted }]}>{description}</Text> : null}
                </View>
            </View>
            {right}
        </View>
    );

    if (!onPress) return content;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
            {content}
        </TouchableOpacity>
    );
}

export default function Configuracion() {
    const navigation = useNavigation();
    const {
        isDarkMode,
        toggleDarkMode,
        colors,
        t,
        language,
        changeLanguage,
        availableLanguages,
        queueTutorialStart,
    } = useApp();

    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);

    const currentLanguageName =
        availableLanguages.find((lang) => lang.code === language)?.nativeName || 'Español';

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        accent: colors?.accent || '#FF7F5A',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
        overlay: colors?.overlay || 'rgba(0,0,0,0.35)',
    }), [colors]);

    const handleLanguageSelect = (langCode) => {
        changeLanguage(langCode);
        setLanguageModalVisible(false);
    };

    const handleReplayTutorial = async () => {
        await queueTutorialStart();
        navigation.navigate('Home');
    };

    return (
        <ScreenWrapper showBack showMenu={false} showProfile={false}>
            <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                    <View style={styles.heroGlowTop} />
                    <View style={styles.heroGlowBottom} />
                    <Text style={styles.heroKicker}>{t.configHeroKicker || 'CONFIGURACION'}</Text>
                    <Text style={styles.heroTitle}>{t.settings || 'Ajustes'}</Text>
                    <Text style={styles.heroSubtitle}>{t.configHeroSubtitle || 'Personaliza idioma, apariencia y preferencias generales'}</Text>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t.appearance || 'Apariencia'}</Text>
                    <SettingRow
                        icon={isDarkMode ? 'moon' : 'moon-outline'}
                        label={t.darkMode || 'Modo oscuro'}
                        description={isDarkMode ? (t.enabled || 'Activado') : (t.disabled || 'Desactivado')}
                        right={
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleDarkMode}
                                trackColor={{ false: theme.border, true: `${theme.brand}55` }}
                                thumbColor={isDarkMode ? theme.brand : '#f4f3f4'}
                            />
                        }
                        border={false}
                        theme={theme}
                    />
                </View>

                <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t.general || 'General'}</Text>
                    <SettingRow
                        icon="notifications-outline"
                        label={t.pushNotifications || 'Notificaciones push'}
                        right={
                            <Switch
                                value={pushEnabled}
                                onValueChange={setPushEnabled}
                                trackColor={{ false: theme.border, true: `${theme.brand}55` }}
                                thumbColor={pushEnabled ? theme.brand : '#f4f3f4'}
                            />
                        }
                        theme={theme}
                    />
                    <SettingRow
                        icon="language-outline"
                        label={t.language || 'Idioma'}
                        description={currentLanguageName}
                        right={<Ionicons name="chevron-forward" size={18} color={theme.muted} />}
                        onPress={() => setLanguageModalVisible(true)}
                        theme={theme}
                    />
                    <SettingRow
                        icon="location-outline"
                        label={t.location || 'Ubicación'}
                        right={
                            <Switch
                                value={locationEnabled}
                                onValueChange={setLocationEnabled}
                                trackColor={{ false: theme.border, true: `${theme.brand}55` }}
                                thumbColor={locationEnabled ? theme.brand : '#f4f3f4'}
                            />
                        }
                        theme={theme}
                    />
                    <SettingRow
                        icon="school-outline"
                        label={t.tutorialReplayLabel || 'Ver tutorial de la app'}
                        description={t.tutorialReplayDescription || 'Recorre de nuevo las funciones principales de 4PetsCare.'}
                        right={<Ionicons name="play-circle-outline" size={20} color={theme.brand} />}
                        onPress={handleReplayTutorial}
                        border={false}
                        theme={theme}
                    />
                </View>

                <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t.privacySecurity || 'Privacidad y seguridad'}</Text>
                    <SettingRow
                        icon="shield-checkmark-outline"
                        label={t.privacyPolicy || 'Política de privacidad'}
                        right={<Ionicons name="chevron-forward" size={18} color={theme.muted} />}
                        onPress={() => { }}
                        theme={theme}
                    />
                    <SettingRow
                        icon="document-text-outline"
                        label={t.termsOfService || 'Términos del servicio'}
                        right={<Ionicons name="chevron-forward" size={18} color={theme.muted} />}
                        onPress={() => { }}
                        border={false}
                        theme={theme}
                    />
                </View>

                <View style={[styles.aboutCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.aboutName, { color: theme.brand }]}>4PetsCare</Text>
                    <Text style={[styles.aboutVersion, { color: theme.muted }]}>{t.version || 'Versión'} 1.0.0</Text>
                    <Text style={[styles.aboutCopyright, { color: theme.muted }]}>
                        © 2026 4PetsCare. {t.allRightsReserved || 'Todos los derechos reservados'}
                    </Text>
                </View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <Pressable style={[styles.modalOverlay, { backgroundColor: theme.overlay }]} onPress={() => setLanguageModalVisible(false)}>
                    <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>{t.selectLanguage || 'Selecciona un idioma'}</Text>

                        {availableLanguages.map((lang) => {
                            const active = language === lang.code;
                            return (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[
                                        styles.langRow,
                                        { borderColor: theme.border },
                                        active && { backgroundColor: `${theme.brand}14` },
                                    ]}
                                    onPress={() => handleLanguageSelect(lang.code)}
                                >
                                    <Text style={[styles.langText, { color: active ? theme.brand : theme.text }]}>{lang.nativeName}</Text>
                                    {active ? <Ionicons name="checkmark" size={18} color={theme.brand} /> : null}
                                </TouchableOpacity>
                            );
                        })}

                        <TouchableOpacity style={[styles.modalCloseBtn, { borderTopColor: theme.border }]} onPress={() => setLanguageModalVisible(false)}>
                            <Text style={[styles.modalCloseText, { color: theme.muted }]}>{t.cancel || 'Cancelar'}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 42,
    },
    heroCard: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 22,
        marginBottom: 14,
        overflow: 'hidden',
    },
    heroGlowTop: {
        position: 'absolute',
        right: -30,
        top: -35,
        width: 125,
        height: 125,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroGlowBottom: {
        position: 'absolute',
        left: -32,
        bottom: -40,
        width: 115,
        height: 115,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.08)',
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
        fontSize: 23,
        fontWeight: '800',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 13,
        marginTop: 6,
        lineHeight: 18,
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.6,
        paddingTop: 12,
        paddingBottom: 4,
    },
    settingRow: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingTextWrap: {
        marginLeft: 10,
        flex: 1,
    },
    settingLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    settingDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    aboutCard: {
        borderRadius: 16,
        borderWidth: 1,
        paddingVertical: 18,
        alignItems: 'center',
    },
    aboutName: {
        fontSize: 19,
        fontWeight: '800',
    },
    aboutVersion: {
        marginTop: 6,
        fontSize: 13,
    },
    aboutCopyright: {
        marginTop: 8,
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '82%',
        maxWidth: 340,
        borderRadius: 16,
        borderWidth: 1,
        paddingTop: 14,
    },
    modalTitle: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    langRow: {
        minHeight: 46,
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    langText: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalCloseBtn: {
        marginTop: 4,
        borderTopWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    modalCloseText: {
        fontSize: 14,
        fontWeight: '600',
    },
});