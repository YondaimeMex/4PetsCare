import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NotificationService from './Notificaciones';

// --- COMPONENTES AUXILIARES ---

// Componente para mostrar cada notificación
const NotificationItem = ({ text, date }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>{text} {"\n"}<Text style={{ fontSize: 12, color: '#555' }}>{date}</Text></Text>
    </View>
);

// Componente para mostrar los detalles de la cita
const CitaDetailItem = ({ cita, onDelete }) => (
    <View style={styles.detailCard}>
        <Ionicons name="paw" size={20} color="#007AFF" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
            <Text style={styles.detailTextTitle}>Cita Programada</Text>
            <Text style={styles.detailText}>Usuario: {cita.usuario}</Text>
            <Text style={styles.detailText}>Veterinaria: {cita.veterinaria}</Text>
        </View>
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(cita)}
        >
            <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
    </View>
);

// --- COMPONENTE PRINCIPAL ---

export default function Calendario() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [allCitas, setAllCitas] = useState([]);
    const [markedDatesData, setMarkedDatesData] = useState({});

    // Campañas Fijas
    const FIXED_CAMPANAS = [
        { fecha: '2025-11-20', tipo: 'campaña', nombre: 'Campaña de Desparasitación' },
        { fecha: '2025-12-15', tipo: 'campaña', nombre: 'Campaña de Vacunación Anual' }
    ];

    // --- LÓGICA DE ELIMINACIÓN DE CITA ---
    const deleteCita = async (citaToDelete) => {
        Alert.alert(
            "Confirmar Eliminación",
            `¿Estás seguro de que quieres eliminar la cita con ${citaToDelete.veterinaria} de ${citaToDelete.usuario} el ${citaToDelete.fecha}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            const citasRaw = await AsyncStorage.getItem('@citas');
                            const citas = citasRaw ? JSON.parse(citasRaw) : [];

                            const updatedCitas = citas.filter(c =>
                                c.fecha !== citaToDelete.fecha ||
                                c.usuario !== citaToDelete.usuario ||
                                c.veterinaria !== citaToDelete.veterinaria
                            );

                            await AsyncStorage.setItem('@citas', JSON.stringify(updatedCitas));
                            await loadCalendarData();

                            if (selectedDate === citaToDelete.fecha) {
                                const newEventsForSelectedDay = FIXED_CAMPANAS
                                    .filter(c => c.fecha === selectedDate)
                                    .concat(updatedCitas.filter(c => c.fecha === selectedDate && (c.tipo === 'Cita' || c.tipo === 'Vacuna')));
                                setSelectedDayEvents(newEventsForSelectedDay);
                            }
                            Alert.alert("Éxito", "Cita eliminada correctamente.");

                        } catch (error) {
                            console.error("Error al eliminar cita:", error);
                            Alert.alert("Error", "No se pudo eliminar la cita.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // --- CARGAR DATOS ---
    const loadCalendarData = async () => {
        try {
            console.log('Cargando datos del calendario...');

            const newMarked = {};
            const allFetchedCitas = [];

            // 1. Agregar campañas fijas
            FIXED_CAMPANAS.forEach(campana => {
                const date = campana.fecha;

                if (!newMarked[date]) {
                    newMarked[date] = { dots: [] };
                }
                newMarked[date].dots.push({
                    key: `campana-${date}`,
                    color: 'red',
                    selectedDotColor: 'white'
                });
                allFetchedCitas.push(campana);
            });

            // 2. Agregar citas guardadas
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];

            citas.forEach(cita => {
                const date = cita.fecha;
                if (!date) return;

                if (!newMarked[date]) {
                    newMarked[date] = { dots: [] };
                }

                // CLASIFICACIÓN CLARA
                const esCitaProgramada = cita.tipo === 'Cita';
                const esVacuna = cita.tipo === 'Vacuna' || cita.veterinaria === 'Vacuna Registrada';

                console.log(`Calendario - Cita ${cita.id}: tipo=${cita.tipo}, fecha=${date}, esCita=${esCitaProgramada}, esVacuna=${esVacuna}`);

                if (esCitaProgramada) {
                    const hasCitaDot = newMarked[date].dots.find(d => d.color === 'blue');
                    if (!hasCitaDot) {
                        newMarked[date].dots.push({
                            key: `cita-${date}-${Date.now()}`,
                            color: 'blue',
                            selectedDotColor: 'white'
                        });
                        console.log(`✓ Agregado punto AZUL para ${date}`);
                    }
                    allFetchedCitas.push({
                        ...cita,
                        tipo: 'cita'
                    });
                } else if (esVacuna) {
                    const hasVacunaDot = newMarked[date].dots.find(d => d.color === 'green');
                    if (!hasVacunaDot) {
                        newMarked[date].dots.push({
                            key: `vacuna-${date}-${Date.now()}`,
                            color: 'green',
                            selectedDotColor: 'white'
                        });
                        console.log(`✓ Agregado punto VERDE para ${date}`);
                    }
                    allFetchedCitas.push({
                        ...cita,
                        tipo: 'vacuna'
                    });
                }
            });

            console.log('Fechas marcadas FINAL:', newMarked);
            setMarkedDatesData(newMarked);
            setAllCitas(allFetchedCitas);

        } catch (error) {
            console.error("Error cargando calendario:", error);
        }
    };

    // --- Seleccion de dia ---
    const handleDayPress = (day) => {
        setSelectedDate(day.dateString);
        const events = allCitas.filter(item => item.fecha === day.dateString);
        setSelectedDayEvents(events);
    };

    // Función para combinar las marcas del calendario con la selección actual
    const getDisplayDates = () => {
        const combined = { ...markedDatesData };

        if (selectedDate) {
            if (!combined[selectedDate]) {
                combined[selectedDate] = { dots: [] };
            }

            combined[selectedDate] = {
                ...combined[selectedDate],
                selected: true,
                selectedColor: '#4CAF50'
            };

            console.log(`Fecha seleccionada: ${selectedDate}`, combined[selectedDate]);
        }

        return combined;
    };

    useEffect(() => {
        if (isFocused) {
            loadCalendarData();
            setSelectedDate('');
            setSelectedDayEvents([]);
        }
    }, [isFocused]);

    // --- MANEJADORES DE UI (Menú/Notificaciones) ---
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
            }
        }
    };

    const handleOverlayClick = () => {
        if (isMenuOpen) setIsMenuOpen(false);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {/* Encabezado */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} color="black" />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon} onPress={toggleNotifications}>
                        <Ionicons name="notifications" size={32} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Perfil')}>
                        <Ionicons name="person-circle-outline" size={32} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contenido */}
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>Calendario</Text>
                    <Text style={styles.subtitle}>¡Aquí puedes ver tus citas programadas y campañas activas!</Text>
                </View>

                <View style={{ paddingBottom: 30 }}>
                    <Calendar
                        onDayPress={handleDayPress}
                        markingType={'multi-dot'}
                        markedDates={getDisplayDates()}
                        theme={{
                            todayTextColor: '#007AFF',
                            arrowColor: '#4CAF50',
                            textDayFontWeight: '500',
                            selectedDayBackgroundColor: '#4CAF50',
                            selectedDayTextColor: '#ffffff'
                        }}
                        style={{
                            borderWidth: 1,
                            borderColor: '#e0e0e0',
                            borderRadius: 10,
                            overflow: 'hidden'
                        }}
                    />

                    {/* --- DETALLES DEL DÍA SELECCIONADO --- */}
                    {selectedDate && (
                        <View style={styles.detailsContainer}>
                            <Text style={styles.dateText}>
                                Eventos para el <Text style={{ fontWeight: 'bold' }}>{selectedDate}</Text>:
                            </Text>

                            {selectedDayEvents.length === 0 ? (
                                <Text style={styles.noEventsText}>No hay eventos programados para esta fecha.</Text>
                            ) : (
                                selectedDayEvents.map((event, index) => {
                                    if (event.tipo === 'cita') {
                                        return (
                                            <CitaDetailItem
                                                key={`${event.id}-${index}`}
                                                cita={event}
                                                onDelete={deleteCita}
                                            />
                                        );
                                    } else if (event.tipo === 'campaña') {
                                        return (
                                            <View key={`campana-${index}`} style={styles.campaignCard}>
                                                <MaterialIcons name="local-hospital" size={20} color="red" style={{ marginRight: 10 }} />
                                                <Text style={styles.campaignText}>{event.nombre || '¡Campaña de Vacunación!'}</Text>
                                            </View>
                                        );
                                    } else if (event.tipo === 'vacuna') {
                                        return (
                                            <View key={`vacuna-${index}`} style={styles.vacunaCard}>
                                                <FontAwesome5 name="syringe" size={16} color="green" style={{ marginRight: 10 }} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.vacunaTextTitle}>Vacuna Aplicada</Text>
                                                    <Text style={styles.vacunaText}>{event.veterinaria} - {event.usuario}</Text>
                                                </View>
                                            </View>
                                        );
                                    }
                                    return null;
                                })
                            )}
                        </View>
                    )}

                    <View style={styles.legendCard}>
                        <Text style={styles.title}>Representación de colores</Text>
                        <View style={styles.row}>
                            <FontAwesome5 name="circle" size={16} color="red" />
                            <Text style={styles.subtitlebottom}>Campañas de Vacunación</Text>
                        </View>
                        <View style={styles.row}>
                            <FontAwesome5 name="circle" size={16} color="blue" />
                            <Text style={styles.subtitlebottom}>Tus Citas Programadas</Text>
                        </View>
                        <View style={styles.row}>
                            <FontAwesome5 name="circle" size={16} color="green" />
                            <Text style={styles.subtitlebottom}>Vacunas Aplicadas</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Overlay */}
            {isOverlayVisible && (
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleOverlayClick} />
            )}

            {/* --- MENÚ LATERAL --- */}
            <View style={[styles.sideMenu, { transform: [{ translateX: isMenuOpen ? 0 : -300 }] }]}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menú</Text>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="close" size={30} color="#333" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
                    <Ionicons name="home" size={24} color="black" />
                    <Text style={styles.menuItemText}>Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}>
                    <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                    <Text style={styles.menuItemText}>Mascotas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => console.warn('Ya te encuentras en la pantalla de Calendario')}>
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

            {/* Notificaciones */}
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
        backgroundColor: '#fff'
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 50
    },

    // --- Header ---
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

    // --- Overlay ---
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000080',
        zIndex: 10
    },

    // --- Menú lateral ---
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
        elevation: 10
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

    // --- Cards Generales ---
    card: {
        backgroundColor: '#e0e0e0',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20
    },
    legendCard: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#eee'
    },

    // --- Estilos de Detalles de Eventos ---
    detailsContainer: {
        marginTop: 25,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    detailCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E3F2FD',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#007AFF',
    },
    campaignCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: 'red',
    },
    vacunaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: 'green',
    },
    deleteButton: {
        padding: 5,
        marginLeft: 10,
    },

    // --- Textos de Detalles ---
    detailTextTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#007AFF'
    },
    detailText: {
        fontSize: 14,
        color: '#333'
    },
    campaignText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red'
    },
    vacunaTextTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 2
    },
    vacunaText: {
        fontSize: 14,
        color: '#388E3C'
    },
    noEventsText: {
        textAlign: 'center',
        color: '#999',
        padding: 10,
        fontStyle: 'italic'
    },
    dateText: {
        marginTop: 10,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '500',
        color: '#333',
        marginBottom: 15
    },

    // --- Textos Generales ---
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 5,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        color: '#555'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    subtitlebottom: {
        marginLeft: 8,
        fontSize: 16,
        color: '#444'
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