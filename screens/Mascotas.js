// Mascotas.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar el servicio de notificaciones
import NotificationService from './Notificaciones';
// Componente para mostrar cada notificación
const NotificationItem = ({ text, date }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>{text} {"\n"}<Text style={{ fontSize: 12, color: '#555' }}>{date}</Text></Text>
    </View>
);

export default function Mascotas() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    // Función que carga la mascota desde AsyncStorage
    {/*const cargarMascota = async () => {
        try {
            const data = await AsyncStorage.getItem("mascota");
            if (data) {
                setMascota(JSON.parse(data)); // ← actualiza el estado
            }
        } catch (error) {
            console.log("Error cargando mascota:", error);
        }
    };

    // Se ejecuta cada vez que entras a la pantalla
    useEffect(() => {
        if (isFocused) {
            cargarMascota();
        }
    }, [isFocused]);*/}
//
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [listaMascotas, setListaMascotas] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) setIsNotificationsOpen(false);
    };

    const toggleNotifications = async () => {
        const newState = !isNotificationsOpen;
        setIsNotificationsOpen(newState);
        if (newState) setIsMenuOpen(false);

        // Cargar las notificaciones guardadas al abrir el panel
        if (newState) {
            const allNotifications = await NotificationService.getNotifications();
            setNotificaciones(allNotifications);
        }
    };

    const handleOverlayClick = () => {
        if (isMenuOpen) setIsMenuOpen(false);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
    };

    const loadMascotas = async () => {
        try {
            const raw = await AsyncStorage.getItem('@mascotas');
            const arr = raw ? JSON.parse(raw) : [];
            setListaMascotas(arr);
        } catch (err) {
            console.error('loadMascotas error:', err);
            Alert.alert('Error', 'No se pudieron cargar las mascotas.');
        }
    };

    const deleteMascota = async (id) => {
        try {
            const raw = await AsyncStorage.getItem('@mascotas');
            const arr = raw ? JSON.parse(raw) : [];
            const filtered = arr.filter(m => m.id !== id);
            await AsyncStorage.setItem('@mascotas', JSON.stringify(filtered));
            setListaMascotas(filtered);
        } catch (err) {
            console.error('deleteMascota error:', err);
            Alert.alert('Error', 'No se pudo eliminar la mascota.');
        }
    };

    useEffect(() => {
        if (isFocused) loadMascotas();
    }, [isFocused]);

    // Diccionario centralizado de imágenes por especie
    const IMAGES = {
        default: 'https://images.pexels.com/photos/662417/pexels-photo-662417.jpeg',
        perro: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
        gato: 'https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg',
        ave: 'https://images.pexels.com/photos/6279041/pexels-photo-6279041.jpeg',
        acuatico: 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg',
        reptil: 'https://images.pexels.com/photos/735174/pexels-photo-735174.jpeg',
        fallback: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg'
    };

    const getImageForEspecie = (m) => {
        // Si ya viene con imagen, la devuelve directamente
        if (m?.image) return m.image;

        // Normaliza especie a minúsculas
        const especie = m?.especie?.toLowerCase() || '';
        if (!especie) return IMAGES.default;

        // Caso especial: "domestico" → aleatorio entre perro y gato
        if (especie.includes('domestico')) {
            const domesticOptions = [IMAGES.perro, IMAGES.gato];
            return domesticOptions[Math.floor(Math.random() * domesticOptions.length)];
        }

        // Chequeos específicos
        if (especie.includes('perro') || especie.includes('dog')) return IMAGES.perro;
        if (especie.includes('gato') || especie.includes('cat')) return IMAGES.gato;
        if (especie.includes('ave')) return IMAGES.ave;
        if (especie.includes('acuatico')) return IMAGES.acuatico;
        if (especie.includes('reptil') || especie.includes('reptiles')) return IMAGES.reptil;

        // Si no coincide con nada, usa fallback
        return IMAGES.fallback;
    };


    return (
        <View style={styles.fullScreenContainer}>
            <StatusBar style="auto" />

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

            <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollContainer}>
                {listaMascotas.length === 0 ? (
                    <View style={{ padding: 30, alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, marginBottom: 12 }}>No tienes mascotas registradas.</Text>
                        <TouchableOpacity style={[styles.saveButton, { width: 180 }]} onPress={() => navigation.navigate('RegistroMascota')}>
                            <Text style={styles.saveButtonText}>Agregar Mascota</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    listaMascotas.map((m) => (
                        <TouchableOpacity
                            key={m.id}
                            onPress={() =>
                                navigation.navigate("PerfilMascotaStack", {
                                    screen: "PerfilMascota",
                                    params: { mascota: m }
                                })
                            }

                            style={styles.card}
                        >
                            <Text style={styles.detailTitle}>Mascota: "{m.nombre}"</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Edad:</Text>
                                <Text style={styles.detailValue}>{m.edad || '-'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Peso:</Text>
                                <Text style={styles.detailValue}>{m.peso ? `${m.peso} kg` : '-'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Raza:</Text>
                                <Text style={styles.detailValue}>{m.raza || '-'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Mascota:</Text>
                                <Text style={styles.detailValue}>{m.especie || '-'}</Text>
                            </View>

                            <Image
                                source={{ uri: getImageForEspecie(m) }}
                                style={styles.petImage}
                            />

                            <TouchableOpacity
                                style={[styles.vaccineButton, { right: 15, left: undefined }]}
                                onPress={() => {
                                    Alert.alert(
                                        'Eliminar',
                                        `¿Eliminar a ${m.nombre}?`,
                                        [
                                            { text: 'Cancelar', style: 'cancel' },
                                            { text: 'Eliminar', style: 'destructive', onPress: () => deleteMascota(m.id) }
                                        ]
                                    );
                                }}
                            >
                                <Ionicons name="trash" size={18} color="#FF3B30" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.vacunaButton}
                                onPress={() => navigation.navigate('ConfirmacionVacuna', { mascota: m })}
                            >
                                <Ionicons name="medkit" size={18} color="#007BFF" />

                            </TouchableOpacity>

                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={styles.floatingAddButton} onPress={() => navigation.navigate('RegistroMascota')}>
                <MaterialIcons name="add" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.floatingAddButton2} onPress={() => navigation.navigate('ProgramarCita')}>
                <MaterialIcons name="edit-calendar" size={30} color="white" />
            </TouchableOpacity>

            {isOverlayVisible && (
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleOverlayClick} />
            )}

            <View style={[styles.sideMenu, { transform: [{ translateX: isMenuOpen ? 0 : -280 }] }]}>
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
                <TouchableOpacity style={styles.menuItem} onPress={() => alert('Ya te encuentras en mascotas')}>
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
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Emergencias')}>
                    <MaterialIcons name="emergency" size={30} color="#FF3B30" />
                    <Text style={styles.menuItemText}>Emergencias</Text>
                </TouchableOpacity>
            </View>

            {isNotificationsOpen && (
                <View style={notificationStyles.notificationsContainer}>
                    <Text style={notificationStyles.headerText}>Notificaciones</Text>
                    <ScrollView style={notificationStyles.list}>
                        {notificaciones.map((n, index) => (
                            <NotificationItem key={index} text={n.text} date={n.date} />
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 100,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
        width: '100%',
        backgroundColor: '#f5f5f5',
    },
    headerRight: {
        flexDirection: 'row',
        width: '35%',
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
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 8,
        marginBottom: 20,
        width: '100%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#ddd',
        position: 'relative',
    },
    detailTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 15,
        color: '#333'
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        fontWeight: '600',
        marginRight: 5,
        color: '#333',
        width: 120,
    },
    detailValue: {
        color: '#555',
        flexShrink: 1,
    },
    petImage: {
        width: 100,
        height: 150,
        borderRadius: 8,
        marginTop: 20,
        alignSelf: 'center',
    },
    vaccineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 15,
        left: 15,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        elevation: 2,
    },
    floatingAddButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 15,
    },
    floatingAddButton2: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 15,
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
    },
    vacunaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 15,
        left: 15,
        backgroundColor: '#E8F1FF',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#77A6F7',
        elevation: 3,
    },
    vacunaButtonText: {
        color: '#007BFF',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 14,
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
