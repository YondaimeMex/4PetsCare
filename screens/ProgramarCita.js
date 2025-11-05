import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
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
    'Recordatorio: Próxima dosis de medicamento.',
    'Hola'
];

// Opciones de veterinarias
const veterinarias = [
    { key: 'veterinaria1', label: 'Veterinaria "San Juan"' },
    { key: 'veterinaria2', label: 'Veterinaria "Lares"' },
    { key: 'veterinaria3', label: 'Veterinaria "Cancún"' },
    { key: 'veterinaria4', label: 'Hospital Veterinario' },
];

export default function ProgramarCita() {
    const navigation = useNavigation();

    // Estados para guardar datos del formulario y controles de menú
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreVeterinaria, setVeterinaria] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Selecciona una veterinaria del menú desplegable
    const selectVeterinaria = (option) => {
        setVeterinaria(option.label);
        setIsDropdownOpen(false);
    };

    // Abre o cierra el menú de veterinarias
    const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

    // Marca la fecha seleccionada en el calendario
    const getMarkedDates = () => {
        if (!selectedDate) return {};
        return {
            [selectedDate]: {
                selected: true,
                selectedColor: '#4CAF50'
            }
        };
    };

    // Guarda los datos de la cita
    const handleSave = () => {
        if (!nombreUsuario || !nombreVeterinaria || !selectedDate) {
            Alert.alert('Faltan datos', 'Ingresa nombre, veterinaria y fecha.');
            return;
        }

        const citaData = {
            nombre: nombreUsuario,
            veterinaria: nombreVeterinaria,
            fecha: selectedDate,
        };

        console.log('Datos de cita a guardar:', citaData);
        Alert.alert('Cita guardada', `¡Cita para ${nombreUsuario} registrada con éxito!`);
        navigation.navigate('Mascotas');
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

    // Cierra menús al presionar fuera
    const handleOverlayClick = () => {
        if (isMenuOpen) setIsMenuOpen(false);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollContainer}>
            <StatusBar style="auto" />

            {/* Encabezado con iconos de menú, notificaciones y perfil */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={[styles.floatingBtn, styles.headerIcon]} onPress={toggleNotifications}>
                        <Ionicons name="notifications" size={32} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.floatingBtn, styles.headerIcon]}
                        onPress={() => navigation.navigate('Perfil')}
                    >
                        <Ionicons name="person-circle-outline" size={32} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Campo: nombre del usuario */}
            <View style={styles.formCard}>
                <Text style={styles.title}>Programar Cita</Text>
                <Text style={styles.label}>Nombre del usuario:</Text>
                <TextInput
                    style={styles.input}
                    value={nombreUsuario}
                    onChangeText={setNombreUsuario}
                    placeholder="Ej. Gabriel Perez Torres"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Selección de veterinaria */}
            <View style={styles.formCard}>
                <Text style={styles.label}>Seleccione la veterinaria</Text>
                <TouchableOpacity style={styles.dropdownContainer} onPress={toggleDropdown}>
                    <TextInput
                        style={styles.dropdownInput}
                        value={nombreVeterinaria}
                        placeholder="Elige una veterinaria"
                        placeholderTextColor="#999"
                        editable={false}
                        pointerEvents="none"
                    />
                    <MaterialIcons
                        name={isDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
                        size={24}
                        color="black"
                        style={styles.dropdownIcon}
                    />
                </TouchableOpacity>

                {/* Lista desplegable de veterinarias */}
                {isDropdownOpen && veterinarias.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        style={styles.dropdownItem}
                        onPress={() => selectVeterinaria(option)}
                    >
                        <Text style={styles.dropdownText}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Calendario para elegir fecha */}
            <View style={styles.formCard}>
                <Text style={styles.label}>Calendario</Text>
                <View style={styles.container}>
                    <Calendar
                        onDayPress={day => setSelectedDate(day.dateString)}
                        markingType={'simple'}
                        markedDates={getMarkedDates()}
                        theme={{
                            todayTextColor: '#007AFF',
                            arrowColor: '#4CAF50',
                        }}
                    />
                    {selectedDate ? (
                        <Text style={styles.dateText}>Fecha elegida: {selectedDate}</Text>
                    ) : null}
                </View>
            </View>

            {/* Botón para guardar la cita */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
            >
                <Text style={styles.saveButtonText}>Programar Cita</Text>
            </TouchableOpacity>

            {/* Fondo oscuro cuando hay menús abiertos */}
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
                        {notificationsData.map((text, index) => (
                            <NotificationItem key={index} text={text} />
                        ))}
                    </ScrollView>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 50,
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        width: '100%',
        paddingHorizontal: 5
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
        padding: 8
    },
    floatingBtn: {
        backgroundColor: '#fff',
        padding: 8, borderRadius: 50,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#ccc'
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
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    menuItemText: {
        fontSize: 18,
        marginLeft: 15,
        color: '#333'
    },
    dateText: {
        marginTop: 20,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '500',
        color: '#333',
        marginBottom: 30
    },
    formCard: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        width: '90%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'normal'
    },
    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#eee',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 20
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 20,
        alignSelf: 'center',
        color: '#333'
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        height: 45,
        borderRadius: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    dropdownInput: {
        flex: 1,
        paddingHorizontal: 10,
        color: '#000'
    },
    dropdownIcon: {
        paddingRight: 5
    },
    dropdownItem: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginTop: -1,
        width: '100%'
    },
    dropdownText: {
        fontSize: 16,
        color: '#333'
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        width: '90%',
        elevation: 5
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
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
    }
});
