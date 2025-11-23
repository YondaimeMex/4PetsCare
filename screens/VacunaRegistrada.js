import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import React from 'react';

// Componente para mostrar cada notificación
const NotificationItem = ({ text }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>{text}</Text>
    </View>
);

// Lista de notificaciones
const notificationsData = [
    '¡Se acerca el día de la cita! ¿Ya tienes todo preparado?',
    '¡Campaña de vacunacion!, el día 30 de Octubre',
    'Recordatorio: Próxima dosis de medicamento.',
    'Hola'
];

export default function VacunaRegistrada() {
    const navigation = useNavigation();
    const route = useRoute();
    const { fechaAplicada } = route.params || {}; // Recibe la fecha desde la pantalla anterior

    // Estados del menú y notificaciones
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Función para abrir/cerrar menú lateral
    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) setIsNotificationsOpen(false);
    };

    // Función para abrir/cerrar notificaciones
    const toggleNotifications = () => {
        const newState = !isNotificationsOpen;
        setIsNotificationsOpen(newState);
        if (newState) setIsMenuOpen(false);
    };

    // Cierra menú o notificaciones al tocar fuera
    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };

    // Botón para volver al Home
    const handleAccept = () => {
        navigation.navigate('Home');
    };

    // Muestra fondo oscuro si menú o notificaciones están abiertos
    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {/* Encabezado con íconos */}
            <View style={styles.header}>
                {/* Botón menú */}
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} color="black" />
                </TouchableOpacity>

                {/* Íconos de notificación y perfil */}
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon} onPress={toggleNotifications}>
                        <Ionicons name="notifications" size={32} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={() => navigation.navigate('Perfil')}
                    >
                        <Ionicons name="person-circle-outline" size={32} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contenido principal */}
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.cardVisualizacion}>
                    <Text style={styles.titleVisualizacion}>¡Vacuna Registrada!</Text>
                    <Text style={styles.subtitleVisualizacion}>La fecha de aplicación fue:</Text>
                </View>

                {/* Muestra la fecha registrada */}
                {fechaAplicada ? (
                    <Text style={styles.dateTextVisualizacion}>{fechaAplicada}</Text>
                ) : (
                    <Text style={[styles.dateTextVisualizacion, { color: '#FF3B30' }]}>
                        No se encontró la fecha de registro.
                    </Text>
                )}

                {/* Botón para aceptar y regresar */}
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={handleAccept}
                >
                    <Text style={styles.acceptButtonText}>Aceptar</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Fondo oscuro al abrir menú o notificaciones */}
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
                    onPress={() => navigation.navigate('Home')}
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

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); console.log('Emergencias'); }}>
                    <MaterialIcons name="emergency" size={30} color="#FF3B30" />
                    <Text style={styles.menuItemText}>Emergencias</Text>
                </TouchableOpacity>
            </View>

            {/* Panel de notificaciones */}
            {isNotificationsOpen && (
                <View style={notificationStyles.notificationsContainer}>
                    <Text style={notificationStyles.headerText}>Notificaciones</Text>
                    <ScrollView style={notificationStyles.list}>
                        {notificationsData.map((text, index) => (
                            <NotificationItem key={index} text={text} />
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 50,
        alignItems: 'center'
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
        marginBottom: 30
    },
    headerRight: {
        flexDirection: 'row',
        width: '45%',
        justifyContent: 'space-between'
    },
    menuHamburguesa: {
        padding: 5
    },
    headerIcon: {
        padding: 5
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000080',
        zIndex: 10
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
        shadowOffset: {
            width: 4,
            height: 0
        }, shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        flex: 1
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 30
    },
    menuTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    menuItemText: {
        fontSize: 18,
        marginLeft: 15,
        color: '#333'
    },

    cardVisualizacion: {
        backgroundColor: '#D4EDDA',
        padding: 25,
        borderRadius: 10,
        marginBottom: 30,
        width: '100%',
        alignItems: 'center',
    },
    titleVisualizacion: {
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 10,
        textAlign: 'center',
        color: '#155724',
    },
    subtitleVisualizacion: {
        fontSize: 18,
        textAlign: 'center',
        color: '#155724',
    },
    dateTextVisualizacion: {
        marginTop: 10,
        fontSize: 36,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 40,
    },

    acceptButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
        elevation: 5,
        marginTop: 30,
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

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
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: 'black'
    },
    list: {
        flexGrow: 0
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
        marginRight: 10,
        marginTop: 5,
        flexShrink: 0
    },
    notificationText: {
        fontSize: 16,
        flexShrink: 1
    },
});