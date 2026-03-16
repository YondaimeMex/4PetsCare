import React, { useEffect, useMemo, useState } from 'react';
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
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

function Field({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    maxLength,
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
                    maxLength={maxLength}
                    editable={editable}
                    autoCapitalize="none"
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

export default function Recuperacion() {
    const navigation = useNavigation();
    const { colors, t } = useApp();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

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

    useEffect(() => {
        let timer;
        if (step === 2 && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const isValidEmail = (rawEmail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail);

    const isValidPassword = (rawPassword) => rawPassword.length >= 6;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleRequestReset = async () => {
        setErrors({});

        if (!email.trim()) {
            setErrors({ email: t.emailRequiredLogin || 'El correo es obligatorio' });
            return;
        }

        if (!isValidEmail(email)) {
            setErrors({ email: t.invalidEmailFormat || 'Formato de correo invalido' });
            return;
        }

        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setStep(2);
            setTimeLeft(300);
        } catch {
            Alert.alert(t.error || 'Error', t.resetCodeSentError || 'No se pudo enviar el codigo. Intentalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setErrors({});

        if (!verificationCode.trim()) {
            setErrors({ verificationCode: t.codeRequired || 'El codigo es obligatorio' });
            return;
        }

        if (verificationCode.length !== 6) {
            setErrors({ verificationCode: t.codeMustBeSixDigits || 'El codigo debe tener 6 digitos' });
            return;
        }

        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setStep(3);
        } catch {
            Alert.alert(t.error || 'Error', t.invalidCodeError || 'Codigo invalido. Intentalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setErrors({});

        if (!newPassword) {
            setErrors((prev) => ({ ...prev, newPassword: t.passwordRequiredRegister || 'La contrasena es obligatoria' }));
            return;
        }

        if (!isValidPassword(newPassword)) {
            setErrors((prev) => ({ ...prev, newPassword: t.minimumSixChars || 'Minimo 6 caracteres' }));
            return;
        }

        if (!confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: t.confirmPasswordRequired || 'Confirmar contrasena es obligatorio' }));
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: t.passwordsDoNotMatch || 'Las contrasenas no coinciden' }));
            return;
        }

        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            Alert.alert(t.success || 'Exito', t.passwordChangedSuccess || 'Tu contrasena ha sido cambiada correctamente', [
                {
                    text: t.goToLogin || 'Ir a Login',
                    onPress: () => navigation.navigate('Login'),
                },
            ]);
        } catch {
            Alert.alert(t.error || 'Error', t.resetPasswordError || 'No se pudo cambiar la contrasena. Intentalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setTimeLeft(300);
            Alert.alert(t.success || 'Exito', t.codeResentSuccess || 'Se ha reenviado el codigo a tu correo');
        } catch {
            Alert.alert(t.error || 'Error', t.resendCodeError || 'No se pudo reenviar el codigo');
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
            setErrors({});
            return;
        }
        navigation.goBack();
    };

    const stepTitle = step === 1
        ? (t.recoverAccessTitle || 'Recupera tu acceso')
        : step === 2
            ? (t.verifyCodeTitle || 'Verifica tu codigo')
            : (t.createNewPasswordTitle || 'Crea nueva contrasena');

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
                        <View style={styles.heroGlowTop} />
                        <View style={styles.heroGlowBottom} />
                        <Ionicons name="key-outline" size={34} color="#FFFFFF" />
                        <Text style={styles.heroKicker}>{t.recoveryKicker || 'RECUPERACION'}</Text>
                        <Text style={styles.heroTitle}>{stepTitle}</Text>
                        <View style={styles.stepPills}>
                            {[1, 2, 3].map((n) => (
                                <View
                                    key={n}
                                    style={[
                                        styles.stepPill,
                                        { backgroundColor: n <= step ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)' },
                                    ]}
                                >
                                    <Text style={styles.stepPillText}>{n}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        {step === 1 ? (
                            <>
                                <Field
                                    label={t.emailLabel || 'Correo electronico'}
                                    icon="mail-outline"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder={t.emailPlaceholder || 'tu@correo.com'}
                                    keyboardType="email-address"
                                    editable={!loading}
                                    error={errors.email}
                                    theme={theme}
                                />
                                <Text style={[styles.helperText, { color: theme.muted }]}>{t.codeSentHelper || 'Te enviaremos un codigo de 6 digitos.'}</Text>
                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: theme.brand }, loading && styles.disabled]}
                                    onPress={handleRequestReset}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.primaryButtonText}>{t.sendCode || 'Enviar codigo'}</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : null}

                        {step === 2 ? (
                            <>
                                <Field
                                    label={t.verificationCodeLabel || 'Codigo de verificacion'}
                                    icon="shield-checkmark-outline"
                                    value={verificationCode}
                                    onChangeText={setVerificationCode}
                                    placeholder="000000"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    editable={!loading}
                                    error={errors.verificationCode}
                                    theme={theme}
                                />

                                <View style={[styles.timerBox, { backgroundColor: `${theme.brand}14` }]}>
                                    <Ionicons name="hourglass-outline" size={16} color={theme.brand} />
                                    <Text style={[styles.timerText, { color: theme.text }]}>
                                        {t.codeValidFor || 'Codigo valido por'} <Text style={{ color: theme.brand, fontWeight: '700' }}>{formatTime(timeLeft)}</Text>
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: theme.brand }, loading && styles.disabled]}
                                    onPress={handleVerifyCode}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.primaryButtonText}>{t.verifyCode || 'Verificar codigo'}</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                                        </>
                                    )}
                                </TouchableOpacity>

                                {timeLeft === 0 ? (
                                    <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                                        <Text style={[styles.resendText, { color: theme.brandSoft }]}>{t.resendCode || 'Reenviar codigo'}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={[styles.helperTextCenter, { color: theme.muted }]}>{t.resendWhenTimerEnds || 'Podras reenviar cuando termine el temporizador'}</Text>
                                )}
                            </>
                        ) : null}

                        {step === 3 ? (
                            <>
                                <Field
                                    label={t.newPasswordLabel || 'Nueva contrasena'}
                                    icon="lock-closed-outline"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder={t.minimumSixChars || 'Minimo 6 caracteres'}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                    error={errors.newPassword}
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

                                <Field
                                    label={t.confirmPasswordLabel || 'Confirmar contrasena'}
                                    icon="lock-closed-outline"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder={t.repeatPasswordPlaceholder || 'Repite la contrasena'}
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
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.primaryButtonText}>{t.changePasswordCta || 'Cambiar contrasena'}</Text>
                                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : null}

                        <TouchableOpacity style={styles.backRow} onPress={handleGoBack} disabled={loading}>
                            <Ionicons name="arrow-back" size={18} color={theme.brandSoft} />
                            <Text style={[styles.backText, { color: theme.brandSoft }]}>
                                {step === 1 ? (t.backToLogin || 'Volver a Login') : (t.previousStep || 'Paso anterior')}
                            </Text>
                        </TouchableOpacity>
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
        overflow: 'hidden',
    },
    heroGlowTop: {
        position: 'absolute',
        right: -28,
        top: -34,
        width: 120,
        height: 120,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroGlowBottom: {
        position: 'absolute',
        left: -30,
        bottom: -38,
        width: 110,
        height: 110,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.08)',
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
        fontSize: 23,
        fontWeight: '800',
    },
    stepPills: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    stepPill: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepPillText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
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
    helperText: {
        fontSize: 12,
        marginBottom: 10,
    },
    helperTextCenter: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    timerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    timerText: {
        marginLeft: 8,
        fontSize: 13,
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
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.7,
    },
    resendText: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 13,
        fontWeight: '700',
    },
    backRow: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 6,
    },
});
