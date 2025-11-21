import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';

// Componente para mostrar cada notificación
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

export default function Mascotas() {
    const navigation = useNavigation();

    // Estado para abrir o cerrar el menú lateral
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Estado para abrir o cerrar las notificaciones
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Determina si se debe mostrar el fondo oscuro
    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    // Alternar menú
    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) setIsNotificationsOpen(false);
    };

    // Alternar notificaciones
    const toggleNotifications = () => {
        const newState = !isNotificationsOpen;
        setIsNotificationsOpen(newState);
        if (newState) setIsMenuOpen(false);
    };

    // Cerrar todo al presionar fuera
    const handleOverlayClick = () => {
        if (isMenuOpen) setIsMenuOpen(false);
        if (isNotificationsOpen) setIsNotificationsOpen(false);
    };

    // Función para navegar a otra pantalla
    const navigateTo = (screenName, params = {}) => {
        if (isMenuOpen) setIsMenuOpen(false);
        try {
            navigation.navigate(screenName, params);
        } catch (err) {
            console.warn('Navigation error:', err);
        }
    };

    return (
        <View style={styles.fullScreenContainer}>
            <StatusBar style="auto" />

            {/* Encabezado con menú, notificaciones y perfil */}
            <View style={styles.header}>
                {/* Botón menú */}
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} color="black" />
                </TouchableOpacity>

                {/* Botones de notificación y perfil */}
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

            {/* Contenedor desplazable con las tarjetas de mascotas */}
            <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollContainer}>
                {/* Tarjeta de la mascota 1 */}
                <TouchableOpacity

                    style={styles.card}
                >
                    <Text style={styles.detailTitle}>Mascota: "Toby"</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Edad:</Text>
                        <Text style={styles.detailValue}>2 años</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Peso:</Text>
                        <Text style={styles.detailValue}>30 kg</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Raza:</Text>
                        <Text style={styles.detailValue}>Husky</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Mascota:</Text>
                        <Text style={styles.detailValue}>Domestico (Perro)</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Prox Vacuna:</Text>
                        <Text style={styles.detailValue}>Moquillo</Text>
                    </View>

                    {/* Imagen del perro */}
                    <Image
                        source={{ uri: 'https://images.pexels.com/photos/46505/swiss-shepherd-dog-dog-pet-portrait-46505.jpeg' }}
                        style={styles.petImage}
                    />

                    {/* Botón para confirmar vacuna */}
                    <TouchableOpacity
                        style={styles.vaccineButton}
                        onPress={() => navigation.navigate('ConfirmacionVacuna')}
                    >
                        <FontAwesome5 name="syringe" size={18} color="#007BFF" />
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={{ marginLeft: 5 }} />
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* Tarjeta de la mascota 2 */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('PerfilMascota')}
                >
                    <Text style={styles.detailTitle}>Mascota: "Gerardo"</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Edad:</Text>
                        <Text style={styles.detailValue}>1 año</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Peso:</Text>
                        <Text style={styles.detailValue}>10 kg</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Raza:</Text>
                        <Text style={styles.detailValue}>Siames</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Mascota:</Text>
                        <Text style={styles.detailValue}>Domestico (Gato)</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Prox Vacuna:</Text>
                        <Text style={styles.detailValue}>FeLV</Text>
                    </View>

                    {/* Imagen del gato */}
                    <Image
                        source={{ uri: 'https://images.pexels.com/photos/1208938/pexels-photo-1208938.jpeg' }}
                        style={styles.petImage}
                    />

                    {/* Botón para confirmar vacuna */}
                    <TouchableOpacity
                        style={styles.vaccineButton}
                        onPress={() => navigation.navigate('ConfirmacionVacuna')}
                    >
                        <FontAwesome5 name="syringe" size={18} color="#007BFF" />
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={{ marginLeft: 5 }} />
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* Tarjeta con boton */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('PerfilMascotaStack')} // Navegación a perfil mascota
                >
                    <Text style={styles.detailTitle}>Mascota: "Ziggy"</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Edad:</Text>
                        <Text style={styles.detailValue}>1 año</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Peso:</Text>
                        <Text style={styles.detailValue}>10 kg</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Raza:</Text>
                        <Text style={styles.detailValue}>Siames</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Mascota:</Text>
                        <Text style={styles.detailValue}>Domestico (Perro)</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Prox Vacuna:</Text>
                        <Text style={styles.detailValue}>FeLV</Text>
                    </View>
                    {/* Imagen del gato */}
                    <Image
                        source={{ uri: 'https://images.pexels.com/photos/46505/swiss-shepherd-dog-dog-pet-portrait-46505.jpeg' }}
                        style={styles.petImage}
                    />

                    {/* Botón para confirmar vacuna */}
                    <TouchableOpacity
                        style={styles.vaccineButton}
                        onPress={() => navigation.navigate('ConfirmacionVacuna')}
                    >
                        <FontAwesome5 name="syringe" size={18} color="#007BFF" />
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={{ marginLeft: 5 }} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </ScrollView>


            {/* Botón flotante para agregar nueva mascota o cita */}
            <TouchableOpacity
                style={styles.floatingAddButton}
                onPress={() => navigation.navigate('ProgramarCita')}
            >
                <MaterialIcons name="add" size={30} color="white" />
            </TouchableOpacity>

            {/* Fondo oscuro al abrir menú o notificaciones */}
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
                { transform: [{ translateX: isMenuOpen ? 0 : -280 }] }
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
    menuFooter: {
        marginTop: 'auto',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
        width: 150,
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
