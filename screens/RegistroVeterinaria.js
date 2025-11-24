import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NotificationService from './Notificaciones';

// Componente que muestra cada notificación
const NotificationItem = ({ text }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>{text}</Text>
    </View>
);

// Pantalla principal para registrar veterinarias
export default function RegistroVeterinaria() {
    const navigation = useNavigation();

    // Estados para los campos del formulario
    const [nombreVeterinaria, setNombreVeterinaria] = useState('');
    const [UbiVeterinaria, setUbiVeterinaria] = useState('');
    const [Numero, setNumero] = useState('');

    // Estados para abrir/cerrar el menú y notificaciones
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);

    // --- LÓGICA DE GUARDADO COMPATIBLE ---
    const handleSave = async () => {
        if (!nombreVeterinaria || !UbiVeterinaria) {
            Alert.alert("Faltan datos", "Ingresa el nombre y la ubicación");
            return;
        }

        try {
            // 1. Crear objeto (Usamos 'label' para que funcione con el Dropdown de ProgramarCita)
            const nuevaVeterinaria = {
                id: Date.now(),
                label: nombreVeterinaria, // <--- Esto es clave para que se vea en la lista
                ubicacion: UbiVeterinaria,
                numero: Numero,
            };

            // 2. Leer lo que ya hay guardado
            const existentesRaw = await AsyncStorage.getItem('@veterinarias');
            const existentes = existentesRaw ? JSON.parse(existentesRaw) : [];

            // 3. Agregar y guardar
            const actualizada = [...existentes, nuevaVeterinaria];
            await AsyncStorage.setItem('@veterinarias', JSON.stringify(actualizada));

            console.log('Veterinaria guardada:', nuevaVeterinaria);

            // 4. Mensaje de éxito y volver atrás
            Alert.alert(
                "Éxito",
                `Veterinaria "${nombreVeterinaria}" registrada.`,
                [{ text: "OK", onPress: () => navigation.goBack() }] // Regresa a ProgramarCita
            );

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo guardar la veterinaria.");
        }
    };

    // Función para abrir/cerrar menú lateral
    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) setIsNotificationsOpen(false);
    };

    // Función para abrir/cerrar notificaciones
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

    // Cierra el menú o las notificaciones si se toca fuera
    const handleOverlayClick = () => {
        if (isMenuOpen) setIsMenuOpen(false);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {/* Encabezado ORIGINAL */}
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

            {/* Contenido principal */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Formulario de registro (Diseño Original) */}
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
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Guardar Veterinaria</Text>
                </TouchableOpacity>

                {/* Botón Cancelar */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#666', textAlign: 'center' }}>Cancelar</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Fondo oscuro cuando se abre menú o notificaciones */}
            {isOverlayVisible && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleOverlayClick}
                />
            )}

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
                    onPress={() => { toggleMenu(); navigation.navigate('Home'); }}
                >
                    <Ionicons name="home" size={24} color="black" />
                    <Text style={styles.menuItemText}>Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}
                >
                    <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                    <Text style={styles.menuItemText}>Mascotas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}
                >
                    <Ionicons name="calendar-number" size={30} color="#007AFF" />
                    <Text style={styles.menuItemText}>Calendario</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => { toggleMenu(); navigation.navigate('Consejos'); }}
                >
                    <MaterialIcons name="tips-and-updates" size={30} color="#FF9500" />
                    <Text style={styles.menuItemText}>Consejos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => { toggleMenu(); navigation.navigate('Emergencias'); }}
                >
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
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 50,
        alignItems: 'center',
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
    formCard: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        width: '90%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 20,
        alignSelf: 'center',
        color: '#333'
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 10,
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