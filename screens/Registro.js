import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

// 👇 Usa tu IP local y puerto del backend
const API_BASE_URL = "http://192.168.18.69:3000";

export default function Registro() {
    const navigation = useNavigation();

    // Estados del formulario
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    }, []);

    // Validar formato de email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validar contraseña segura
    const isValidPassword = (password) => {
        return password.length >= 6;
    };

    // Manejar registro (conectado a la API)
    const handleRegister = async () => {
        // Resetear errores
        setErrors({ username: '', email: '', password: '', confirmPassword: '' });

        // Validar campos
        let hasErrors = false;

        // Validar usuario
        if (!username.trim()) {
            setErrors(prev => ({ ...prev, username: 'El nombre de usuario es obligatorio' }));
            hasErrors = true;
        } else if (username.trim().length < 3) {
            setErrors(prev => ({ ...prev, username: 'Mínimo 3 caracteres' }));
            hasErrors = true;
        }

        // Validar email
        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: 'El correo es obligatorio' }));
            hasErrors = true;
        } else if (!isValidEmail(email)) {
            setErrors(prev => ({ ...prev, email: 'Formato de correo inválido' }));
            hasErrors = true;
        }

        // Validar contraseña
        if (!password) {
            setErrors(prev => ({ ...prev, password: 'La contraseña es obligatoria' }));
            hasErrors = true;
        } else if (!isValidPassword(password)) {
            setErrors(prev => ({ ...prev, password: 'Mínimo 6 caracteres' }));
            hasErrors = true;
        }

        // Validar confirmación de contraseña
        if (!confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Confirmar contraseña es obligatorio' }));
            hasErrors = true;
        } else if (password !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
            hasErrors = true;
        }

        if (hasErrors) return;

        // Llamada real a la API de registro
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: username.trim(), // el backend espera "nombre"
                    email: email.trim(),
                    password: password,
                    // telefono: puedes agregar un campo en el formulario si lo necesitas
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Error', data.message || 'No se pudo completar el registro.');
                return;
            }

            // Registro exitoso
            Alert.alert(
                'Registro exitoso',
                'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                [
                    {
                        text: 'Ir a Login',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );

            // Opcional: limpiar campos
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    // Navegar a Login
    const handleBackToLogin = () => {
        navigation.goBack();
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
                    <Ionicons name="person-add" size={60} color="#fff" />
                    <Text style={styles.appName}>Crear Cuenta</Text>
                    <Text style={styles.tagline}>Únete a 4PetsCare</Text>
                </Animated.View>
            </View>

            {/* Formulario de Registro */}
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
                        <Text style={styles.formTitle}>Regístrate</Text>
                        <Text style={styles.formSubtitle}>Crea tu cuenta para comenzar</Text>

                        {/* Campo Usuario */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Usuario</Text>
                            <View style={[styles.inputWrapper, errors.username && styles.inputWrapperError]}>
                                <Ionicons name="person-outline" size={22} color="#4BCF5C" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Tu nombre de usuario"
                                    placeholderTextColor="#999"
                                    editable={!loading}
                                    selectionColor="#4BCF5C"
                                />
                            </View>
                            {errors.username ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                                    <Text style={styles.errorText}>{errors.username}</Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Campo Correo */}
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

                        {/* Campo Contraseña */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Contraseña</Text>
                            <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                                <Ionicons name="lock-closed-outline" size={22} color="#4BCF5C" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
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
                            {errors.password ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                                    <Text style={styles.errorText}>{errors.password}</Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Campo Confirmar Contraseña */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirmar Contraseña</Text>
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

                        {/* Botón Registrarse */}
                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.disabledButton]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.buttonText}>Registrando...</Text>
                                </View>
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonText}>Registrarse</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Separador */}
                        <View style={styles.separatorContainer}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>¿Ya tienes cuenta?</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        {/* Botón Volver a Login */}
                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={handleBackToLogin}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.loginLinkText}>Inicia sesión aquí</Text>
                        </TouchableOpacity>

                        {/* Pie de página */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Al registrarte, aceptas nuestros</Text>
                            <View style={styles.footerLinks}>
                                <TouchableOpacity>
                                    <Text style={styles.footerLink}>Términos de servicio</Text>
                                </TouchableOpacity>
                                <Text style={styles.footerText}> y </Text>
                                <TouchableOpacity>
                                    <Text style={styles.footerLink}>Política de privacidad</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
    registerButton: {
        width: '100%',
        backgroundColor: '#4BCF5C',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
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
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    separatorText: {
        marginHorizontal: 15,
        color: '#999',
        fontSize: 13,
        fontWeight: '500',
    },
    loginLink: {
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginLinkText: {
        color: '#4BCF5C',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    footer: {
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerText: {
        color: '#999',
        fontSize: 11,
        fontWeight: '500',
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
        flexWrap: 'wrap',
    },
    footerLink: {
        color: '#4BCF5C',
        fontSize: 11,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
