import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/Supabase';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

function FormField({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    editable,
    error,
    rightAction,
    theme,
}) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
            <View
                style={[
                    styles.inputRow,
                    {
                        backgroundColor: theme.inputBg,
                        borderColor: error ? theme.danger : theme.border,
                    },
                ]}
            >
                <Ionicons name={icon} size={18} color={theme.brandSoft} style={styles.leftIcon} />
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.muted}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                />
                {rightAction}
            </View>
            {error ? (
                <View style={styles.errorRow}>
                    <Ionicons name="alert-circle-outline" size={14} color={theme.danger} />
                    <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
                </View>
            ) : null}
        </View>
    );
}

export default function Registro() {
    const navigation = useNavigation();
    const { colors, t } = useApp();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        accent: colors?.accent || '#FF7F5A',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
        inputBg: colors?.inputBackground || '#F6F8F4',
        danger: colors?.danger || '#E53935',
    }), [colors]);

    const isValidEmail = (rawEmail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail);

    const isValidPassword = (rawPassword) => rawPassword.length >= 6;

    const handleRegister = async () => {
        setErrors({ username: '', email: '', password: '', confirmPassword: '' });

        let hasErrors = false;

        if (!username.trim()) {
            setErrors((prev) => ({ ...prev, username: t.usernameRequired || 'El nombre de usuario es obligatorio' }));
            hasErrors = true;
        } else if (username.trim().length < 3) {
            setErrors((prev) => ({ ...prev, username: t.minimumThreeChars || 'Minimo 3 caracteres' }));
            hasErrors = true;
        }

        if (!email.trim()) {
            setErrors((prev) => ({ ...prev, email: t.emailRequiredLogin || 'El correo es obligatorio' }));
            hasErrors = true;
        } else if (!isValidEmail(email)) {
            setErrors((prev) => ({ ...prev, email: t.invalidEmailFormat || 'Formato de correo invalido' }));
            hasErrors = true;
        }

        if (!password) {
            setErrors((prev) => ({ ...prev, password: t.passwordRequiredRegister || 'La contrasena es obligatoria' }));
            hasErrors = true;
        } else if (!isValidPassword(password)) {
            setErrors((prev) => ({ ...prev, password: t.minimumSixChars || 'Minimo 6 caracteres' }));
            hasErrors = true;
        }

        if (!confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: t.confirmPasswordRequired || 'Confirmar contrasena es obligatorio' }));
            hasErrors = true;
        } else if (password !== confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: t.passwordsDoNotMatch || 'Las contrasenas no coinciden' }));
            hasErrors = true;
        }

        if (hasErrors) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        nombre: username.trim(),
                    },
                },
            });

            if (error) {
                Alert.alert(t.error || 'Error', error.message || t.registerErrorDefault || 'No se pudo completar el registro.');
                return;
            }

            Alert.alert(
                t.registerSuccessTitle || 'Registro exitoso',
                t.registerSuccessMessage || 'Tu cuenta ha sido creada. Ahora puedes iniciar sesion.',
                [{ text: t.goToLogin || 'Ir a Login', onPress: () => navigation.goBack() }]
            );

            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            Alert.alert(t.error || 'Error', t.serverConnectionErrorWithDot || 'No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper showHeader={false}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.bg }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <Ionicons name="person-add-outline" size={34} color="#FFFFFF" />
                        <Text style={styles.heroKicker}>{t.newAccountKicker || 'NUEVA CUENTA'}</Text>
                        <Text style={styles.heroTitle}>{t.createAccess || 'Crea tu acceso'}</Text>
                        <Text style={styles.heroSubtitle}>{t.registerSubtitle || 'Registra tus mascotas y agenda cuidados en minutos'}</Text>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <FormField
                            label={t.username || 'Usuario'}
                            icon="person-outline"
                            value={username}
                            onChangeText={setUsername}
                            placeholder={t.usernamePlaceholder || 'Tu nombre de usuario'}
                            editable={!loading}
                            error={errors.username}
                            theme={theme}
                        />

                        <FormField
                            label={t.emailLabel || 'Correo electronico'}
                            icon="mail-outline"
                            value={email}
                            onChangeText={setEmail}
                            placeholder={t.emailPlaceholder || 'tu@correo.com'}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                            error={errors.email}
                            theme={theme}
                        />

                        <FormField
                            label={t.passwordLabel || 'Contrasena'}
                            icon="lock-closed-outline"
                            value={password}
                            onChangeText={setPassword}
                            placeholder={t.minimumSixChars || 'Minimo 6 caracteres'}
                            secureTextEntry={!showPassword}
                            editable={!loading}
                            error={errors.password}
                            theme={theme}
                            rightAction={
                                <TouchableOpacity
                                    style={styles.eyeAction}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={18}
                                        color={theme.muted}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        <FormField
                            label={t.confirmPasswordLabel || 'Confirmar contrasena'}
                            icon="lock-closed-outline"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder={t.confirmPasswordPlaceholder || 'Confirma tu contrasena'}
                            secureTextEntry={!showConfirmPassword}
                            editable={!loading}
                            error={errors.confirmPassword}
                            theme={theme}
                            rightAction={
                                <TouchableOpacity
                                    style={styles.eyeAction}
                                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={18}
                                        color={theme.muted}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: theme.brand }, loading && styles.disabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>{t.registerButton || 'Registrarse'}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.loginRow}>
                            <Text style={[styles.loginHint, { color: theme.muted }]}>{t.alreadyHaveAccount || 'Ya tienes cuenta?'}</Text>
                            <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
                                <Text style={[styles.loginLink, { color: theme.brandSoft }]}> {t.signIn || 'Inicia sesion'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    heroCard: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 22,
        marginBottom: 14,
    },
    heroKicker: {
        color: 'rgba(255,255,255,0.74)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 10,
        marginBottom: 4,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 13,
        marginTop: 6,
        lineHeight: 18,
    },
    formCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
    },
    fieldWrap: {
        marginBottom: 12,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    inputRow: {
        minHeight: 46,
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    leftIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 10,
    },
    eyeAction: {
        padding: 6,
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    errorText: {
        fontSize: 12,
        marginLeft: 5,
    },
    primaryButton: {
        minHeight: 48,
        borderRadius: 12,
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    disabled: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    loginRow: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginHint: {
        fontSize: 13,
    },
    loginLink: {
        fontSize: 13,
        fontWeight: '700',
    },
});
