import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function HomeScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    // Estados
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);

    const [upcomingVacunas, setUpcomingVacunas] = useState([]);
    const [upcomingCitas, setUpcomingCitas] = useState([]);
    const [appliedVacunas, setAppliedVacunas] = useState([]);
    const [appliedCitas, setAppliedCitas] = useState([]);


    // Función auxiliar para formatear la fecha
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return isNaN(date) ? dateString : date.toLocaleDateString('es-ES', options);
    };

    // Función para determinar si una fecha es pasada (corregida para evitar problemas de zona horaria)
    // Función para determinar si una fecha es pasada (mejorada)
    const isPastDate = (dateString) => {
        try {
            // Parsear YYYY-MM-DD
            const [year, month, day] = dateString.split('-').map(Number);

            // Crear fecha objetivo en hora local (mes es 0-indexado)
            const targetDate = new Date(year, month - 1, day);

            // Crear la fecha de HOY, normalizada a 00:00:00 hora local
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            console.log(`Comparando: ${dateString} (${targetDate}) vs hoy (${startOfToday}) - esPasada: ${targetDate < startOfToday}`); // ← DEBUG

            return targetDate < startOfToday;
        } catch (error) {
            console.error('Error en isPastDate:', error, 'fecha:', dateString);
            return false;
        }
    };

    // Función para cargar citas desde AsyncStorage y separarlas por estado y tipo
    const loadCitas = async () => {
        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            console.log('Datos crudos de AsyncStorage:', citasRaw); // ← DEBUG

            const allCitas = citasRaw ? JSON.parse(citasRaw) : [];
            console.log('Citas parseadas:', allCitas); // ← DEBUG

            const proxVacunas = [];
            const proxCitas = [];
            const pasadasVacunas = [];
            const pasadasCitas = [];

            allCitas.forEach(cita => {
                console.log('Procesando cita:', cita); // ← DEBUG

                const esPasada = isPastDate(cita.fecha);

                // CRITERIO CLARO DE CLASIFICACIÓN
                const esVacuna = cita.tipo === 'Vacuna' || cita.veterinaria === 'Vacuna Registrada';
                const esCita = cita.tipo === 'Cita';

                console.log(`Cita ${cita.id}: fecha=${cita.fecha}, tipo=${cita.tipo}, esPasada=${esPasada}, esVacuna=${esVacuna}, esCita=${esCita}`); // ← DEBUG

                if (esPasada) {
                    if (esVacuna) {
                        pasadasVacunas.push(cita);
                    } else if (esCita) {
                        pasadasCitas.push(cita);
                    }
                } else {
                    if (esVacuna) {
                        proxVacunas.push(cita);
                    } else if (esCita) {
                        proxCitas.push(cita);
                    }
                }
            });

            console.log('Próximas vacunas:', proxVacunas); // ← DEBUG
            console.log('Próximas citas:', proxCitas); // ← DEBUG
            console.log('Vacunas pasadas:', pasadasVacunas); // ← DEBUG
            console.log('Citas pasadas:', pasadasCitas); // ← DEBUG

            // Ordenar por fecha
            proxVacunas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            proxCitas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            pasadasVacunas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            pasadasCitas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            // Actualizar estados
            setUpcomingVacunas(proxVacunas.slice(0, 2));
            setUpcomingCitas(proxCitas.slice(0, 2));
            setAppliedVacunas(pasadasVacunas.slice(0, 3));
            setAppliedCitas(pasadasCitas.slice(0, 3));

        } catch (error) {
            console.error("Error al cargar citas:", error);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadCitas();
        }
    }, [isFocused]);

    // --- Lógica de Navegación y Menús ---

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

                {/* 1. Tarjeta: PRÓXIMAS VACUNAS */}
                <View style={[styles.card, styles.cardUpcoming]}>
                    <Text style={styles.title}>💉 Próximas Vacunas</Text>
                    {upcomingVacunas.length > 0 ? (
                        upcomingVacunas.map((cita, index) => (
                            <View key={index} style={styles.listItem}>
                                <FontAwesome5 name="syringe" size={16} color="#007AFF" />
                                <Text style={styles.listText}>
                                    "{cita.usuario}": {cita.veterinaria} el {formatDate(cita.fecha)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No hay vacunas próximas programadas.</Text>
                    )}
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Calendario')}>
                        <Text style={styles.buttonText}>Ver Calendario</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Tarjeta: PRÓXIMAS CITAS (Veterinario, etc.) */}
                <View style={[styles.card, styles.cardUpcoming]}>
                    <Text style={styles.title}>📅 Próximas Citas</Text>
                    {upcomingCitas.length > 0 ? (
                        upcomingCitas.map((cita, index) => (
                            <View key={index} style={styles.listItem}>
                                <Ionicons name="calendar" size={16} color="#007AFF" />
                                <Text style={styles.listText}>
                                    "{cita.usuario}": {cita.veterinaria} el {formatDate(cita.fecha)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No hay otras citas próximas programadas.</Text>
                    )}
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Calendario')}>
                        <Text style={styles.buttonText}>Ver Calendario</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. Tarjeta: VACUNAS Y CITAS APLICADAS*/}
                <View style={[styles.card, styles.cardApplied]}>
                    <Text style={styles.title}>✅ Historial Aplicado</Text>

                    {/* Subsección: Vacunas Pasadas */}
                    <Text style={styles.subtitleApplied}>Vacunas:</Text>
                    {appliedVacunas.length > 0 ? (
                        appliedVacunas.map((cita, index) => (
                            <View key={index} style={styles.listItem}>
                                <FontAwesome5 name="check-circle" size={16} color="#4CAF50" />
                                <Text style={styles.listTextApplied}>
                                    "{cita.usuario}": {cita.veterinaria} el {formatDate(cita.fecha)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataTextApplied}>Aún no hay vacunas registradas.</Text>
                    )}

                    {/* Subsección: Citas Pasadas */}
                    <Text style={[styles.subtitleApplied, { marginTop: 15 }]}>Otras Citas:</Text>
                    {appliedCitas.length > 0 ? (
                        appliedCitas.map((cita, index) => (
                            <View key={index} style={styles.listItem}>
                                <Ionicons name="time" size={16} color="#66BB6A" />
                                <Text style={styles.listTextApplied}>
                                    "{cita.usuario}": {cita.veterinaria} el {formatDate(cita.fecha)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataTextApplied}>Aún no hay otras citas registradas.</Text>
                    )}
                </View>

                {/* Tarjeta de recordatorios fijos */}
                <View style={[styles.card, styles.cardReminder]}>
                    <Text style={styles.title}>Recordatorios</Text>
                    <View style={styles.listItem}>
                        <MaterialIcons name="alarm" size={16} color="#FF9500" />
                        <Text style={styles.listText}>Visita al médico cada mes</Text>
                    </View>
                    <View style={styles.listItem}>
                        <MaterialIcons name="alarm" size={16} color="#FF9500" />
                        <Text style={styles.listText}>Alimentarlo por porciones</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Botón flotante izquierdo*/}
            <TouchableOpacity style={styles.floatingBtnLeft} onPress={() => navigation.navigate('ChatBot')}>
                <MaterialCommunityIcons name="robot" size={24} color="black" />
            </TouchableOpacity>

            {/* Botón flotante derecho*/}
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
        paddingBottom: 120,
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
    // Estilos de Tarjetas y Contenido
    card: {
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
    },
    cardUpcoming: {
        borderColor: "#007AFF",
        backgroundColor: "#E3F2FD",
    },
    cardApplied: {
        borderColor: "#4CAF50",
        backgroundColor: '#E8F5E9',
    },
    cardReminder: {
        borderColor: "#FF9500",
        backgroundColor: '#FFF3E0',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
        color: '#333',
    },
    subtitleApplied: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 5,
        color: '#388E3C',
        borderBottomWidth: 1,
        borderBottomColor: '#66BB6A',
        paddingBottom: 2,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#0000000d',
    },
    listText: {
        fontSize: 15,
        marginLeft: 10,
        flexShrink: 1,
        fontWeight: '500',
    },
    listTextApplied: {
        fontSize: 15,
        marginLeft: 10,
        color: '#388E3C',
        flexShrink: 1,
    },
    noDataText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        paddingVertical: 10,
    },
    noDataTextApplied: {
        fontSize: 14,
        color: '#66BB6A',
        textAlign: 'center',
        paddingVertical: 10,
    },
    button: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Estilos de Botones Flotantes
    floatingBtnLeft: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 50,
        elevation: 5,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    floatingBtnRight: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 50,
        elevation: 5,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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
        flexShrink: 0,
    },
    notificationText: {
        fontSize: 16,
        flexShrink: 1,
    },
});