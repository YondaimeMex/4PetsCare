// RegistroMascota.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// ----------------------------------------------------------------------------
// saveMascotaToDB: guarda en AsyncStorage local (clave: @mascotas).
// Retorna { success: boolean, message?: string, data?: any }
// ----------------------------------------------------------------------------
export async function saveMascotaToDB(mascota) {
    try {
        const raw = await AsyncStorage.getItem('@mascotas');
        const actuales = raw ? JSON.parse(raw) : [];

        const nueva = { id: Date.now(), ...mascota };

        const updated = [nueva, ...actuales];

        await AsyncStorage.setItem('@mascotas', JSON.stringify(updated));
        console.log('saveMascotaToDB: guardado en AsyncStorage ->', nueva);

        return { success: true, message: 'Guardado local (AsyncStorage)', data: nueva };
    } catch (err) {
        console.error('saveMascotaToDB - AsyncStorage error:', err);
        return { success: false, message: 'No se pudo guardar localmente' };
    }
}

// Importar el servicio de notificaciones
import NotificationService from './Notificaciones';
// Componente para mostrar cada notificación
const NotificationItem = ({ text, date }) => (
    <View style={notificationStyles.notificationItem}>
        <View style={notificationStyles.bullet} />
        <Text style={notificationStyles.notificationText}>{text} {"\n"}<Text style={{ fontSize: 12, color: '#555' }}>{date}</Text></Text>
    </View>
);

const especies = [
    { key: 'domestico', label: 'Domestico (Perro, Gato, etc)' },
    { key: 'ave', label: 'Ave (Perico, Loro, etc)' },
    { key: 'acuatico', label: 'Acuatico (Betta, Goldfish, etc)' },
    { key: 'reptiles', label: 'Reptiles (Tortuga, Iguana, etc)' },
];

export default function RegistroMascota() {
    const navigation = useNavigation();

    // campos
    const [nombreMascota, setNombreMascota] = useState('');
    const [especie, setEspecie] = useState('');
    const [raza, setRaza] = useState('');
    const [edad, setEdad] = useState('');
    const [peso, setPeso] = useState('');

    // imagen: uri y key para forzar re-render/caché bust
    const [imageUri, setImageUri] = useState(null);
    const [imageKey, setImageKey] = useState(null);

    // UI
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    const Selectespecie = (option) => {
        setEspecie(option.label);
        setIsDropdownOpen(false);
    };
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    // ---------- Image Picker (actualizado para SDK old/new) ----------
    const pickImageFromLibrary = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a la galería.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            console.log('pickImageFromLibrary result:', result);

            // Soporta ambos formatos:
            // Nuevo: result.canceled / result.assets[0].uri
            // Antiguo: result.cancelled / result.uri
            const uri =
                (result.assets && result.assets[0] && result.assets[0].uri) ||
                result.uri ||
                (result.cancelled === false && result.uri) ||
                null;

            if (uri) {
                // Forzar bust de cache en preview con key
                setImageUri(uri);
                setImageKey(Date.now());
                console.log('Imagen seleccionada URI:', uri);
            } else {
                console.log('Selección cancelada o sin URI.');
            }
        } catch (err) {
            console.error('pickImageFromLibrary error:', err);
            Alert.alert('Error', 'No se pudo seleccionar la imagen.');
        }
    };

    const takePhotoWithCamera = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permiso denegado', 'Necesitamos permiso para usar la cámara.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            console.log('takePhotoWithCamera result:', result);

            const uri =
                (result.assets && result.assets[0] && result.assets[0].uri) ||
                result.uri ||
                (result.cancelled === false && result.uri) ||
                null;

            if (uri) {
                setImageUri(uri);
                setImageKey(Date.now());
                console.log('Foto tomada URI:', uri);
            } else {
                console.log('Foto cancelada o sin URI.');
            }
        } catch (err) {
            console.error('takePhotoWithCamera error:', err);
            Alert.alert('Error', 'No se pudo tomar la foto.');
        }
    };

    const removeImage = () => {
        setImageUri(null);
        setImageKey(null);
    };

    // Guarda los datos
    const handleSave = async () => {
        if (!nombreMascota?.trim() || !especie?.trim()) {
            Alert.alert('Campos faltantes', 'Ingresa el nombre y selecciona la especie de tu mascota.');
            return;
        }

        const mascotaData = {
            nombre: nombreMascota.trim(),
            especie: especie.trim(),
            raza: raza.trim(),
            edad: edad.trim(),
            peso: peso.trim(),
            image: imageUri || null, // guardamos la URI tal cual
            imageKey: imageKey || null // opcional para bust cache al mostrar
        };

        console.log('handleSave -> mascotaData:', mascotaData);

        setLoading(true);
        try {
            const result = await saveMascotaToDB(mascotaData);

            if (result && result.success) {
                Alert.alert('Guardado', `¡Mascota ${mascotaData.nombre} registrada con éxito!`);

                await NotificationService.saveNotification(`¡Felicidades! Se ha guardado con exito ${mascotaData.nombre} (${mascotaData.especie}).`);

                // limpiar formulario
                setNombreMascota('');
                setEspecie('');
                setRaza('');
                setEdad('');
                setPeso('');
                setImageUri(null);
                setImageKey(null);

                navigation.navigate('Mascotas');
            } else {
                const msg = (result && result.message) ? result.message : 'No se pudo guardar la mascota.';
                Alert.alert('Error al guardar', msg);
            }
        } catch (error) {
            console.error('Error guardando mascota:', error);
            Alert.alert('Error', 'Ocurrió un error al guardar. Revisa la consola.');
        } finally {
            setLoading(false);
        }
    };

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
            }
        }
    };

    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
        if (isNotificationsOpen) toggleNotifications();
    };
    const isOverlayVisible = isMenuOpen || isNotificationsOpen;

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollContainer}>
            <StatusBar style="auto" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                    <MaterialIcons name="menu" size={32} />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity accessible accessibilityLabel="Notificaciones" style={[styles.floatingBtn, styles.headerIcon]} onPress={toggleNotifications}>
                        <Ionicons name="notifications" size={32} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity accessible accessibilityLabel="Perfil" style={[styles.floatingBtn, styles.headerIcon]} onPress={() => navigation.navigate('Perfil')}>
                        <Ionicons name="person-circle-outline" size={32} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Formulario */}
            <View style={styles.formCard}>
                <Text style={styles.title}>¡Registra a tu mascota!</Text>
                <Text style={styles.label}>Nombre de tu mascota</Text>
                <TextInput style={styles.input} value={nombreMascota} onChangeText={setNombreMascota} placeholder="Ej. Toby" placeholderTextColor="#999" accessibilityLabel="Nombre de la mascota" />
            </View>

            <View style={styles.formCard}>
                <Text style={styles.label}>¿Qué mascota es?</Text>
                <TouchableOpacity style={styles.dropdownContainer} onPress={toggleDropdown} accessibilityRole="button" accessibilityLabel="Seleccionar especie">
                    <TextInput style={styles.dropdownInput} value={especie} placeholder="Selecciona una especie" placeholderTextColor={especie ? '#000' : '#999'} editable={false} />
                    <MaterialIcons name={isDropdownOpen ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color="black" style={styles.dropdownIcon} />
                </TouchableOpacity>

                {isDropdownOpen && especies.map((option) => (
                    <TouchableOpacity key={option.key} style={styles.dropdownItem} onPress={() => Selectespecie(option)}>
                        <Text style={styles.dropdownText}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.formCard}>
                <Text style={styles.label}>Raza de tu mascota</Text>
                <TextInput style={styles.input} value={raza} onChangeText={setRaza} placeholder="Ej. Golden Retriever" placeholderTextColor="#999" />
            </View>

            <View style={styles.formCard}>
                <Text style={styles.label}>Edad</Text>
                <TextInput style={styles.input} value={edad} onChangeText={setEdad} placeholder="Ej. 5" placeholderTextColor="#999" keyboardType="numeric" />
            </View>

            <View style={styles.formCard}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput style={styles.input} value={peso} onChangeText={setPeso} placeholder="Ej. 30" placeholderTextColor="#999" keyboardType="numeric" />
            </View>

            {/* Imagen */}
            <View style={[styles.formCard, { alignItems: 'center' }]}>
                <Text style={styles.label}>Imagen de tu mascota</Text>

                {imageUri ? (
                    <>
                        {/* key forzar recarga si cambia imageUri */}
                        <Image key={String(imageKey)} source={{ uri: imageUri }} style={styles.previewImage} />
                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <TouchableOpacity style={[styles.smallBtn, { marginRight: 8 }]} onPress={pickImageFromLibrary}>
                                <Text style={styles.smallBtnText}>Cambiar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#FF3B30' }]} onPress={removeImage}>
                                <Text style={styles.smallBtnText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.placeholderImage}>
                            <Ionicons name="image" size={48} color="#bbb" />
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                            <TouchableOpacity style={styles.smallBtn} onPress={pickImageFromLibrary}>
                                <Text style={styles.smallBtnText}>Galería</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallBtn, { marginLeft: 8 }]} onPress={takePhotoWithCamera}>
                                <Text style={styles.smallBtnText}>Cámara</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>

            <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading} accessibilityLabel="Guardar mascota">
                {loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator size="small" />
                        <Text style={[styles.saveButtonText, { marginLeft: 10 }]}>Guardando...</Text>
                    </View>
                ) : (
                    <Text style={styles.saveButtonText}>Guardar Mascota</Text>
                )}
            </TouchableOpacity>

            {isOverlayVisible && (
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleOverlayClick} />
            )}

            {/* Menu lateral */}
            <View style={[styles.sideMenu, { transform: [{ translateX: isMenuOpen ? 0 : -300 }] }]}>
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
        </ScrollView>
    );
}

// Estilos (iguales a los que tenías, con algunos extras para imagen)
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
    },
    // Imagen
    placeholderImage: {
        width: 150,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: 150,
        height: 120,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    smallBtn: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    smallBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
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