import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Animated, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

export default function Recuperación() {
    const navigation = useNavigation();

    // Estados principales
    const [step, setStep] = useState(1); // 1: Ingreso de email, 2: Código de verificación, 3: Nueva contraseña
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutos

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, [step]);

    // Timer para el código de verificación
    useEffect(() => {
        let timer;
        if (step === 2 && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && step === 2) {
            setTimeLeft(0);
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    // Validar formato de email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validar contraseña segura
    const isValidPassword = (password) => {
        return password.length >= 6;
    };

    // Formatear tiempo restante
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Paso 1: Solicitar recuperación de contraseña
    const handleRequestReset = async () => {
        setErrors({});

        if (!email.trim()) {
            setErrors({ email: 'El correo es obligatorio' });
            return;
        }

        if (!isValidEmail(email)) {
            setErrors({ email: 'Formato de correo inválido' });
            return;
        }

        setLoading(true);
        try {
            // Aquí iría la llamada a tu API para enviar código
            // const response = await authAPI.requestPasswordReset(email);

            // Simulación de delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Avanzar al siguiente paso
            setStep(2);
            setTimeLeft(300);

        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar el código. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Paso 2: Verificar código
    const handleVerifyCode = async () => {
        setErrors({});

        if (!verificationCode.trim()) {
            setErrors({ verificationCode: 'El código es obligatorio' });
            return;
        }

        if (verificationCode.length !== 6) {
            setErrors({ verificationCode: 'El código debe tener 6 dígitos' });
            return;
        }

        setLoading(true);
        try {
            // Aquí iría la llamada a tu API para verificar código
            // const response = await authAPI.verifyCode(email, verificationCode);

            // Simulación de delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Avanzar al siguiente paso
            setStep(3);

        } catch (error) {
            Alert.alert('Error', 'Código inválido. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Paso 3: Cambiar contraseña
    const handleResetPassword = async () => {
        setErrors({});

        if (!newPassword) {
            setErrors(prev => ({ ...prev, newPassword: 'La contraseña es obligatoria' }));
            return;
        }

        if (!isValidPassword(newPassword)) {
            setErrors(prev => ({ ...prev, newPassword: 'Mínimo 6 caracteres' }));
            return;
        }

        if (!confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Confirmar contraseña es obligatorio' }));
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
            return;
        }

        setLoading(true);
        try {
            // Aquí iría la llamada a tu API para cambiar contraseña
            // const response = await authAPI.resetPassword(email, verificationCode, newPassword);

            // Simulación de delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Éxito
            Alert.alert('Éxito', 'Tu contraseña ha sido cambiada correctamente', [
                {
                    text: 'Ir a Login',
                    onPress: () => navigation.navigate('Login'),
                },
            ]);

        } catch (error) {
            Alert.alert('Error', 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Reenviar código
    const handleResendCode = async () => {
        setLoading(true);
        try {
            // Aquí iría la llamada a tu API para reenviar código
            await new Promise(resolve => setTimeout(resolve, 1500));
            setTimeLeft(300);
            Alert.alert('Éxito', 'Se ha reenviado el código a tu correo');
        } catch (error) {
            Alert.alert('Error', 'No se pudo reenviar el código');
        } finally {
            setLoading(false);
        }
    };

    // Volver al paso anterior
    const handleGoBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setErrors({});
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor="#4BCF5C" />

            {/* Encabezado con fondo gradiente */}
            <View style={styles.headerBackground}>
                <Animated.View
                    style={[
                        styles.headerContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Ionicons name="key-outline" size={60} color="#fff" />
                    <Text style={styles.appName}>Recuperar Contraseña</Text>
                    <Text style={styles.tagline}>Paso {step} de 3</Text>
                </Animated.View>
            </View>

            {/* Formulario */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.formContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* PASO 1: Solicitar código */}
                        {step === 1 && (
                            <>
                                <View>
                                    <Text style={styles.formTitle}>Ingresa tu correo</Text>
                                    <Text style={styles.formSubtitle}>Te enviaremos un código para recuperar tu contraseña</Text>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Correo electrónico</Text>
                                        <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                                            <Ionicons name="mail-outline" size={22} color="#4BCF5C" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                value={email}
                                                onChangeText={setEmail}
                                                placeholder="tu@correo.com"
                                                placeholderTextColor="#999"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                editable={!loading}
                                                selectionColor="#4BCF5C"
                                            />
                                        </View>
                                        {errors.email ? (
                                            <View style={styles.errorContainer}>
                                                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                                                <Text style={styles.errorText}>{errors.email}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.disabledButton]}
                                    onPress={handleRequestReset}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="small" color="#fff" />
                                            <Text style={styles.buttonText}>Enviando...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.buttonText}>Enviar código</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        {/* PASO 2: Verificar código */}
                        {step === 2 && (
                            <>
                                <View>
                                    <Text style={styles.formTitle}>Verifica tu código</Text>
                                    <Text style={styles.formSubtitle}>Hemos enviado un código de 6 dígitos a {email}</Text>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Código de verificación</Text>
                                        <View style={[styles.inputWrapper, errors.verificationCode && styles.inputWrapperError]}>
                                            <Ionicons name="shield-checkmark-outline" size={22} color="#4BCF5C" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                value={verificationCode}
                                                onChangeText={setVerificationCode}
                                                placeholder="000000"
                                                placeholderTextColor="#999"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                editable={!loading}
                                                selectionColor="#4BCF5C"
                                            />
                                        </View>
                                        {errors.verificationCode ? (
                                            <View style={styles.errorContainer}>
                                                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                                                <Text style={styles.errorText}>{errors.verificationCode}</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    {/* Timer */}
                                    <View style={styles.timerContainer}>
                                        <Ionicons name="hourglass-outline" size={18} color="#4BCF5C" />
                                        <Text style={styles.timerText}>
                                            Código válido por: <Text style={styles.timerBold}>{formatTime(timeLeft)}</Text>
                                        </Text>
                                    </View>
                                </View>

                                <View>
                                    <TouchableOpacity
                                        style={[styles.submitButton, loading && styles.disabledButton]}
                                        onPress={handleVerifyCode}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator size="small" color="#fff" />
                                                <Text style={styles.buttonText}>Verificando...</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.buttonContent}>
                                                <Text style={styles.buttonText}>Verificar código</Text>
                                                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    {timeLeft === 0 ? (
                                        <TouchableOpacity
                                            style={styles.resendButton}
                                            onPress={handleResendCode}
                                            disabled={loading}
                                        >
                                            <Text style={styles.resendText}>¿No recibiste el código? Reenviar</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={styles.resendDisabled}>¿No recibiste el código? Espera para reenviar</Text>
                                    )}
                                </View>
                            </>
                        )}

                        {/* PASO 3: Nueva contraseña */}
                        {step === 3 && (
                            <>
                                <View>
                                    <Text style={styles.formTitle}>Nueva contraseña</Text>
                                    <Text style={styles.formSubtitle}>Crea una nueva contraseña segura para tu cuenta</Text>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Nueva contraseña</Text>
                                        <View style={[styles.inputWrapper, errors.newPassword && styles.inputWrapperError]}>
                                            <Ionicons name="lock-closed-outline" size={22} color="#4BCF5C" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                value={newPassword}
                                                onChangeText={setNewPassword}
                                                placeholder="Mínimo 6 caracteres"
                                                placeholderTextColor="#999"
                                                secureTextEntry={!showPassword}
                                                editable={!loading}
                                                selectionColor="#4BCF5C"
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => setShowPassword(!showPassword)}
                                                disabled={loading}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Ionicons
                                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                    size={22}
                                                    color="#4BCF5C"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {errors.newPassword ? (
                                            <View style={styles.errorContainer}>
                                                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                                                <Text style={styles.errorText}>{errors.newPassword}</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Confirmar contraseña</Text>
                                        <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
                                            <Ionicons name="lock-closed-outline" size={22} color="#4BCF5C" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                placeholder="Confirma tu contraseña"
                                                placeholderTextColor="#999"
                                                secureTextEntry={!showConfirmPassword}
                                                editable={!loading}
                                                selectionColor="#4BCF5C"
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={loading}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Ionicons
                                                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                                    size={22}
                                                    color="#4BCF5C"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {errors.confirmPassword ? (
                                            <View style={styles.errorContainer}>
                                                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                                                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.disabledButton]}
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="small" color="#fff" />
                                            <Text style={styles.buttonText}>Cambiando...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.buttonText}>Cambiar contraseña</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Botón volver */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleGoBack}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={20} color="#4BCF5C" />
                            <Text style={styles.backButtonText}>
                                {step === 1 ? 'Volver a Login' : 'Paso anterior'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerBackground: {
        backgroundColor: '#4BCF5C',
        paddingTop: 40,
        paddingBottom: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4BCF5C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        alignItems: 'center',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 15,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: '#e8f5e9',
        marginTop: 8,
        fontWeight: '500',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        flexGrow: 1,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    formTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 15,
        color: '#666',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 22,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 14,
        height: 52,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputWrapperError: {
        borderColor: '#FF3B30',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 8,
        marginLeft: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginTop: 20,
    },
    timerText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 10,
    },
    timerBold: {
        fontWeight: 'bold',
        color: '#4BCF5C',
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#4BCF5C',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#4BCF5C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendButton: {
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    resendText: {
        color: '#4BCF5C',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    resendDisabled: {
        color: '#999',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    backButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    backButtonText: {
        color: '#4BCF5C',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});
