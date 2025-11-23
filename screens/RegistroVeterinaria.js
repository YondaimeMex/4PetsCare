import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import React from 'react';

// Componente que muestra cada notificación individual
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

// Pantalla principal para registrar veterinarias
export default function RegistroVeterinaria() {
    const navigation = useNavigation(); // Para cambiar entre pantallas

    // Estados para los campos del formulario
    const [nombreVeterinaria, setNombreVeterinaria] = useState('');
    const [UbiVeterinaria, setUbiVeterinaria] = useState('');
    const [Numero, setNumero] = useState('');

    // Estados para abrir/cerrar el menú y notificaciones
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Función para guardar datos de la veterinaria
    const handleSave = () => {
        if (!nombreVeterinaria || !UbiVeterinaria) {
            console.warn("Ingresa el nombre y la ubicación");
            return;
        }

        const VeterinariaData = {
            nombre: nombreVeterinaria,
            ubicacion: UbiVeterinaria, // corregido
            numero: Numero,
        };

        console.log('Datos de Veterinaria a Guardar:', VeterinariaData);
        console.log(`¡Veterinaria ${nombreVeterinaria} ha sido registrada con éxito!`);
    };

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

    // Cierra el menú o las notificaciones si se toca fuera
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

            {/* Formulario de registro */}
            <View style={styles.formCard}>
                <Text style={styles.title}>¡Registra tu Veterinaria!</Text>
                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                    style={styles.input}
                    value={nombreVeterinaria}
                    onChangeText={setNombreVeterinaria}
                    placeholder="Ej. Luz"
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.formCard}>
                <Text style={styles.label}>Ubicación:</Text>
                <TextInput
                    style={styles.input}
                    value={UbiVeterinaria}
                    onChangeText={setUbiVeterinaria}
                    placeholder="Ej. Lopez Portillo"
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.formCard}>
                <Text style={styles.label}>Número:</Text>
                <TextInput
                    style={styles.input}
                    value={Numero}
                    onChangeText={setNumero}
                    placeholder="Ej. 9988776655"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                />
            </View>

            {/* Botón para guardar veterinaria */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                    handleSave();
                    navigation.navigate('Emergencias');
                }}
            >
                <Text style={styles.saveButtonText}>Guardar Veterinaria</Text>
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
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Ionicons name="home" size={24} color="black" />
                    <Text style={styles.menuItemText}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => alert('Ya te encuentras en mascotas')}
                >
                    <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                    <Text style={styles.menuItemText}>Mascotas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Calendario')}
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

            {/* Notificaciones */}
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