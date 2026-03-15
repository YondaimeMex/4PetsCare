import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import NotificationService from './Notificaciones';

export async function saveMascotaToDB(mascota) {
    try {
        const raw = await AsyncStorage.getItem('@mascotas');
        const actuales = raw ? JSON.parse(raw) : [];

        const nueva = { id: uuidv4(), ...mascota };
        const updated = [nueva, ...actuales];

        await AsyncStorage.setItem('@mascotas', JSON.stringify(updated));
        return { success: true, data: nueva };
    } catch (err) {
        console.error('saveMascotaToDB - AsyncStorage error:', err);
        return { success: false };
    }
}

function Field({ label, icon, value, onChangeText, placeholder, keyboardType, theme }) {
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
                />
            </View>
        </View>
    );
}

export default function RegistroMascota() {
    const navigation = useNavigation();
    const { colors, t } = useApp();

    const [nombreMascota, setNombreMascota] = useState('');
    const [especie, setEspecie] = useState('');
    const [raza, setRaza] = useState('');
    const [edad, setEdad] = useState('');
    const [peso, setPeso] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [imageKey, setImageKey] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const especies = useMemo(() => ([
        { key: 'domestico', label: t.speciesDomestic || 'Domestico (Perro, Gato, etc.)' },
        { key: 'ave', label: t.speciesBird || 'Ave (Perico, Loro, etc.)' },
        { key: 'acuatico', label: t.speciesAquatic || 'Acuatico (Betta, Goldfish, etc.)' },
        { key: 'reptiles', label: t.speciesReptile || 'Reptiles (Tortuga, Iguana, etc.)' },
    ]), [t]);

    const selectEspecie = (option) => {
        setEspecie(option.label);
        setIsDropdownOpen(false);
    };

    const pickImageFromLibrary = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(t.permissionDenied || 'Permiso denegado', t.galleryPermissionPet || 'Necesitamos permiso para acceder a la galeria.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            const uri =
                (result.assets && result.assets[0] && result.assets[0].uri) ||
                result.uri ||
                (result.cancelled === false && result.uri) ||
                null;

            if (uri) {
                setImageUri(uri);
                setImageKey(Date.now());
            }
        } catch (err) {
            console.error('pickImageFromLibrary error:', err);
            Alert.alert(t.error || 'Error', t.selectImageError || 'No se pudo seleccionar la imagen.');
        }
    };

    const takePhotoWithCamera = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(t.permissionDenied || 'Permiso denegado', t.cameraPermissionPet || 'Necesitamos permiso para usar la camara.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            const uri =
                (result.assets && result.assets[0] && result.assets[0].uri) ||
                result.uri ||
                (result.cancelled === false && result.uri) ||
                null;

            if (uri) {
                setImageUri(uri);
                setImageKey(Date.now());
            }
        } catch (err) {
            console.error('takePhotoWithCamera error:', err);
            Alert.alert(t.error || 'Error', t.takePhotoError || 'No se pudo tomar la foto.');
        }
    };

    const removeImage = () => {
        setImageUri(null);
        setImageKey(null);
    };

    const handleSave = async () => {
        if (!nombreMascota?.trim() || !especie?.trim()) {
            Alert.alert(t.missingFieldsTitle || 'Campos faltantes', t.missingPetNameSpecies || 'Ingresa el nombre y selecciona la especie de tu mascota.');
            return;
        }

        const mascotaData = {
            nombre: nombreMascota.trim(),
            especie: especie.trim(),
            raza: raza.trim(),
            edad: edad.trim(),
            peso: peso.trim(),
            image: imageUri || null,
            imageKey: imageKey || null,
        };

        setLoading(true);
        try {
            const result = await saveMascotaToDB(mascotaData);

            if (result && result.success) {
                Alert.alert(t.petSavedTitle || 'Guardado', `${mascotaData.nombre}: ${t.petRegisteredSuccess || 'Mascota registrada con exito'}`);
                await NotificationService.saveNotification(
                    `¡Felicidades! Se ha guardado con éxito ${mascotaData.nombre} (${mascotaData.especie}).`
                );

                setNombreMascota('');
                setEspecie('');
                setRaza('');
                setEdad('');
                setPeso('');
                setImageUri(null);
                setImageKey(null);

                navigation.replace('Mascotas');
            } else {
                Alert.alert(t.saveErrorTitle || 'Error al guardar', t.localSaveError || 'No se pudo guardar localmente');
            }
        } catch (error) {
            console.error('Error guardando mascota:', error);
            Alert.alert(t.error || 'Error', t.genericSaveError || 'Ocurrio un error al guardar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper showBack>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroTopRow}>
                            <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="paw-outline" size={20} color="#FFFFFF" />
                            </View>
                            <View style={[styles.heroPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={styles.heroPillText}>{t.newPet || 'Nueva mascota'}</Text>
                            </View>
                        </View>
                        <Text style={styles.heroKicker}>REGISTRO</Text>
                        <Text style={styles.heroTitle}>{t.petRecordTitle || 'Ficha de mascota'}</Text>
                        <Text style={styles.heroSubtitle}>{t.petRecordSubtitle || 'Completa los datos principales para empezar su seguimiento.'}</Text>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Field
                            label={t.petName || 'Nombre'}
                            icon="heart-outline"
                            value={nombreMascota}
                            onChangeText={setNombreMascota}
                            placeholder={t.petNameExample || 'Ej. Toby'}
                            theme={theme}
                        />

                        <View style={styles.fieldWrap}>
                            <Text style={[styles.label, { color: theme.muted }]}>{t.speciesLabel || 'Especie'}</Text>
                            <TouchableOpacity
                                style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                                onPress={() => setIsDropdownOpen((prev) => !prev)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="list-outline" size={18} color={theme.brandSoft} style={styles.leftIcon} />
                                <Text style={[styles.dropdownValue, { color: especie ? theme.text : theme.muted }]}>
                                    {especie || t.selectSpecies || 'Selecciona una especie'}
                                </Text>
                                <MaterialIcons
                                    name={isDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                    size={22}
                                    color={theme.muted}
                                />
                            </TouchableOpacity>

                            {isDropdownOpen ? (
                                <View style={[styles.dropdownList, { borderColor: theme.border, backgroundColor: theme.card }]}>
                                    {especies.map((option) => (
                                        <TouchableOpacity
                                            key={option.key}
                                            style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                            onPress={() => selectEspecie(option)}
                                        >
                                            <Text style={[styles.dropdownText, { color: theme.text }]}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : null}
                        </View>

                        <Field
                            label={t.breedLabel || 'Raza'}
                            icon="ribbon-outline"
                            value={raza}
                            onChangeText={setRaza}
                            placeholder={t.breedExample || 'Ej. Golden Retriever'}
                            theme={theme}
                        />

                        <View style={styles.row2}>
                            <View style={{ flex: 1 }}>
                                <Field
                                    label={t.ageLabel || 'Edad'}
                                    icon="time-outline"
                                    value={edad}
                                    onChangeText={setEdad}
                                    placeholder={t.ageExample || 'Ej. 5'}
                                    keyboardType="numeric"
                                    theme={theme}
                                />
                            </View>
                            <View style={{ width: 10 }} />
                            <View style={{ flex: 1 }}>
                                <Field
                                    label={`${t.weight || 'Peso'} (kg)`}
                                    icon="barbell-outline"
                                    value={peso}
                                    onChangeText={setPeso}
                                    placeholder={t.weightExample || 'Ej. 30'}
                                    keyboardType="numeric"
                                    theme={theme}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.imageCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.muted }]}>{t.petPhotoLabel || 'Foto de tu mascota'}</Text>

                        {imageUri ? (
                            <>
                                <Image key={String(imageKey)} source={{ uri: imageUri }} style={styles.previewImage} />
                                <View style={styles.imageActionsRow}>
                                    <TouchableOpacity
                                        style={[styles.secondarySmallBtn, { borderColor: theme.border }]}
                                        onPress={pickImageFromLibrary}
                                    >
                                        <Text style={[styles.secondarySmallBtnText, { color: theme.text }]}>{t.change || 'Cambiar'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.secondarySmallBtn, { borderColor: '#E53935' }]}
                                        onPress={removeImage}
                                    >
                                        <Text style={[styles.secondarySmallBtnText, { color: '#E53935' }]}>{t.delete || 'Eliminar'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={[styles.placeholderImage, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
                                    <Ionicons name="image-outline" size={40} color={theme.muted} />
                                </View>
                                <View style={styles.imageActionsRow}>
                                    <TouchableOpacity
                                        style={[styles.primarySmallBtn, { backgroundColor: theme.brandSoft }]}
                                        onPress={pickImageFromLibrary}
                                    >
                                        <Text style={styles.primarySmallBtnText}>{t.gallery || 'Galeria'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.primarySmallBtn, { backgroundColor: theme.accent }]}
                                        onPress={takePhotoWithCamera}
                                    >
                                        <Text style={styles.primarySmallBtnText}>{t.camera || 'Camara'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.brand }, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>{t.savingProgress || 'Guardando...'}</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>{t.savePet || 'Guardar mascota'}</Text>
                            </>
                        )}
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
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    heroIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroPill: {
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    heroPillText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
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
    formCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 12,
    },
    imageCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 12,
        alignItems: 'center',
    },
    fieldWrap: {
        marginBottom: 10,
    },
    row2: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
    dropdownValue: {
        flex: 1,
        fontSize: 14,
    },
    dropdownList: {
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 6,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    dropdownText: {
        fontSize: 13,
    },
    placeholderImage: {
        width: 170,
        height: 130,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImage: {
        width: 170,
        height: 130,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    imageActionsRow: {
        marginTop: 10,
        flexDirection: 'row',
        gap: 8,
    },
    primarySmallBtn: {
        borderRadius: 10,
        minHeight: 36,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primarySmallBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    secondarySmallBtn: {
        borderRadius: 10,
        minHeight: 36,
        borderWidth: 1,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondarySmallBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    saveButton: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});