import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NotificationService from './Notificaciones';

// Componente para notificaciones
const NotificationItem = ({ text }) => (
    <View style={notificationStyles.itemContainer}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.itemText}>{text}</Text>
    </View>
);

export default function EditarCita() {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const { cita } = route.params || {};

    // Estados del formulario
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreVeterinaria, setVeterinaria] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [veterinarias, setVeterinarias] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados UI
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);

    // Cargar datos iniciales
    useEffect(() => {
        if (isFocused && cita) {
            setNombreUsuario(cita.usuario || '');
            setVeterinaria(cita.veterinaria || '');
            setSelectedDate(cita.fecha || '');
            loadVeterinarias();
        }
    }, [isFocused, cita]);

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

    // Seleccionar veterinaria
    const selectVeterinaria = (option) => {
        setVeterinaria(option.label);
        setIsDropdownOpen(false);
    };

    // Obtener fechas marcadas para el calendario
    const getMarkedDates = () => {
        if (!selectedDate) return {};
        return {
            [selectedDate]: { selected: true, selectedColor: '#4CAF50' }
        };
    };

    // Guardar cambios
    const handleSave = async () => {
        if (!nombreUsuario || !nombreVeterinaria || !selectedDate) {
            Alert.alert('Faltan datos', 'Ingresa nombre, veterinaria y fecha.');
            return;
        }

        setLoading(true);

        try {
            const citasRaw = await AsyncStorage.getItem('@citas');
            const citas = citasRaw ? JSON.parse(citasRaw) : [];

            // Eliminar la cita antigua
            const updatedCitas = citas.filter(c =>
                !(c.fecha === cita.fecha &&
                    c.usuario === cita.usuario &&
                    c.veterinaria === cita.veterinaria &&
                    c.tipo === 'Cita')
            );

            // Agregar la cita actualizada
            const citaActualizada = {
                ...cita,
                usuario: nombreUsuario,
                veterinaria: nombreVeterinaria,
                fecha: selectedDate,
                tipo: 'Cita'
            };

            updatedCitas.push(citaActualizada);
            await AsyncStorage.setItem('@citas', JSON.stringify(updatedCitas));

            setLoading(false);
            Alert.alert(
                'Éxito',
                `¡Cita actualizada para el ${selectedDate}!`,
                [{ text: "OK", onPress: () => navigation.navigate('Calendario') }]
            );

        } catch (error) {
            console.error("Error guardando cambios:", error);
            setLoading(false);
            Alert.alert("Error", "No se pudieron guardar los cambios.");
        }
    };

    // Menús
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

                {/* Encabezado */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="#333" />
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

                {/* Título */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Editar Cita</Text>
                </View>

                {/* Campo Usuario */}
                <View style={styles.card}>
                    <Text style={styles.label}>Nombre del usuario:</Text>
                    <TextInput
                        style={styles.input}
                        value={nombreUsuario}
                        onChangeText={setNombreUsuario}
                        placeholder="Ej. Gabriel Perez Torres"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Campo Veterinaria */}
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
                                            onPress={() => selectVeterinaria(option)}
                                        >
                                            <Text style={styles.dropdownItemText}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}
                        </View>
                    )}
                </View>

                {/* Calendario */}
                <View style={styles.card}>
                    <Text style={styles.label}>Fecha de la cita</Text>
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

                {/* Botones de acción */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Guardar cambios</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Overlay y menú */}
            {isOverlayVisible && (
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleOverlayClick} />
            )}

            {/* Menú lateral */}
            <View style={[styles.sideMenu, { transform: [{ translateX: isMenuOpen ? 0 : -300 }] }]}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menú</Text>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="close" size={30} color="#333" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Home'); }}>
                    <Ionicons name="home" size={28} color="#333" />
                    <Text style={styles.menuItemText}>Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}>
                    <Ionicons name="calendar-number" size={28} color="#007AFF" />
                    <Text style={styles.menuItemText}>Calendario</Text>
                </TouchableOpacity>
            </View>

            {/* Notificaciones */}
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
    backButton: {
        padding: 5
    },
    circleButton: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 25,
        elevation: 3,
        marginLeft: 10
    },
    iconSpacing: {
        marginRight: 10
    },
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
        textAlign: 'center'
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
    },
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
    buttonContainer: {
        width: '100%',
        gap: 10,
        marginBottom: 20
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 4
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    buttonDisabled: {
        backgroundColor: '#A5D6A7'
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000
    },
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
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        marginBottom: 20
    }
});
