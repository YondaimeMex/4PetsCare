import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';

import NotificationService from './Notificaciones';

// Lista de consejos disponibles
const petTips = [
    { title: 'Nutrición Esencial 🍎', text: 'Asegúrate de que la dieta de tu mascota sea balanceada y apropiada para su edad y nivel de actividad. Evita darle comida humana que pueda ser tóxica (como el chocolate o las uvas).' },
    { title: 'Ejercicio Diario 🏃‍♀️', text: 'El ejercicio regular es vital. Un perro necesita paseos; un gato, tiempo de juego. Esto previene la obesidad y problemas de comportamiento.' },
    { title: 'Salud Dental 🦷', text: 'Cepilla los dientes de tu mascota varias veces a la semana con pasta especial para animales para prevenir enfermedades periodontales.' },
    { title: 'Revisiones Veterinarias 🩺', text: 'No esperes a que tu mascota esté enferma. Las revisiones anuales y las vacunas al día son clave para la detección temprana de problemas.' },
    { title: 'Identificación Segura 🏷️', text: 'Coloca un collar con placa de identificación actualizada y considera el microchip. Si se pierde, esto es fundamental para recuperarla.' },
    { title: 'Hidratación Constante 💧', text: 'Proporciona agua fresca y limpia en todo momento. Lávate el cuenco a diario para evitar el crecimiento de bacterias.' },
    { title: 'Socialización Temprana 🐾', text: 'Expón a tu mascota (especialmente cachorros) a diferentes personas, sonidos y entornos de forma segura para fomentar un buen temperamento.' },
    { title: 'Control de Parásitos 🐛', text: 'Mantén un calendario estricto para desparasitación interna y externa (pulgas y garrapatas), siguiendo las indicaciones de tu veterinario.' },
];


const NotificationItem = ({ text, date }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>{text} {"\n"}<Text style={{ fontSize: 12, color: '#555' }}>{date}</Text></Text>
    </View>
);

export default function Consejos() {
    const navigation = useNavigation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    // Estado para guardar el consejo actual
    const [currentTip, setCurrentTip] = useState(petTips[0]); 

    // Función para actualizar el consejo
    const updateTip = useCallback(() => {
        // Generar un índice aleatorio
        const randomIndex = Math.floor(Math.random() * petTips.length);
        
        // Seleccionar un nuevo consejo
        const newTip = petTips[randomIndex];
        
        // Actualizar el estado
        setCurrentTip(newTip);
        
        Alert.alert("Actualizado", "¡Aquí tienes un nuevo consejo!");
    }, []); // El array vacío asegura que la función solo se cree una vez

    // Cargar el primer consejo al iniciar el componente
    useEffect(() => {
        updateTip();
    }, [updateTip]);


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
                setNotificaciones([]);
            }
        }
    };

    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };

    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {/* --- Encabezado */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} color="black" />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={[styles.floatingBtn, styles.headerIcon]} onPress={toggleNotifications}>
                        <Ionicons name="notifications" size={32} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.floatingBtn, styles.headerIcon]} onPress={() => navigation.navigate('Perfil')}>
                        <Ionicons name="person-circle-outline" size={32} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- Contenido principal --- */}
            <ScrollView contentContainerStyle={styles.content}>
                
                {/* Primer Card: Contenido fijo */}
                <View style={styles.card}>
                    <Text style={styles.title}>Consejos Básicos</Text>
                    <Text style={styles.cardText}>Cuida a tu mascota con amor, buena alimentación y visitas al veterinario. Mantén su espacio limpio y dale agua fresca siempre.</Text>
                </View>
                
                {/* Segundo Card: Contenido dinámico */}
                <View style={styles.dynamicCard}>
                    <Text style={styles.dynamicTitle}>{currentTip.title}</Text>
                    <Text style={styles.dynamicCardText}>{currentTip.text}</Text>
                </View>

                {/* Contenido adicional */}
                <View style={styles.card}>
                     <Text style={styles.cardText}>Juega con ella y mantenla limpia y protegida.</Text>
                </View>

            </ScrollView>

            {/* --- Botón flotante central --- */}
            <TouchableOpacity style={styles.floatingBtnCenter} onPress={updateTip}>
                <View style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="restart" size={40} color="black" />
                    <Text style={styles.vaccineButtonText}>Actualizar</Text>
                </View>
            </TouchableOpacity>

            {/* --- Overlay --- */}
            {isOverlayVisible && (
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleOverlayClick} />
            )}

            {/* --- Menú lateral --- */}
            <View style={[styles.sideMenu, { transform: [{ translateX: isMenuOpen ? 0 : -300 }] }]}>
                <View style={styles.menuHeader}>
                    <Text style={styles.menuTitle}>Menú</Text>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="close" size={30} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Opciones de menú */}
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="home" size={24} color="black" />
                        <Text style={styles.menuItemText}>Inicio</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                        <Text style={styles.menuItemText}>Mascotas</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar-number" size={30} color="#007AFF" />
                        <Text style={styles.menuItemText}>Calendario</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => alert('Ya te encuentras en consejos')}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="tips-and-updates" size={30} color="#FF9500" />
                        <Text style={styles.menuItemText}>Consejos</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Emergencias'); }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="emergency" size={30} color="#FF3B30" />
                        <Text style={styles.menuItemText}>Emergencias</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* --- Panel de notificaciones --- */}
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

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 150,
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
        padding: 15
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
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        flex: 1
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
    // Estilo para el card fijo
    card: {
        backgroundColor: '#e0e0e0',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20
    },
    cardText: {
        fontSize: 16,
        lineHeight: 22
    },
    // Estilo para el card dinámico
    dynamicCard: {
        backgroundColor: '#FFEBEE',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: '#FF9500',
    },
    dynamicTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
        color: '#D15700',
    },
    dynamicCardText: {
        fontSize: 16,
        lineHeight: 22,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 10,
        textAlign: 'center'
    },
    floatingBtn: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 50,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    floatingBtnCenter: {
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: [{ translateX: -40 }],
        backgroundColor: '#FF9500',
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    vaccineButtonText: {
        fontSize: 12,
        marginTop: 2,
        textAlign: 'center',
        color: 'black',
        fontWeight: 'bold',
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