import React, { useMemo, useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, Image, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';
import { supabase } from '../lib/Supabase';

function ProfileField({ label, icon, value, onChangeText, placeholder, keyboardType, autoCapitalize, theme }) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
            <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Ionicons name={icon} size={18} color={theme.brandSoft} style={styles.leftIcon} />
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.muted}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                />
            </View>
        </View>
    );
}

export default function EditarPerfil() {
    const navigation = useNavigation();
    const { userData, updateUserData, isUserDataLoaded, colors, t } = useApp();

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        address: '',
    });
    const [avatar, setAvatar] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        accent: colors?.accent || '#FF7F5A',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
        inputBg: colors?.inputBackground || '#F6F8F4',
    }), [colors]);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('loadProfile error:', error);
            }

            if (data) {
                setFormData({
                    nombre: data.nombre || userData?.name || '',
                    email: data.email || user.email || '',
                    telefono: data.telefono || userData?.phone || '',
                    address: data.address || userData?.address || '',
                });
                setAvatar(data.foto_url || userData?.avatar || 'https://i.pravatar.cc/300');
            } else {
                // No existe aún, usar datos del contexto
                setFormData({
                    nombre: userData?.name || '',
                    email: user.email || userData?.email || '',
                    telefono: userData?.phone || '',
                    address: userData?.address || '',
                });
                setAvatar(userData?.avatar || 'https://i.pravatar.cc/300');
            }
        } catch (err) {
            console.error('loadProfile exception:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) {
            Alert.alert(t.error || 'Error', t.nameRequired || 'El nombre es requerido.');
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No autenticado');

            let foto_url = avatar;

            // Subir avatar si cambió y es una URI local
            if (avatar && !avatar.startsWith('http')) {
                const ext = avatar.split('.').pop() || 'jpg';
                const fileName = `avatars/${user.id}.${ext}`;
                const formDataAvatar = new FormData();
                formDataAvatar.append('file', { uri: avatar, name: fileName, type: `image/${ext}` });

                const { error: uploadError } = await supabase.storage
                    .from('mascotas')
                    .upload(fileName, formDataAvatar, { contentType: `image/${ext}`, upsert: true });

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('mascotas')
                        .getPublicUrl(fileName);
                    foto_url = urlData.publicUrl;
                }
            }

            // Upsert en tabla perfiles
            const { error } = await supabase
                .from('perfiles')
                .upsert({
                    id: user.id,
                    nombre: formData.nombre.trim(),
                    email: formData.email.trim(),
                    telefono: formData.telefono.trim(),
                    address: formData.address.trim(),
                    foto_url,
                });

            if (error) throw error;

            // También actualizar el contexto local
            await updateUserData({
                name: formData.nombre.trim(),
                email: formData.email.trim(),
                phone: formData.telefono.trim(),
                address: formData.address.trim(),
                avatar: foto_url,
            });

            setIsSaving(false);
            Alert.alert(t.success || 'Exito', t.profileUpdated || 'Perfil actualizado correctamente.', [
                { text: t.ok || 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            console.error('handleSave error:', err);
            setIsSaving(false);
            Alert.alert(t.error || 'Error', t.saveError || 'No se pudieron guardar los cambios.');
        }
    };

    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t.permissionRequired || 'Permiso requerido', t.galleryPermission || 'Necesitamos permiso para acceder a la galeria.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) setAvatar(result.assets[0].uri);
    };

    const takePhotoWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t.permissionRequired || 'Permiso requerido', t.cameraPermission || 'Necesitamos permiso para usar la camara.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) setAvatar(result.assets[0].uri);
    };

    const handleChangePhoto = () => {
        Alert.alert(t.changePhoto || 'Cambiar foto', '', [
            { text: t.takePhoto || 'Tomar foto', onPress: takePhotoWithCamera },
            { text: t.chooseFromGallery || 'Elegir de galeria', onPress: pickImageFromGallery },
            { text: t.cancel || 'Cancelar', style: 'cancel' },
        ]);
    };

    if (isLoading) {
        return (
            <ScreenWrapper showBack showMenu={false} showProfile={false}>
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={theme.brand} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper showBack showMenu={false} showProfile={false}>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <Text style={styles.heroKicker}>{t.profileKicker || 'PERFIL'}</Text>
                        <Text style={styles.heroTitle}>{t.editProfile || 'Editar perfil'}</Text>
                        <Text style={styles.heroSubtitle}>{t.editProfileSubtitle || 'Actualiza tus datos personales y foto de perfil.'}</Text>
                    </View>

                    {/* ── Avatar ── */}
                    <View style={[styles.avatarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.avatarWrap}>
                            <Image source={{ uri: avatar || 'https://i.pravatar.cc/300' }} style={[styles.avatar, { borderColor: theme.brandSoft }]} />
                            <TouchableOpacity
                                style={[styles.cameraButton, { backgroundColor: theme.accent }]}
                                onPress={handleChangePhoto}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={handleChangePhoto}>
                            <Text style={[styles.changePhotoText, { color: theme.brandSoft }]}>{t.changePhoto || 'Cambiar foto'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Formulario ── */}
                    <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <ProfileField
                            label={t.fullName || 'Nombre completo'}
                            icon="person-outline"
                            value={formData.nombre}
                            onChangeText={(value) => handleChange('nombre', value)}
                            placeholder={t.fullNamePlaceholder || 'Tu nombre'}
                            theme={theme}
                        />
                        <ProfileField
                            label={t.email || 'Correo'}
                            icon="mail-outline"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            placeholder="tu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            theme={theme}
                        />
                        <ProfileField
                            label={t.phone || 'Telefono'}
                            icon="call-outline"
                            value={formData.telefono}
                            onChangeText={(value) => handleChange('telefono', value)}
                            placeholder="999 888 7777"
                            keyboardType="phone-pad"
                            theme={theme}
                        />
                        <ProfileField
                            label={t.address || 'Direccion'}
                            icon="location-outline"
                            value={formData.address}
                            onChangeText={(value) => handleChange('address', value)}
                            placeholder={t.addressPlaceholder || 'Tu direccion'}
                            theme={theme}
                        />
                    </View>

                    {/* ── Seguridad ── */}
                    <View style={[styles.securityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <TouchableOpacity style={styles.securityRow} activeOpacity={0.8}>
                            <View style={styles.securityLeft}>
                                <View style={[styles.securityIconWrap, { backgroundColor: `${theme.brand}14` }]}>
                                    <Ionicons name="lock-closed-outline" size={18} color={theme.brand} />
                                </View>
                                <Text style={[styles.securityText, { color: theme.text }]}>{t.changePassword || 'Cambiar contrasena'}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.brand }, isSaving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.saveBtnText}>{t.saveChanges || 'Guardar cambios'}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={isSaving}>
                        <Text style={[styles.cancelText, { color: theme.muted }]}>{t.cancel || 'Cancelar'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 44 },
    heroCard: { borderRadius: 18, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22, marginBottom: 12 },
    heroKicker: { color: 'rgba(255,255,255,0.74)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
    heroSubtitle: { color: 'rgba(255,255,255,0.79)', fontSize: 13, lineHeight: 18, marginTop: 6 },
    avatarCard: { borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', marginBottom: 12 },
    avatarWrap: { position: 'relative' },
    avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 3 },
    cameraButton: { position: 'absolute', right: -2, bottom: -2, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    changePhotoText: { marginTop: 10, fontSize: 13, fontWeight: '700' },
    formCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
    fieldWrap: { marginBottom: 10 },
    label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
    inputRow: { minHeight: 48, borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    leftIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 14, paddingVertical: 11 },
    securityCard: { borderRadius: 16, borderWidth: 1, marginBottom: 12, paddingHorizontal: 12 },
    securityRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    securityLeft: { flexDirection: 'row', alignItems: 'center' },
    securityIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    securityText: { fontSize: 14, fontWeight: '600' },
    saveBtn: { minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
    saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    cancelBtn: { marginTop: 10, alignItems: 'center', paddingVertical: 6 },
    cancelText: { fontSize: 13, fontWeight: '600' },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});