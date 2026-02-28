import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Platform,
    KeyboardAvoidingView
} from 'react-native';

import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context';

import NotificationService from './Notificaciones';

// Componente para mostrar una notificación individual
const NotificationItem = ({ text, date }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>
            {text} {date ? `\n\n${date}` : ''}
        </Text>
    </View>
);

// ================== COMPONENTE ==================

export default function BuscadorGoogle() {

    const navigation = useNavigation();
    const { colors, t, isDarkMode } = useApp();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [message, setMessage] = useState('');
    const [url, setUrl] = useState(null);

    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) setIsNotificationsOpen(false);
    };

    const toggleNotifications = async () => {
        const newState = !isNotificationsOpen;
        setIsNotificationsOpen(newState);
        if (newState) {
            setIsMenuOpen(false);
            try {
                const allNotifications = await NotificationService.getNotifications();
                setNotificaciones(allNotifications);
            } catch (error) {
                console.error("Error al cargar notificaciones:", error);
                setNotificaciones([]);
            }
        }
    };

    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar style="auto" />

                {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <MaterialIcons name="menu" size={32} color="black" />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <Ionicons name="notifications" size={32} color="black" />
                    <Ionicons name="person-circle-outline" size={32} color="black" />
                </View>
            </View>

            {/* CONTENIDO */}
            <View style={styles.content}>
                <View style={styles.centerMessageContainer}>
                    <Text style={[styles.centerMessage, { color: colors.text }]}>
                        Bienvenido al buscador de Google
                    </Text>
                    <MaterialCommunityIcons
                        name="dog"
                        size={40}
                        color={colors.text}
                        style={{ marginTop: 20 }}
                    />
                </View>
            </View>

            {/* INPUT FIJO Y ELEGANTE */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 15 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.inputRow, { backgroundColor: isDarkMode ? colors.background : '#e9e9e9' }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Pregunta sobre mascotas"
                            placeholderTextColor="#9b9b9b"
                            value={message}
                            onChangeText={setMessage}
                        />

                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: colors.card }]}
                            onPress={() => {
                                if (!message.trim()) return;

                                const googleURL =
                                    'https://www.google.com/search?q=' +
                                    encodeURIComponent(message);

                                setUrl(googleURL);
                            }}
                        >
                            <MaterialCommunityIcons name="send" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* GOOGLE */}
            {url && (
                <View style={[styles.webViewContainer, { backgroundColor: colors.background }]}>
                    <WebView source={{ uri: url }} />
                </View>
            )}

            {/* Fondo oscuro cuando se abre menú o notificaciones */}
            {isOverlayVisible && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleOverlayClick}
                />
            )}

            {/* Menú lateral */}
            <View style={[
                styles.sideMenu,
                { transform: [{ translateX: isMenuOpen ? 0 : -300 }] }
            ]}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menú</Text>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="close" size={30} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Opciones del menú */}
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => { toggleMenu(); navigation.navigate('Home'); }}
                >
                    <Ionicons name="home" size={24} color="black" />
                    <Text style={styles.menuItemText}>Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}>
                    <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                    <Text style={styles.menuItemText}>Mascotas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}>
                    <Ionicons name="calendar-number" size={30} color="#007AFF" />
                    <Text style={styles.menuItemText}>Calendario</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Consejos'); }}>
                    <MaterialIcons name="tips-and-updates" size={30} color="#FF9500" />
                    <Text style={styles.menuItemText}>Consejos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Emergencias'); }}>
                    <MaterialIcons name="emergency" size={30} color="#FF3B30" />
                    <Text style={styles.menuItemText}>Emergencias</Text>
                </TouchableOpacity>
            </View>

            {/* Panel de notificaciones */}
            {isNotificationsOpen && (
                <View style={notificationStyles.notificationsContainer}>
                    <Text style={notificationStyles.headerText}>Notificaciones</Text>
                    <ScrollView style={notificationStyles.list}>
                        {notificaciones.length > 0 ? (
                            notificaciones.map((n, index) => (
                                <NotificationItem key={index} text={n.text} date={n.date} />
                            ))
                        ) : (
                            <Text style={{ textAlign: 'center', color: '#666', marginTop: 10 }}>No hay notificaciones.</Text>
                        )}
                    </ScrollView>
                </View>
            )}

        </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

// ================== ESTILOS ==================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '100%',
        marginBottom: 30,
    },

    headerRight: {
        flexDirection: 'row',
        width: '45%',
        justifyContent: 'space-between',
    },

    menuHamburguesa: {
        padding: 5,
    },

    headerIcon: {
        padding: 5,
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000080',
        zIndex: 10,
    },

    sideMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#fff',
        padding: 20,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        flex: 1,
    },

    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 30,
    },

    menuTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    menuItemText: {
        fontSize: 18,
        marginLeft: 15,
        color: '#333',
    },

    content: {
        flex: 1
    },

    centerMessageContainer: {
        alignItems: 'center',
        paddingTop: 120
    },

    centerMessage: {
        fontSize: 20,
        fontWeight: '700'
    },

    inputContainer: {
        paddingBottom: Platform.OS === 'android' ? 12 : 25,
        paddingTop: 10,
        backgroundColor: '#fff'
    },

    inputRow: {
        width: '92%',
        height: 54,
        backgroundColor: '#e9e9e9',
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        alignSelf: 'center'
    },

    input: {
        flex: 1,
        fontSize: 15
    },

    sendButton: {
        width: 48,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    webViewContainer: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 100
    }
});

// Estilos para las notificaciones
const notificationStyles = StyleSheet.create({
    notificationsContainer: {
        position: 'absolute',
        top: 100,
        right: 30,
        width: 300,
        maxHeight: 400,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        padding: 15,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: 'black',
    },
    list: {
        flexGrow: 0,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
        marginRight: 10,
        marginTop: 5,
        flexShrink: 0,
    },
    notificationText: {
        fontSize: 16,
        flexShrink: 1,
    },
});
