import React, { useContext, useState } from 'react';
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
import { AuthContext } from '../App';
import { supabase } from '../lib/Supabase';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function Login() {
    const navigation = useNavigation();
    const { setIsLoggedIn } = useContext(AuthContext);
    const { colors, t } = useApp();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const isValidEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleLogin = async () => {
        setErrors({ email: '', password: '' });

        let hasErrors = false;
        if (!email.trim()) {
            setErrors((prev) => ({ ...prev, email: t.emailRequiredLogin || 'El correo es obligatorio' }));
            hasErrors = true;
        } else if (!isValidEmail(email)) {
            setErrors((prev) => ({ ...prev, email: t.invalidEmailFormat || 'Formato de correo invalido' }));
            hasErrors = true;
        }

        if (!password) {
            setErrors((prev) => ({ ...prev, password: t.passwordRequiredLogin || 'La contrasena es obligatoria' }));
            hasErrors = true;
        } else if (password.length < 6) {
            setErrors((prev) => ({ ...prev, password: t.minimumSixChars || 'Minimo 6 caracteres' }));
            hasErrors = true;
        }

        if (hasErrors) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                Alert.alert(t.error || 'Error', error.message || t.invalidCredentials || 'Credenciales invalidas');
                return;
            }

            console.log('Usuario logueado:', data.user);
            setIsLoggedIn(true);
        } catch (error) {
            console.error(error);
            Alert.alert(t.error || 'Error', t.serverConnectionError || 'No se pudo conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const brand = colors?.primaryDark || '#2F6E4F';
    const brandSoft = colors?.primary || '#43A047';
    const accent = colors?.accent || '#FF7F5A';
    const pageBackground = colors?.backgroundLight || '#F6F8F4';
    const cardBackground = colors?.background || '#FFFFFF';
    const border = colors?.border || '#E5EAE6';
    const textMain = colors?.text || '#22352D';
    const textMuted = colors?.textMuted || '#5D6E64';

    return (
        <ScreenWrapper showHeader={false}>
            <View style={[styles.container, { backgroundColor: pageBackground }]}>
                <View style={[styles.hero, { backgroundColor: brand }]}>
                    <View style={styles.brandRow}>
                        <Ionicons name="paw" size={30} color="#FFFFFF" />
                        <Text style={styles.heroBrand}>4PetsCare</Text>
                    </View>
                    <Text style={styles.heroClaim}>{t.loginClaim || 'Cuidar mejor empieza aqui. Tu centro de salud para mascotas.'}</Text>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.formCard, { backgroundColor: cardBackground, borderColor: border }]}>
                            <Text style={[styles.title, { color: textMain }]}>{t.welcomeBack || 'Bienvenido de vuelta'}</Text>
                            <Text style={[styles.subtitle, { color: textMuted }]}>{t.loginSubtitle || 'Administra vacunas, citas y bienestar en un solo lugar.'}</Text>

                            <Text style={[styles.label, { color: textMain }]}>{t.emailLabel || 'Correo electronico'}</Text>
                            <View
                                style={[
                                    styles.inputShell,
                                    {
                                        borderColor: errors.email ? '#FF3B30' : border,
                                        backgroundColor: pageBackground,
                                    },
                                ]}
                            >
                                <Ionicons name="mail-outline" size={20} color={brandSoft} style={styles.leadingIcon} />
                                <TextInput
                                    style={[styles.input, { color: textMain }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder={t.emailPlaceholder || 'tu@correo.com'}
                                    placeholderTextColor={textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                    selectionColor={brandSoft}
                                />
                            </View>
                            {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                            <Text style={[styles.label, { color: textMain }]}>{t.passwordLabel || 'Contrasena'}</Text>
                            <View
                                style={[
                                    styles.inputShell,
                                    {
                                        borderColor: errors.password ? '#FF3B30' : border,
                                        backgroundColor: pageBackground,
                                    },
                                ]}
                            >
                                <Ionicons name="lock-closed-outline" size={20} color={brandSoft} style={styles.leadingIcon} />
                                <TextInput
                                    style={[styles.input, { color: textMain }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder={t.minimumSixChars || 'Minimo 6 caracteres'}
                                    placeholderTextColor={textMuted}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                    selectionColor={brandSoft}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                    disabled={loading}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={brandSoft}
                                    />
                                </TouchableOpacity>
                            </View>
                            {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                            <TouchableOpacity
                                style={styles.forgotWrap}
                                onPress={() => navigation.navigate('Recuperación')}
                                disabled={loading}
                            >
                                <Text style={[styles.forgot, { color: brand }]}>{t.recoverPassword || 'Recuperar contrasena'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.primaryBtn, { backgroundColor: brand }, loading && styles.disabledButton]}
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                {loading ? (
                                    <View style={styles.loadingRow}>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text style={styles.primaryBtnText}>{t.loggingIn || 'Iniciando sesion...'}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.ctaRow}>
                                        <Text style={styles.primaryBtnText}>{t.enterApp || 'Entrar a 4PetsCare'}</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.secondaryBtn, { borderColor: brand }, loading && styles.disabledButton]}
                                onPress={() => navigation.navigate('Registro')}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                <View style={styles.ctaRow}>
                                    <Ionicons name="person-add-outline" size={18} color={brand} />
                                    <Text style={[styles.secondaryBtnText, { color: brand }]}>{t.createAccount || 'Crear cuenta'}</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={[styles.trustWrap, { borderTopColor: border }]}>
                                <Ionicons name="shield-checkmark-outline" size={16} color={accent} />
                                <Text style={[styles.trustText, { color: textMuted }]}>{t.protectedData || 'Tus datos estan protegidos y sincronizados.'}</Text>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hero: {
        paddingTop: 48,
        paddingBottom: 28,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    heroBrand: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
    heroClaim: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        color: '#DFECE5',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 24,
    },
    formCard: {
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 18,
        paddingVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    label: {
        marginTop: 10,
        marginBottom: 8,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    inputShell: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    leadingIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 4,
        marginLeft: 8,
    },
    errorText: {
        marginTop: 6,
        color: '#FF3B30',
        fontSize: 12,
        fontWeight: '600',
    },
    forgotWrap: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    forgot: {
        fontSize: 13,
        fontWeight: '700',
    },
    primaryBtn: {
        marginTop: 18,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    ctaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    secondaryBtn: {
        marginTop: 10,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.65,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    trustWrap: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
