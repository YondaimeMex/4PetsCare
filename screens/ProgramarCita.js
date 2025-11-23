import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NotificationService from './Notificaciones';

// --- COMPONENTE AUXILIAR: Item de Notificación ---
const NotificationItem = ({ text }) => (
    <View style={notificationStyles.itemContainer}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.itemText}>{text}</Text>
    </View>
);

export default function ProgramarCita() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    // --- ESTADOS ---
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreVeterinaria, setVeterinaria] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [veterinarias, setVeterinarias] = useState([]);

    // --- ESTADOS UI ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- CARGA DE VETERINARIAS ---
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

    useEffect(() => {
        if (isFocused) {
            loadVeterinarias();
        }
    }, [isFocused]);

    // --- MANEJADORES ---
    const selectVeterinaria = (option) => {
        setVeterinaria(option.label);
        setIsDropdownOpen(false);
    };

    const getMarkedDates = () => {
        if (!selectedDate) return {};
        return {
            [selectedDate]: { selected: true, selectedColor: '#4CAF50' }
        };
    };

    // --- GUARDAR CITA ---
    const handleSave = async () => {
        if (!nombreUsuario || !nombreVeterinaria || !selectedDate) {
            Alert.alert('Faltan datos', 'Ingresa nombre, veterinaria y fecha.');
            return;
        }

        setLoading(true);

        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];

            const nuevaCita = {
                id: Date.now().toString(), // ← CAMBIA A STRING
                usuario: nombreUsuario,
                veterinaria: nombreVeterinaria,
                fecha: selectedDate,
                tipo: 'Cita' // ← ESTO ES CRÍTICO
            };

            console.log('Guardando cita:', nuevaCita); // ← DEBUG

            const nuevasCitas = [...citas, nuevaCita];
            await AsyncStorage.setItem('@citas', JSON.stringify(nuevasCitas));

            // Verificar que se guardó
            const verificar = await AsyncStorage.getItem('@citas');
            console.log('Datos guardados en AsyncStorage:', verificar); // ← DEBUG

            setLoading(false);
            Alert.alert(
                'Cita guardada',
                `¡Cita en ${nombreVeterinaria} registrada para el ${selectedDate}!`,
                [{ text: "OK", onPress: () => navigation.navigate('Calendario') }]
            );

            setNombreUsuario('');
            setVeterinaria('');
            setSelectedDate('');

        } catch (error) {
            console.error("Error guardando cita:", error);
            setLoading(false);
            Alert.alert("Error", "No se pudo guardar la cita.");
        }
    };
    // --- DEBUG ---
    const clearVetsForTesting = async () => {
        await AsyncStorage.removeItem('@veterinarias');
        setVeterinarias([]);
        setVeterinaria('');
        Alert.alert("Reset", "Lista de veterinarias borrada.");
    };

    // --- MENÚS ---
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
            const allNotifications = await NotificationService.getNotifications();
            setNotificaciones(allNotifications);
        }
    };

    const handleOverlayClick = () => {
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="auto" />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* --- ENCABEZADO --- */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
                        <MaterialIcons name="menu" size={32} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        <TouchableOpacity style={[styles.circleButton, styles.iconSpacing]} onPress={toggleNotifications}>
                            <Ionicons name="notifications" size={28} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleButton} onPress={() => navigation.navigate('Perfil')}>
                            <Ionicons name="person-circle-outline" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- FORMULARIO: NOMBRE --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Programar Cita</Text>
                    <Text style={styles.label}>Nombre del usuario:</Text>
                    <TextInput
                        style={styles.input}
                        value={nombreUsuario}
                        onChangeText={setNombreUsuario}
                        placeholder="Ej. Gabriel Perez Torres"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* --- FORMULARIO: VETERINARIA --- */}
                <View style={[styles.card, { zIndex: 100 }]}>
                    <Text style={styles.label}>Seleccione la veterinaria</Text>

                    <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <TextInput
                            style={styles.dropdownInputText}
                            value={nombreVeterinaria}
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

                    {/* --- LISTA DESPLEGABLE --- */}
                    {isDropdownOpen && (
                        <View style={styles.dropdownList}>
                            {veterinarias.length === 0 ? (
                                <View style={styles.emptyStateBox}>
                                    <Text style={styles.emptyStateText}>No hay veterinarias guardadas.</Text>
                                    <TouchableOpacity
                                        style={styles.registerLinkButton}
                                        onPress={() => {
                                            setIsDropdownOpen(false);
                                            navigation.navigate('RegistroVeterinaria');
                                        }}
                                    >
                                        <Text style={styles.registerLinkText}>Registrar Veterinaria</Text>
                                        <MaterialIcons name="arrow-forward" size={16} color="white" style={{ marginLeft: 5 }} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    {/* Lista de veterinarias existentes */}
                                    {veterinarias.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.dropdownItem}
                                            onPress={() => selectVeterinaria(option)}
                                        >
                                            <Text style={styles.dropdownItemText}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    {/* Boton para agregar mas */}
                                    <TouchableOpacity
                                        style={styles.dropdownFooterItem}
                                        onPress={() => {
                                            setIsDropdownOpen(false);
                                            navigation.navigate('RegistroVeterinaria');
                                        }}
                                    >
                                        <MaterialIcons name="add-circle-outline" size={20} color="#4CAF50" />
                                        <Text style={styles.dropdownFooterText}>Agregar nueva veterinaria</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* --- CALENDARIO --- */}
                <View style={styles.card}>
                    <Text style={styles.label}>Calendario</Text>
                    <View style={styles.calendarWrapper}>
                        <Calendar
                            onDayPress={day => setSelectedDate(day.dateString)}
                            markingType={'simple'}
                            markedDates={getMarkedDates()}
                            theme={{
                                todayTextColor: '#007AFF',
                                arrowColor: '#4CAF50',
                                textDayFontWeight: '500'
                            }}
                        />
                        {selectedDate ? (
                            <Text style={styles.selectedDateText}>Fecha elegida: {selectedDate}</Text>
                        ) : null}
                    </View>
                </View>

                {/* --- BOTÓN GUARDAR --- */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Programar Cita</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* --- OVERLAY Y MENÚ LATERAL --- */}
            {isOverlayVisible && (
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleOverlayClick} />
            )}

            {/* --- MENÚ LATERAL ACTUALIZADO --- */}
            <View style={[styles.sideMenu, { transform: [{ translateX: isMenuOpen ? 0 : -300 }] }]}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menú</Text>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="close" size={30} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Opción Home/Inicio */}
                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Home'); }}>
                    <Ionicons name="home" size={28} color="#333" />
                    <Text style={styles.menuItemText}>Inicio</Text>
                </TouchableOpacity>

                {/* Opción Mascotas */}
                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}>
                    <Ionicons name="paw-outline" size={28} color="#4BCF5C" />
                    <Text style={styles.menuItemText}>Mascotas</Text>
                </TouchableOpacity>

                {/* Opción Calendario */}
                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}>
                    <Ionicons name="calendar-number" size={28} color="#007AFF" />
                    <Text style={styles.menuItemText}>Calendario</Text>
                </TouchableOpacity>

                {/* Opción Consejos */}
                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Consejos'); }}>
                    <MaterialIcons name="tips-and-updates" size={28} color="#FF9500" />
                    <Text style={styles.menuItemText}>Consejos</Text>
                </TouchableOpacity>

                {/* Opción Emergencias */}
                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Emergencias'); }}>
                    <MaterialIcons name="emergency" size={28} color="#FF3B30" />
                    <Text style={styles.menuItemText}>Emergencias</Text>
                </TouchableOpacity>
            </View>

            {/* --- PANEL DE NOTIFICACIONES --- */}
            {isNotificationsOpen && (
                <View style={notificationStyles.container}>
                    <Text style={notificationStyles.header}>Notificaciones</Text>
                    <ScrollView style={notificationStyles.list}>
                        {notificaciones.length > 0 ? (
                            notificaciones.map((n, index) => <NotificationItem key={index} text={n.text} />)
                        ) : (
                            <Text style={notificationStyles.emptyText}>No hay notificaciones.</Text>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // --- Contenedor principal ---
    mainContainer: {
        flex: 1,
        backgroundColor: '#f2f2f2'
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 50,
        alignItems: 'center'
    },

    // --- Header ---
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 25
    },
    headerRight: {
        flexDirection: 'row'
    },
    iconButton: {
        padding: 5
    },
    circleButton: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 25,
        elevation: 3,
        marginLeft: 10
    },

    // --- Cards ---
    card: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
        fontWeight: '600'
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333'
    },

    // --- Dropdown ---
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

    // --- Botón dentro de la lista ---
    dropdownFooterItem: {
        padding: 15,
        backgroundColor: '#F1F8E9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    dropdownFooterText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginLeft: 8
    },

    // --- Estado vacío ---
    emptyStateBox: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fdfdfd'
    },
    emptyStateText: {
        color: '#888',
        marginBottom: 12,
        fontSize: 14
    },
    registerLinkButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20
    },
    registerLinkText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },

    // --- Calendario ---
    calendarWrapper: {
        marginTop: 5
    },
    selectedDateText: {
        marginTop: 15,
        fontSize: 16,
        color: '#007AFF',
        textAlign: 'center',
        fontWeight: '600'
    },

    // --- Botones ---
    saveButton: {
        backgroundColor: '#4CAF50',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4
    },
    buttonDisabled: {
        backgroundColor: '#A5D6A7'
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    miniFloatingButton: {
        position: 'absolute',
        right: -10,
        top: 35,
        backgroundColor: '#4CAF50',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 10
    },

    // --- Overlay ---
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000
    },

    // --- Menú lateral ---
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 280,
        backgroundColor: '#fff',
        padding: 25,
        zIndex: 2000,
        elevation: 10
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 40
    },
    menuTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    menuItemText: {
        fontSize: 18,
        marginLeft: 15,
        color: '#444'
    },
});

const notificationStyles = StyleSheet.create({
    // --- Contenedor principal ---
    container: {
        position: 'absolute',
        top: 90,
        right: 20,
        width: 300,
        maxHeight: 400,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        zIndex: 2000,
        elevation: 8
    },

    // --- Header ---
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10
    },

    // --- Lista ---
    list: {
        flexGrow: 0
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5252',
        marginRight: 10,
        marginTop: 6
    },
    itemText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        flex: 1
    },

    // --- Estado vacío ---
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        marginBottom: 20
    }
});
