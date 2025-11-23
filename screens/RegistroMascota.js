import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
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

// Lista de notificaciones de ejemplo
const notificationsData = [
    '¡Se acerca el día de la cita! ¿Ya tienes todo preparado?',
    '¡Campaña de vacunacion!, el día 30 de Octubre',
    'Recordatorio: Próxima dosis de medicamento.',
    'Hola'
];

// Opciones de especie para el menú desplegable
const especies = [
    { key: 'domestico', label: 'Domestico (Perro, Gato, etc)' },
    { key: 'ave', label: 'Ave (Perico, Loro, etc)' },
    { key: 'acuatico', label: 'Acuatico (Betta, Goldfish, etc)' },
    { key: 'reptiles', label: 'Reptiles (Tortuga, Iguana, etc)' },
];

export default function RegistroMascota() {
    const navigation = useNavigation(); // Hook para navegar entre pantallas

    // Estados de los campos del formulario
    const [nombreMascota, setNombreMascota] = useState('');
    const [especie, setEspecie] = useState('');
    const [raza, setRaza] = useState('');
    const [edad, setEdad] = useState('');
    const [peso, setPeso] = useState('');

    // Estados para mostrar u ocultar menús
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Selecciona la especie del menú desplegable
    const Selectespecie = (option) => {
        setEspecie(option.label);
        setIsDropdownOpen(false);
    }

    // Muestra u oculta el menú de especies
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }

    // Guarda los datos de la mascota
    const handleSave = () => {
        if (!nombreMascota || !especie) {
            console.warn("Ingresa el nombre y selecciona la especie de tu mascota.");
            return;
        }

        const mascotaData = {
            nombre: nombreMascota,
            especie: especie,
            raza: raza,
            edad: edad,
            peso: peso,
        };

        console.log('Datos de Mascota a Guardar:', mascotaData);
        console.log(`¡Mascota ${nombreMascota} ha sido registrado con éxito!`);
    };

    // Muestra u oculta el menú lateral
    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) {
            setIsNotificationsOpen(false);
        }
    };

    // Muestra u oculta las notificaciones
    const toggleNotifications = () => {
        const newState = !isNotificationsOpen;
        setIsNotificationsOpen(newState);
        if (newState) {
            setIsMenuOpen(false);
        }
    };

    // Cierra los menús al tocar fuera
    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollContainer}>
            <StatusBar style="auto" />

            {/* Encabezado con menú, notificaciones y perfil */}
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

            {/* Formulario de registro de mascota */}
            <View style={styles.formCard}>
                <Text style={styles.title}>¡Registra a tu mascota!</Text>
                <Text style={styles.label}>Nombre de tu mascota</Text>
                <TextInput
                    style={styles.input}
                    value={nombreMascota}
                    onChangeText={setNombreMascota}
                    placeholder="Ej. Toby"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Selector de especie */}
            <View style={styles.formCard}>
                <Text style={styles.label}>¿Qué mascota es?</Text>
                <TouchableOpacity
                    style={styles.dropdownContainer}
                    onPress={toggleDropdown}
                >
                    <TextInput style={styles.dropdownInput}
                        value={especie}
                        placeholderTextColor={especie ? '#000' : '#999'}
                        editable={false}
                    />
                    <MaterialIcons
                        name={isDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
                        size={24}
                        color="black"
                        style={styles.dropdownIcon}
                    />
                </TouchableOpacity>

                {/* Opciones del menú desplegable */}
                {isDropdownOpen && especies.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        style={styles.dropdownItem}
                        onPress={() => Selectespecie(option)}
                    >
                        <Text style={styles.dropdownText}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Campos adicionales */}
            <View style={styles.formCard}>
                <Text style={styles.label}>Raza de tu mascota</Text>
                <TextInput
                    style={styles.input}
                    value={raza}
                    onChangeText={setRaza}
                    placeholder="Ej. Golden Retriever"
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.formCard}>
                <Text style={styles.label}>Edad</Text>
                <TextInput
                    style={styles.input}
                    value={edad}
                    onChangeText={setEdad}
                    placeholder="Ej. 5 años"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.formCard}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                    style={styles.input}
                    value={peso}
                    onChangeText={setPeso}
                    placeholder="Ej. 30kg"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                />
            </View>

            {/* Botón para guardar */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                    handleSave();
                    navigation.navigate('Mascotas');
                }}
            >
                <Text style={styles.saveButtonText}>Guardar Mascota</Text>
            </TouchableOpacity>

            {/* Fondo oscuro cuando el menú o notificaciones están abiertas */}
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

                {/* Opciones del menú lateral */}
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

            {/* Notificaciones desplegables */}
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

        </ScrollView >
    );
}

// Estilos generales del formulario y menú
const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 50,
        alignItems: 'center',
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
        justifyContent: 'space-between',
    },
    menuHamburguesa: {
        padding: 5,
    },
    headerIcon: {
        padding: 8,
    },
    floatingBtn: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 50,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#ccc',
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
    formCard: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        width: '90%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'normal',
    },
    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#eee',
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 20,
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
        borderColor: '#ddd',
    },
    dropdownInput: {
        flex: 1,
        paddingHorizontal: 10,
        color: '#000',
    },
    dropdownIcon: {
        paddingRight: 5,
    },
    dropdownItem: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginTop: -1,
        width: '100%',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        width: '90%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
