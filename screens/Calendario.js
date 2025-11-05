import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import React from 'react';
import { Calendar } from 'react-native-calendars';

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
    'Recordatorio: Próximo medicamento.',
    'Hola'
];

export default function Calendario() {
    const navigation = useNavigation(); // Hook para cambiar de pantalla
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado del menú lateral
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // Estado del panel de notificaciones
    const today = new Date().toISOString().split('T')[0]; // Fecha actual
    const [selectedDate, setSelectedDate] = useState(''); // Fecha seleccionada en el calendario

    // Fechas de eventos (rojos) y citas (azules)
    const [events] = useState(['2025-11-30', '2025-11-17']);
    const [appointments] = useState(['2025-11-04', '2025-11-07']);

    // Función que marca las fechas con puntos de colores en el calendario
    const getMarkedDates = () => {
        const marked = {};

        // Fechas de eventos
        events.forEach(date => {
            if (!marked[date]) marked[date] = { dots: [] };
            marked[date].dots.push({ key: `event-${date}`, color: 'red', selectedDotColor: 'white' });
        });

        // Fechas de citas
        appointments.forEach(date => {
            if (!marked[date]) marked[date] = { dots: [] };
            marked[date].dots.push({ key: `appt-${date}`, color: 'blue', selectedDotColor: 'white' });
        });

        // Fecha seleccionada por el usuario
        if (selectedDate) {
            const prev = marked[selectedDate] || {};
            marked[selectedDate] = {
                ...prev,
                selected: true,
                selectedColor: '#4CAF50'
            };
        }

        return marked;
    };

    // Abre o cierra el menú lateral
    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) setIsNotificationsOpen(false);
    };

    // Abre o cierra el panel de notificaciones
    const toggleNotifications = () => {
        const newState = !isNotificationsOpen;
        setIsNotificationsOpen(newState);
        if (newState) setIsMenuOpen(false);
    };

    // Cierra el menú o las notificaciones si se toca fuera
    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen; // Detecta si hay algo abierto (menu o notificaciones)

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {/* --- Encabezado superior --- */}
            <View style={styles.header}>
                {/* Botón de menú hamburguesa */}
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} color="black" />
                </TouchableOpacity>

                {/* Íconos del lado derecho: notificaciones y perfil */}
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

            {/* --- Contenido principal --- */}
            <ScrollView contentContainerStyle={styles.content}>
                {/* Tarjeta con título */}
                <View style={styles.card}>
                    <Text style={styles.title}>Calendario</Text>
                    <Text style={styles.subtitle}>¡En este apartado te mostrara las fechas de tus citas!</Text>
                </View>

                {/* Calendario interactivo */}
                <View style={{ paddingBottom: 30 }}>
                    <Calendar
                        onDayPress={day => setSelectedDate(day.dateString)}
                        markingType={'multi-dot'}
                        markedDates={getMarkedDates()}
                        theme={{
                            todayTextColor: '#007AFF',
                            arrowColor: '#4CAF50',
                        }}
                    />

                    {selectedDate ? (
                        <Text style={styles.dateText}>Fecha elegida: {selectedDate}</Text>
                    ) : null}

                    <View style={styles.card}>
                        <View style={styles.row}>
                            <FontAwesome5 name="circle" size={16} color="red" />
                            <Text style={styles.subtitlebottom}>Eventos de vacunación</Text>
                        </View>

                        <View style={styles.row}>
                            <FontAwesome5 name="circle" size={16} color="blue" />
                            <Text style={styles.subtitlebottom}>Citas</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* --- Fondo oscuro cuando se abre el menú o notificaciones --- */}
            {isOverlayVisible && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleOverlayClick}
                />
            )}

            {/* --- Menú lateral --- */}
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

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Mascotas')}
                >
                    <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                    <Text style={styles.menuItemText}>Mascotas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => alert('Ya te encuentras en calendario')}
                >
                    <Ionicons name="calendar-number" size={30} color="#007AFF" />
                    <Text style={styles.menuItemText}>Calendario</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Consejos')}
                >
                    <MaterialIcons name="tips-and-updates" size={30} color="#FF9500" />
                    <Text style={styles.menuItemText}>Consejos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Emergencias')}
                >
                    <MaterialIcons name="emergency" size={30} color="#FF3B30" />
                    <Text style={styles.menuItemText}>Emergencias</Text>
                </TouchableOpacity>
            </View>

            {/* --- Panel de notificaciones --- */}
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
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 50,
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
    card: {
        backgroundColor: '#e0e0e0',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        color: '#555',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    subtitlebottom: {
        marginLeft: 8,
        fontSize: 16,
    },
    dateText: {
        marginTop: 20,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '500',
        color: '#333',
        marginBottom: 30,
    },
    vaccineButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    vaccineButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vaccineButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        marginRight: 5,
    },
    floatingBtn: {
        padding: 0,
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 0,
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