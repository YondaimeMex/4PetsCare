import React, { useMemo, useState, useEffect } from 'react';
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
import { ScreenWrapper } from '../components';
import { useApp } from '../context';

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
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [avatar, setAvatar] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

    useEffect(() => {
        if (isUserDataLoaded && userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
            });
            setAvatar(userData.avatar || 'https://i.pravatar.cc/300');
        }
    }, [isUserDataLoaded, userData]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert(t.error, t.nameRequired);
            return;
        }
        if (!formData.email.trim()) {
            Alert.alert(t.error, t.emailRequired);
            return;
        }

        setIsSaving(true);
        const success = await updateUserData({ ...formData, avatar });
        setIsSaving(false);

        if (success) {
            Alert.alert(t.success, t.profileUpdated, [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } else {
            Alert.alert(t.error, t.saveError);
        }
    };

    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t.permissionRequired, t.galleryPermission);
            return;
        }

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
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t.permissionRequired, t.cameraPermission);
            return;
        }

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
        Alert.alert(t.changePhoto, '', [
            { text: t.takePhoto, onPress: takePhotoWithCamera },
            { text: t.chooseFromGallery, onPress: pickImageFromGallery },
            { text: t.cancel, style: 'cancel' },
        ]);
    };

    if (!isUserDataLoaded) {
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
                        <Text style={styles.heroKicker}>PERFIL</Text>
                        <Text style={styles.heroTitle}>{t.editProfile}</Text>
                        <Text style={styles.heroSubtitle}>Actualiza tus datos personales y foto de perfil.</Text>
                    </View>

                    <View style={[styles.avatarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.avatarWrap}>
                            <Image source={{ uri: avatar }} style={[styles.avatar, { borderColor: theme.brandSoft }]} />
                            <TouchableOpacity
                                style={[styles.cameraButton, { backgroundColor: theme.accent }]}
                                onPress={handleChangePhoto}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={handleChangePhoto}>
                            <Text style={[styles.changePhotoText, { color: theme.brandSoft }]}>{t.changePhoto}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <ProfileField
                            label={t.fullName}
                            icon="person-outline"
                            value={formData.name}
                            onChangeText={(value) => handleChange('name', value)}
                            placeholder="Tu nombre"
                            theme={theme}
                        />

                        <ProfileField
                            label={t.email}
                            icon="mail-outline"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            placeholder="tu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            theme={theme}
                        />

                        <ProfileField
                            label={t.phone}
                            icon="call-outline"
                            value={formData.phone}
                            onChangeText={(value) => handleChange('phone', value)}
                            placeholder="999 888 7777"
                            keyboardType="phone-pad"
                            theme={theme}
                        />

                        <ProfileField
                            label={t.address}
                            icon="location-outline"
                            value={formData.address}
                            onChangeText={(value) => handleChange('address', value)}
                            placeholder="Tu dirección"
                            theme={theme}
                        />
                    </View>

                    <View style={[styles.securityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <TouchableOpacity style={styles.securityRow} activeOpacity={0.8}>
                            <View style={styles.securityLeft}>
                                <View style={[styles.securityIconWrap, { backgroundColor: `${theme.brand}14` }]}>
                                    <Ionicons name="lock-closed-outline" size={18} color={theme.brand} />
                                </View>
                                <Text style={[styles.securityText, { color: theme.text }]}>{t.changePassword}</Text>
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
                                <Text style={styles.saveBtnText}>{t.saveChanges}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={isSaving}>
                        <Text style={[styles.cancelText, { color: theme.muted }]}>{t.cancel}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 44,
    },
    heroCard: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 22,
        marginBottom: 12,
    },
    heroKicker: {
        color: 'rgba(255,255,255,0.74)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.79)',
        fontSize: 13,
        lineHeight: 18,
        marginTop: 6,
    },
    avatarCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarWrap: {
        position: 'relative',
    },
    avatar: {
        width: 104,
        height: 104,
        borderRadius: 52,
        borderWidth: 3,
    },
    cameraButton: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changePhotoText: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: '700',
    },
    formCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 12,
    },
    fieldWrap: {
        marginBottom: 10,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 6,
    },
    inputRow: {
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    leftIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 11,
    },
    securityCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 12,
    },
    securityRow: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    securityLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    securityIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    securityText: {
        fontSize: 14,
        fontWeight: '600',
    },
    saveBtn: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    cancelBtn: {
        marginTop: 10,
        alignItems: 'center',
        paddingVertical: 6,
    },
    cancelText: {
        fontSize: 13,
        fontWeight: '600',
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});