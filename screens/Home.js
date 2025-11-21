import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import React from 'react';

// Componente para mostrar una notificación individual
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

export default function HomeScreen() {
    const navigation = useNavigation();

    // Estados para abrir/cerrar menú y notificaciones
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Abrir o cerrar el menú lateral
    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) {
            setIsNotificationsOpen(false);
        }
    };

    // Abrir o cerrar el panel de notificaciones
    const toggleNotifications = () => {
        const newState = !isNotificationsOpen;
        setIsNotificationsOpen(newState);
        if (newState) {
            setIsMenuOpen(false);
        }
    };

    // Cerrar todo si se toca el fondo oscuro
    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {/* Encabezado con menú, notificaciones y perfil */}
            <View style={styles.header}>
                {/* Botón menú hamburguesa */}
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} color="black" />
                </TouchableOpacity>

                {/* Íconos de notificaciones y perfil */}
                <View style={styles.headerRight}>
                    <TouchableOpacity style={[styles.headerIcon]} onPress={toggleNotifications}>
                        <Ionicons name="notifications" size={32} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.headerIcon]}
                        onPress={() => navigation.navigate('Perfil')}
                    >
                        <Ionicons name="person-circle-outline" size={32} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contenido principal */}
            <View style={styles.content}>
                {/* Tarjeta de próximas vacunas */}
                <View style={styles.card}>
                    <Text style={styles.title}>Próxima Vacuna / Cita</Text>
                    <Text>Lunes 27 de Octubre</Text>
                    <Text>Jueves 20 de Noviembre</Text>
                </View>

                {/* Tarjeta de recordatorios */}
                <View style={styles.card}>
                    <Text style={styles.title}>Recordatorios</Text>
                    <Text>Visita al médico cada mes</Text>
                    <Text>Alimentarlo por porciones</Text>
                </View>
            </View>

            {/* Botón flotante izquierdo (ChatBot) */}
            <TouchableOpacity style={styles.floatingBtnLeft} onPress={() => navigation.navigate('ChatBot')}>
                <MaterialCommunityIcons name="robot" size={24} color="black" />
            </TouchableOpacity>

            {/* Botón flotante derecho (Agregar mascota) */}
            <TouchableOpacity style={styles.floatingBtnRight} onPress={() => navigation.navigate('RegistroMascota')}>
                <MaterialCommunityIcons name="plus-circle-outline" size={24} color="black" />
            </TouchableOpacity>

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
                    onPress={() => alert('Ya te encuentras en inicio')}
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
                        {notificationsData.map((text, index) => (
                            <NotificationItem key={index} text={text} />
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

// Estilos principales
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 20,
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
        padding: 15,
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
    card: {
        backgroundColor: '#e0e0e0',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    floatingBtn: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 50,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    floatingBtnLeft: {
        position: 'absolute',
        top: 685,
        left: 20,
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 50,
        elevation: 5,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingBtnRight: {
        position: 'absolute',
        top: 685,
        right: 20,
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 50,
        elevation: 5,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    },
    notificationText: {
        fontSize: 16,
    },
});
