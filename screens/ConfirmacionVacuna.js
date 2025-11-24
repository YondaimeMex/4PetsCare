import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import React from 'react';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NotificationService from './Notificaciones';

// Componente que muestra cada notificación
const NotificationItem = ({ text }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>{text}</Text>
    </View>
);

export default function ConfirmacionVacuna() {
    const navigation = useNavigation();
    const route = useRoute();
    const { mascota } = route.params || {};

    // Estados del menú, notificaciones y calendario
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [notificaciones, setNotificaciones] = useState([]);
    const [veterinarias, setVeterinarias] = useState([]);
    const [selectedVeterinaria, setSelectedVeterinaria] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);


    // Abre o cierra el menú lateral
    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) {
            setIsNotificationsOpen(false);
        }
    };

    const toggleNotifications = async () => {
        const newState = !isNotificationsOpen;
        setIsNotificationsOpen(newState);
        if (newState) {
            setIsMenuOpen(false);
            // Cargar notificaciones al abrir
            try {
                const allNotifications = await NotificationService.getNotifications();
                setNotificaciones(allNotifications);
            } catch (error) {
                console.error("Error al cargar notificaciones:", error);
                setNotificaciones([]);
            }
        }
    };

    // Cierra menús al tocar fuera
    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };

    // Cargar veterinarias
    const loadVeterinarias = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@veterinarias');
            const data = jsonValue != null ? JSON.parse(jsonValue) : [];
            data.sort((a, b) => a.label.localeCompare(b.label));
            setVeterinarias(data);
        } catch (error) {
            console.error("Error cargando veterinarias", error);
        }
    };

    // Cargar veterinarias al montar el componente
    React.useEffect(() => {
        loadVeterinarias();
    }, []);

    const handleSave = async () => {
        if (!selectedDate) {
            Alert.alert("Error", "Selecciona la fecha en que la vacuna fue aplicada.");
            return false;
        }

        if (!selectedVeterinaria) {
            Alert.alert("Error", "Selecciona la veterinaria donde se aplicó la vacuna.");
            return false;
        }

        const fechaAplicada = selectedDate;

        const newCita = {
            id: Date.now(), // ID único
            fecha: fechaAplicada,
            tipo: 'Vacuna',
            veterinaria: selectedVeterinaria, // Nombre de la veterinaria seleccionada
            usuario: mascota?.nombre || 'Mi Mascota', // Nombre de la mascota
        };

        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];

            const updatedCitas = [...citas, newCita];
            await AsyncStorage.setItem('@citas', JSON.stringify(updatedCitas));

            console.log('Vacuna Aplicada Guardada en AsyncStorage:', newCita);
            return true;
        } catch (error) {
            console.error("Error al guardar la cita en AsyncStorage:", error);
            Alert.alert("Error", "Hubo un problema al guardar el registro de la vacuna.");
            return false;
        }
    };

    // Verifica si hay un menú o notificaciones abiertas
    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {/* Encabezado con menú, notificaciones y perfil */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} color="black" />
                </TouchableOpacity>

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

            <ScrollView contentContainerStyle={styles.content}>
                {/* Título e instrucción */}
                <View style={styles.card}>
                    <Text style={styles.title}>¿La vacuna ya fue aplicada?</Text>
                    <Text style={styles.subtitle}>Selecciona la fecha:</Text>
                </View>

                {/* Calendario para elegir la fecha */}
                <Calendar
                    onDayPress={day => {
                        setSelectedDate(day.dateString);
                    }}
                    markedDates={{
                        [selectedDate]: { selected: true, marked: true, selectedColor: '#4CAF50' }
                    }}
                    theme={{
                        todayTextColor: '#007AFF',
                        arrowColor: '#4CAF50',
                    }}
                />

                {/* Muestra la fecha seleccionada */}
                {selectedDate ? (
                    <Text style={styles.dateText}>Fecha elegida: {selectedDate}</Text>
                ) : null}

                {/* Seleccionar Veterinaria */}
                <View style={[styles.card, { zIndex: 100 }]}>
                    <Text style={styles.label}>Seleccione la veterinaria</Text>

                    <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <TextInput
                            style={styles.dropdownInputText}
                            value={selectedVeterinaria}
                            placeholder="Elige una veterinaria"
                            placeholderTextColor="#999"
                            editable={false}
                            pointerEvents="none"
                        />
                        <MaterialIcons
                            name={isDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
                            size={24}
                            color="#333"
                        />
                    </TouchableOpacity>

                    {/* Lista desplegable */}
                    {isDropdownOpen && (
                        <View style={styles.dropdownList}>
                            {veterinarias.length === 0 ? (
                                <View style={styles.emptyStateBox}>
                                    <Text style={styles.emptyStateText}>No hay veterinarias guardadas.</Text>
                                </View>
                            ) : (
                                <>
                                    {veterinarias.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setSelectedVeterinaria(option.label);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* Botón para confirmar vacuna */}
                <TouchableOpacity
                    style={styles.vaccineButton}
                    onPress={async () => {
                        const saved = await handleSave();
                        if (saved) {
                            navigation.navigate('VacunaRegistrada', { fechaAplicada: selectedDate });
                            setSelectedDate('');
                        }
                    }}
                >
                    <View style={styles.vaccineButtonContent}>
                        <FontAwesome5 name="syringe" size={18} color="white" />
                        <Text style={styles.vaccineButtonText}>Confirmar</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#D4EDDA" style={{ marginLeft: 8 }} />
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Fondo oscuro si hay menús abiertos */}
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
                                <NotificationItem key={index} text={n.text} />
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
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        fontWeight: '600'
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 10
    },
    dropdownInputText: {
        flex: 1,
        fontSize: 16,
        color: '#333'
    },
    dropdownList: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
        elevation: 4
    },
    dropdownItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333'
    },
    emptyStateBox: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fdfdfd'
    },
    emptyStateText: {
        color: '#888',
        marginBottom: 12,
        fontSize: 14
    }
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