import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper, Card, Button } from '../components';
import { spacing, typography, borderRadius } from '../constants';
import { useApp } from '../context';

export default function EditarPerfil() {
  const navigation = useNavigation();
  const { userData, updateUserData, isUserDataLoaded, colors, t } = useApp();

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del usuario cuando estén disponibles
  useEffect(() => {
    if (isUserDataLoaded && userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
      });
      setAvatar(userData.avatar || '');
    }
  }, [isUserDataLoaded, userData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      Alert.alert(t.error, t.nameRequired);
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert(t.error, t.emailRequired);
      return;
    }

    setIsSaving(true);

    // Guardar en el contexto (se persiste automáticamente)
    const success = await updateUserData({
      ...formData,
      avatar: avatar,
    });

    setIsSaving(false);

    if (success) {
      Alert.alert(t.success, t.profileUpdated, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert(t.error, t.saveError);
    }
  };

  const pickImageFromGallery = async () => {
    // Solicitar permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        t.permissionRequired,
        t.galleryPermission
      );
      return;
    }

    // Abrir selector de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    // Solicitar permisos de cámara
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        t.permissionRequired,
        t.cameraPermission
      );
      return;
    }

    // Abrir cámara
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      t.changePhoto,
      '',
      [
        { text: t.takePhoto, onPress: takePhotoWithCamera },
        { text: t.chooseFromGallery, onPress: pickImageFromGallery },
        { text: t.cancel, style: 'cancel' },
      ]
    );
  };

  // Mostrar loading mientras se cargan los datos
  if (!isUserDataLoaded) {
    return (
      <ScreenWrapper showBack showMenu={false} showProfile={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper showBack showMenu={false} showProfile={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>{t.editProfile}</Text>

        {/* Sección de foto */}
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={[styles.avatar, { borderColor: colors.primary }]} />
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.primary, borderColor: colors.background }]}
              onPress={handleChangePhoto}
            >
              <Ionicons name="camera" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleChangePhoto}>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>{t.changePhoto}</Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <Card title={t.personalInfo}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t.fullName}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Tu nombre"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t.email}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder="tu@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t.phone}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                placeholder="999 888 7777"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t.address}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.textMuted}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder="Tu dirección"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </Card>

        {/* Sección de seguridad */}
        <Card title={t.security}>
          <TouchableOpacity style={styles.securityOption}>
            <View style={styles.securityLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.securityText, { color: colors.text }]}>{t.changePassword}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </Card>

        {/* Botones de acción */}
        <View style={styles.buttonsContainer}>
          <Button
            title={isSaving ? t.saving : t.saveChanges}
            variant="primary"
            size="large"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={isSaving}
          />

          <Button
            title={t.cancel}
            variant="outline"
            size="large"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  screenTitle: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  changePhotoText: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  buttonsContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  saveButton: {
    marginBottom: spacing.sm,
  },
  cancelButton: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
