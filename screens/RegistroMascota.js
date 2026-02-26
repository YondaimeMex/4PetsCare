import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import React from 'react';
import { useApp } from '../context';

// Componente para mostrar una notificación individual
const NotificationItem = ({ text, color }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={[notificationStyles.notificationText, { color: color || '#000' }]}>{text}</Text>
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
    const { colors, t } = useApp();

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
        <ScrollView contentContainerStyle={styles.scrollContent} style={[styles.scrollContainer, { backgroundColor: colors.background }]}>
            <StatusBar style={colors.background === '#121212' ? 'light' : 'auto'} />

            {/* Encabezado con menú, notificaciones y perfil */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={[styles.floatingBtn, styles.headerIcon, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={toggleNotifications}>
                        <Ionicons name="notifications" size={32} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.floatingBtn, styles.headerIcon, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Perfil')}
                    >
                        <Ionicons name="person-circle-outline" size={32} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Formulario de registro de mascota */}
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>¡Registra a tu mascota!</Text>
                <Text style={[styles.label, { color: colors.text }]}>Nombre de tu mascota</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundLight, borderColor: colors.border, color: colors.text }]}
                    value={nombreMascota}
                    onChangeText={setNombreMascota}
                    placeholder="Ej. Toby"
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            {/* Selector de especie */}
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.text }]}>¿Qué mascota es?</Text>
                <TouchableOpacity
                    style={[styles.dropdownContainer, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}
                    onPress={toggleDropdown}
                >
                    <TextInput style={[styles.dropdownInput, { color: colors.text }]}
                        value={especie}
                        placeholderTextColor={especie ? colors.text : colors.textMuted}
                        editable={false}
                    />
                    <MaterialIcons
                        name={isDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
                        size={24}
                        color={colors.text}
                        style={styles.dropdownIcon}
                    />
                </TouchableOpacity>

                {/* Opciones del menú desplegable */}
                {isDropdownOpen && especies.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        style={[styles.dropdownItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => Selectespecie(option)}
                    >
                        <Text style={[styles.dropdownText, { color: colors.text }]}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Campos adicionales */}
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.text }]}>Raza de tu mascota</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundLight, borderColor: colors.border, color: colors.text }]}
                    value={raza}
                    onChangeText={setRaza}
                    placeholder="Ej. Golden Retriever"
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.text }]}>Edad</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundLight, borderColor: colors.border, color: colors.text }]}
                    value={edad}
                    onChangeText={setEdad}
                    placeholder="Ej. 5 años"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                />
            </View>

            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.text }]}>Peso (kg)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundLight, borderColor: colors.border, color: colors.text }]}
                    value={peso}
                    onChangeText={setPeso}
                    placeholder="Ej. 30kg"
                    placeholderTextColor={colors.textMuted}
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
                { transform: [{ translateX: isMenuOpen ? 0 : -300 }], backgroundColor: colors.card }
            ]}>
                <View style={styles.menuHeader}>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>{t.menu}</Text>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Ionicons name="close" size={30} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Opciones del menú lateral */}
                <TouchableOpacity
                    style={[styles.menuItem, { borderBottomColor: colors.border }]}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Ionicons name="home" size={24} color={colors.text} />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{t.home}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}>
                    <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{t.pets}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}>
                    <Ionicons name="calendar-number" size={30} color="#007AFF" />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{t.calendar}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Consejos'); }}>
                    <MaterialIcons name="tips-and-updates" size={30} color="#FF9500" />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{t.tips}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Emergencias'); }}>
                    <MaterialIcons name="emergency" size={30} color="#FF3B30" />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{t.emergencies}</Text>
                </TouchableOpacity>
            </View>

            {/* Notificaciones desplegables */}
            {isNotificationsOpen && (
                <View style={[notificationStyles.notificationsContainer, { backgroundColor: colors.card }]}>
                    <Text style={[notificationStyles.headerText, { color: colors.text }]}>{t.notifications}</Text>
                    <ScrollView style={notificationStyles.list}>
                        {notificationsData.map((text, index) => (
                            <NotificationItem key={index} text={text} color={colors.text} />
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
        padding: 8,
        borderRadius: 50,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
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
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
    },
    menuItemText: {
        fontSize: 18,
        marginLeft: 15,
    },
    formCard: {
        padding: 20,
        marginBottom: 20,
        width: '90%',
        borderWidth: 1,
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
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 20,
        alignSelf: 'center',
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        borderRadius: 5,
        marginBottom: 10,
        borderWidth: 1,
    },
    dropdownInput: {
        flex: 1,
        paddingHorizontal: 10,
    },
    dropdownIcon: {
        paddingRight: 5,
    },
    dropdownItem: {
        borderWidth: 1,
        padding: 12,
        marginTop: -1,
        width: '100%',
    },
    dropdownText: {
        fontSize: 16,
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
