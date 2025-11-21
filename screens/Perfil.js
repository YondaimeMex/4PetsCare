import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';

// Componente para mostrar una notificación individual
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

export default function Perfil() {
  const navigation = useNavigation();

  // Estados para abrir/cerrar menú y notificaciones
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Estados del perfil
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('Usuario');
  const [registrationDate] = useState('15 de Octubre de 2024'); // Fecha fija de ejemplo
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  // Abrir o cerrar el menú lateral
  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (newState) {
      setIsNotificationsOpen(false);
    }
  };

  // Abrir o cerrar el panel de notificaciones
  const toggleNotifications = () => {
    const newState = !isNotificationsOpen;
    setIsNotificationsOpen(newState);
    if (newState) {
      setIsMenuOpen(false);
    }
  };

  // Cerrar todo si se toca el fondo oscuro
  const handleOverlayClick = () => {
    if (isMenuOpen) toggleMenu();
    if (isNotificationsOpen) toggleNotifications();
  };

  // Función para seleccionar imagen
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Se requieren permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Función para guardar el nombre editado
  const saveName = () => {
    if (tempName.trim() !== '') {
      setUserName(tempName.trim());
      setIsEditing(false);
      setTempName('');
    } else {
      Alert.alert('Error', 'El nombre no puede estar vacío');
    }
  };

  // Función para cancelar la edición
  const cancelEdit = () => {
    setIsEditing(false);
    setTempName('');
  };

  const isOverlayVisible = isMenuOpen || isNotificationsOpen;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Encabezado con menú, notificaciones y perfil */}
      <View style={styles.header}>
        {/* Botón menú hamburguesa */}
        <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
          <MaterialIcons name="menu" size={32} color="black" />
        </TouchableOpacity>

        {/* Botón de notificaciones */}
        <TouchableOpacity style={[styles.floatingBtn, styles.headerIcon]} onPress={toggleNotifications}>
          <Ionicons name="notifications" size={32} color="black" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <ScrollView style={styles.content}>
        {/* Contenido del perfil */}
        <View style={profileStyles.container}>
          {/* Título Perfil */}
          <Text style={profileStyles.title}>Perfil</Text>

          {/* Imagen de perfil */}
          <TouchableOpacity onPress={pickImage} style={profileStyles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={profileStyles.profileImage} />
            ) : (
              <View style={profileStyles.defaultImage}>
                <Ionicons name="person-circle" size={120} color="#ccc" />
              </View>
            )}
          </TouchableOpacity>

          {/* Nombre de usuario */}
          <Text style={profileStyles.label}>Usuario</Text>
          {isEditing ? (
            <View style={profileStyles.editContainer}>
              <TextInput
                style={profileStyles.input}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Nuevo nombre"
                autoFocus
              />
              <View style={profileStyles.buttonGroup}>
                <TouchableOpacity style={[profileStyles.actionButton, profileStyles.saveButton]} onPress={saveName}>
                  <Text style={profileStyles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[profileStyles.actionButton, profileStyles.cancelButton]} onPress={cancelEdit}>
                  <Text style={profileStyles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={profileStyles.infoBox}>
              <Text style={profileStyles.infoText}>{userName}</Text>
            </View>
          )}

          {/* Fecha de registro */}
          <Text style={profileStyles.label}>Fecha de registro</Text>
          <View style={profileStyles.infoBox}>
            <Text style={profileStyles.infoText}>{registrationDate}</Text>
          </View>

          {/* Botón editar nombre */}
          {!isEditing && (
            <TouchableOpacity
              style={profileStyles.editButton}
              onPress={() => {
                setTempName(userName);
                setIsEditing(true);
              }}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
              <Text style={profileStyles.editButtonText}>Editar nombre</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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

        {/* Opciones del menú */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => { toggleMenu(); navigation.navigate('Home'); }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    flex: 1,
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
  floatingBtn: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 50,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ccc',
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
  },
  notificationText: {
    fontSize: 16,
  },
});

// Estilos para el perfil
const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  defaultImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '90%',
    marginBottom: 25,
  },
  infoText: {
    fontSize: 18,
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editContainer: {
    width: '90%',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4BCF5C',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
