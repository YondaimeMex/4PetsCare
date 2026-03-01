import React, { useState } from 'react';
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
import { ScreenWrapper, Card } from '../components';
import { spacing, typography, borderRadius } from '../constants';
import { useApp } from '../context';

export default function Configuracion() {
    const { isDarkMode, toggleDarkMode, colors, t, language, changeLanguage, availableLanguages } = useApp();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    // Obtener el nombre del idioma actual
    const currentLanguageName = availableLanguages.find(lang => lang.code === language)?.nativeName || 'Español';

    const handleLanguageSelect = (langCode) => {
        changeLanguage(langCode);
        setLanguageModalVisible(false);
    };

    const styles = createStyles(colors);

    return (
        <ScreenWrapper showBack showMenu={false} showProfile={false}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.screenTitle}>{t.settings}</Text>

                {/* Apariencia */}
                <Card title={t.appearance}>
                    <View style={styles.configOption}>
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name={isDarkMode ? 'moon' : 'moon-outline'}
                                size={24}
                                color={colors.primary}
                            />
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionLabel}>{t.darkMode}</Text>
                                <Text style={styles.optionDescription}>
                                    {isDarkMode ? t.enabled : t.disabled}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={isDarkMode ? colors.primary : colors.textMuted}
                        />
                    </View>
                </Card>

                {/* Opciones generales */}
                <Card title={t.general}>
                    {/* Notificaciones push */}
                    <View style={[styles.configOption, styles.configOptionBorder]}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                            <Text style={styles.optionLabel}>{t.pushNotifications}</Text>
                        </View>
                        <Switch
                            value={true}
                            onValueChange={() => { }}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={colors.primary}
                        />
                    </View>

                    {/* Idioma */}
                    <TouchableOpacity
                        style={[styles.configOption, styles.configOptionBorder]}
                        onPress={() => setLanguageModalVisible(true)}
                    >
                        <View style={styles.optionLeft}>
                            <Ionicons name="language-outline" size={24} color={colors.primary} />
                            <Text style={styles.optionLabel}>{t.language}</Text>
                        </View>
                        <View style={styles.optionRight}>
                            <Text style={styles.optionValue}>{currentLanguageName}</Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={colors.textMuted}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Ubicación */}
                    <View style={styles.configOption}>
                        <View style={styles.optionLeft}>
                            <Ionicons name="location-outline" size={24} color={colors.primary} />
                            <Text style={styles.optionLabel}>{t.location}</Text>
                        </View>
                        <Switch
                            value={true}
                            onValueChange={() => { }}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={colors.primary}
                        />
                    </View>
                </Card>

                {/* Privacidad */}
                <Card title={t.privacySecurity}>
                    <TouchableOpacity style={styles.configOption}>
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={24}
                                color={colors.primary}
                            />
                            <Text style={styles.optionLabel}>{t.privacyPolicy}</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.configOption}>
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="document-text-outline"
                                size={24}
                                color={colors.primary}
                            />
                            <Text style={styles.optionLabel}>{t.termsOfService}</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>
                </Card>

                {/* Información de la app */}
                <Card title={t.about}>
                    <View style={styles.aboutSection}>
                        <Text style={styles.appName}>4PetsCare</Text>
                        <Text style={styles.appVersion}>{t.version} 1.0.0</Text>
                        <Text style={styles.appCopyright}>
                            © 2024 4PetsCare. {t.allRightsReserved}
                        </Text>
                    </View>
                </Card>
            </ScrollView>

            {/* Modal de selección de idioma */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setLanguageModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t.selectLanguage}</Text>

                        {availableLanguages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    language === lang.code && styles.languageOptionSelected
                                ]}
                                onPress={() => handleLanguageSelect(lang.code)}
                            >
                                <Text style={[
                                    styles.languageText,
                                    language === lang.code && styles.languageTextSelected
                                ]}>
                                    {lang.nativeName}
                                </Text>
                                {language === lang.code && (
                                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </ScreenWrapper>
    );
}

const createStyles = (colors) =>
    StyleSheet.create({
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: spacing.lg,
            paddingBottom: spacing.xxl,
        },
        screenTitle: {
            ...typography.title,
            textAlign: 'center',
            marginBottom: spacing.lg,
            color: colors.text,
        },
        configOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
        },
        configOptionBorder: {
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
        },
        optionLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        optionTextContainer: {
            marginLeft: spacing.md,
        },
        optionLabel: {
            ...typography.body,
            marginLeft: spacing.md,
            color: colors.text,
        },
        optionDescription: {
            ...typography.caption,
            color: colors.textMuted,
            marginTop: 2,
        },
        optionRight: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        optionValue: {
            ...typography.bodySmall,
            color: colors.textMuted,
            marginRight: spacing.xs,
        },
        divider: {
            height: 1,
            backgroundColor: colors.borderLight,
        },
        aboutSection: {
            alignItems: 'center',
            paddingVertical: spacing.md,
        },
        appName: {
            ...typography.subtitle,
            color: colors.primary,
            marginBottom: spacing.xs,
        },
        appVersion: {
            ...typography.body,
            color: colors.textMuted,
            marginBottom: spacing.sm,
        },
        appCopyright: {
            ...typography.caption,
            color: colors.textMuted,
            textAlign: 'center',
        },
        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: colors.background,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            width: '80%',
            maxWidth: 320,
        },
        modalTitle: {
            ...typography.subtitle,
            color: colors.text,
            textAlign: 'center',
            marginBottom: spacing.lg,
        },
        languageOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            marginBottom: spacing.xs,
        },
        languageOptionSelected: {
            backgroundColor: colors.backgroundLight,
        },
        languageText: {
            ...typography.body,
            color: colors.text,
        },
        languageTextSelected: {
            color: colors.primary,
            fontWeight: '600',
        },
        cancelButton: {
            marginTop: spacing.md,
            paddingVertical: spacing.md,
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
        },
        cancelButtonText: {
            ...typography.body,
            color: colors.textMuted,
        },
    });
