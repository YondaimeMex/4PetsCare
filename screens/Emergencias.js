import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NotificationService from './Notificaciones';

// Componente que muestra cada notificación individual
const NotificationItem = ({ text, date }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>{text} {"\n"}<Text style={{ fontSize: 12, color: '#555' }}>{date}</Text></Text>
    </View>
);

// Componente para mostrar cada veterinaria (ACTUALIZADO con botón de eliminar)
const VeterinariaItem = ({ veterinaria, onDelete }) => (
    <View style={styles.card}>
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(veterinaria)}
        >
            <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
        <Text style={styles.title}>{veterinaria.label}</Text>
        <Text style={styles.subtitle}>📍 {veterinaria.ubicacion}</Text>
        <Text style={styles.telefono}>📞 {veterinaria.numero || 'No proporcionado'}</Text>
    </View>
);

// Pantalla principal de emergencias
export default function Emergencias() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [veterinarias, setVeterinarias] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar veterinarias desde AsyncStorage
    const loadVeterinarias = async () => {
        try {
            setLoading(true);
            const veterinariasRaw = await AsyncStorage.getItem('@veterinarias');
            const veterinariasData = veterinariasRaw ? JSON.parse(veterinariasRaw) : [];
            setVeterinarias(veterinariasData);
        } catch (error) {
            console.error("Error cargando veterinarias:", error);
            setVeterinarias([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar veterinaria
    const deleteVeterinaria = async (veterinariaToDelete) => {
        Alert.alert(
            "Confirmar Eliminación",
            `¿Estás seguro de que quieres eliminar la veterinaria "${veterinariaToDelete.label}"?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            // Obtener veterinarias actuales
                            const veterinariasRaw = await AsyncStorage.getItem('@veterinarias');
                            const veterinariasData = veterinariasRaw ? JSON.parse(veterinariasRaw) : [];

                            // Filtrar la veterinaria a eliminar
                            const updatedVeterinarias = veterinariasData.filter(
                                vet => vet.id !== veterinariaToDelete.id
                            );

                            // Guardar la lista actualizada
                            await AsyncStorage.setItem('@veterinarias', JSON.stringify(updatedVeterinarias));

                            // Actualizar el estado local
                            setVeterinarias(updatedVeterinarias);

                            Alert.alert("Éxito", "Veterinaria eliminada correctamente.");

                        } catch (error) {
                            console.error("Error al eliminar veterinaria:", error);
                            Alert.alert("Error", "No se pudo eliminar la veterinaria.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Función para eliminar TODAS las veterinarias
    const deleteAllVeterinarias = () => {
        if (veterinarias.length === 0) {
            Alert.alert("Info", "No hay veterinarias para eliminar.");
            return;
        }

        Alert.alert(
            "Eliminar Todas",
            `¿Estás seguro de que quieres eliminar todas las ${veterinarias.length} veterinarias?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar Todas",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('@veterinarias');
                            setVeterinarias([]);
                            Alert.alert("Éxito", "Todas las veterinarias han sido eliminadas.");
                        } catch (error) {
                            console.error("Error al eliminar todas las veterinarias:", error);
                            Alert.alert("Error", "No se pudieron eliminar las veterinarias.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    useEffect(() => {
        if (isFocused) {
            loadVeterinarias();
        }
    }, [isFocused]);

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
            try {
                const allNotifications = await NotificationService.getNotifications();
                setNotificaciones(allNotifications);
            } catch (error) {
                console.error("Error al cargar notificaciones:", error);
                setNotificaciones([]);
            }
        }
    };

    // Cierra el menú o notificaciones al tocar fuera
    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };

    // Determina si se muestra el fondo oscuro
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
                    {/* Botón de notificaciones */}
                    <TouchableOpacity style={[styles.floatingBtn, styles.headerIcon]} onPress={toggleNotifications}>
                        <Ionicons name="notifications" size={32} color="black" />
                    </TouchableOpacity>

                    {/* Botón para ir al perfil */}
                    <TouchableOpacity
                        style={[styles.floatingBtn, styles.headerIcon]}
                        onPress={() => navigation.navigate('Perfil')}
                    >
                        <Ionicons name="person-circle-outline" size={32} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contenido principal con información de veterinarias */}
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerText}>Veterinarias en caso de emergencia:</Text>

                {/* Contador y botón de eliminar todas */}
                {veterinarias.length > 0 && (
                    <View style={styles.headerActions}>
                        <Text style={styles.counterText}>
                            {veterinarias.length} veterinaria{veterinarias.length !== 1 ? 's' : ''} registrada{veterinarias.length !== 1 ? 's' : ''}
                        </Text>
                        <TouchableOpacity
                            style={styles.deleteAllButton}
                            onPress={deleteAllVeterinarias}
                        >
                            <MaterialIcons name="delete-sweep" size={20} color="#FF3B30" />
                            <Text style={styles.deleteAllText}>Eliminar todas</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loading ? (
                    <Text style={styles.loadingText}>Cargando veterinarias...</Text>
                ) : veterinarias.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="medical-outline" size={50} color="#ccc" />
                        <Text style={styles.emptyStateText}>No hay veterinarias registradas</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Presiona el botón + para agregar tu primera veterinaria de emergencia
                        </Text>
                    </View>
                ) : (
                    veterinarias.map((veterinaria, index) => (
                        <VeterinariaItem
                            key={veterinaria.id || index}
                            veterinaria={veterinaria}
                            onDelete={deleteVeterinaria}
                        />
                    ))
                )}

            </ScrollView>

            {/* Botón flotante para registrar una nueva veterinaria */}
            <TouchableOpacity
                style={styles.floatingBtnRight}
                onPress={() => navigation.navigate('RegistroVeterinaria')}
            >
                <MaterialCommunityIcons name="plus-circle-outline" size={24} color="black" />
            </TouchableOpacity>

            {/* Fondo oscuro al abrir menú o notificaciones */}
            {isOverlayVisible && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleOverlayClick}
                />
            )}

            {/* Menú lateral izquierdo */}
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

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Mascotas')}>
                    <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                    <Text style={styles.menuItemText}>Mascotas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Calendario')}>
                    <Ionicons name="calendar-number" size={30} color="#007AFF" />
                    <Text style={styles.menuItemText}>Calendario</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Consejos')}>
                    <MaterialIcons name="tips-and-updates" size={30} color="#FF9500" />
                    <Text style={styles.menuItemText}>Consejos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => alert('Ya te encuentras en emergencias')}>
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

//Estilos principales
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 100,
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
        padding: 15,
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
    headerText: {
        fontSize: 20,
        marginBottom: 20,
        fontWeight: "bold",
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    counterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    deleteAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#FFEBEE',
        borderRadius: 6,
    },
    deleteAllText: {
        fontSize: 12,
        color: '#FF3B30',
        fontWeight: '500',
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#ffffffff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#ee4a52',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    deleteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        backgroundColor: '#FFEBEE',
        borderRadius: 15,
        zIndex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
        textAlign: 'center',
        color: '#333',
        paddingRight: 30, // Espacio para el botón de eliminar
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
        color: '#555',
    },
    telefono: {
        fontSize: 14,
        textAlign: 'center',
        color: '#007AFF',
        fontWeight: '500',
    },
    floatingBtnRight: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginVertical: 20,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginVertical: 20,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center',
    },
});

//Estilos del panel de notificaciones
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
    },
    notificationText: {
        fontSize: 16,
        flexShrink: 1,
    },
});