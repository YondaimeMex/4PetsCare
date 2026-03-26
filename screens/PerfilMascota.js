import React, { useEffect, useMemo, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Image,
    StyleSheet, ScrollView, Alert, KeyboardAvoidingView,
    Platform, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';
import { supabase } from '../lib/Supabase';

function Field({ label, value, onChangeText, editable = true, keyboardType = 'default', theme }) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>{label}</Text>
            <TextInput
                style={[styles.fieldInput, {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: editable ? theme.bg : '#F0F3F1',
                }]}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                keyboardType={keyboardType}
            />
        </View>
    );
}

export default function PerfilMascota() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors, t } = useApp();
    const mascota = route.params?.mascota || {};

    const [isEditable, setIsEditable] = useState(false);
    const [image, setImage] = useState(mascota?.foto_url || mascota?.image || null);
    const [nombre, setNombre] = useState(mascota?.nombre || '');
    const [raza, setRaza] = useState(mascota?.raza || '');
    const [edad, setEdad] = useState(mascota?.edad || '');
    const [peso, setPeso] = useState(mascota?.peso || '');
    const [especie] = useState(mascota?.especie || '');

    const [vacunas, setVacunas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [vacunaActual, setVacunaActual] = useState({ id: null, nombre_vacuna: '', fechaAplicacion: '', descripcion: '' });
    const [isEditingVacuna, setIsEditingVacuna] = useState(false);

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        accent: colors?.accent || '#FF8A65',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
    }), [colors]);

    useEffect(() => { cargarVacunas(); }, []);

    // ─── Vacunas ──────────────────────────────────────────────
    const cargarVacunas = async () => {
        if (!mascota?.id) return;
        try {
            const { data, error } = await supabase
                .from('vacunas')
                .select('*')
                .eq('mascota_id', mascota.id)
                .order('fecha_aplicacion', { ascending: false });

            if (error) { console.error('cargarVacunas error:', error); return; }
            setVacunas(data || []);
        } catch (err) {
            console.error('cargarVacunas exception:', err);
        }
    };

    const abrirModalAgregar = () => {
        setVacunaActual({ id: null, nombre_vacuna: '', fechaAplicacion: '', descripcion: '' });
        setIsEditingVacuna(false);
        setModalVisible(true);
    };

    const abrirModalEditar = (vacuna) => {
        setVacunaActual({
            id: vacuna.id,
            nombre_vacuna: vacuna.nombre_vacuna || vacuna.nombre || '',
            fechaAplicacion: vacuna.fecha_aplicacion || '',
            descripcion: vacuna.descripcion || '',
        });
        setIsEditingVacuna(true);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setVacunaActual({ id: null, nombre_vacuna: '', fechaAplicacion: '', descripcion: '' });
    };

    const guardarVacuna = async () => {
        if (!vacunaActual.nombre_vacuna.trim() || !vacunaActual.fechaAplicacion.trim()) {
            Alert.alert(t.error || 'Error', t.completeAllFieldsShort || 'Completa todos los campos.');
            return;
        }

        try {
            if (isEditingVacuna) {
                const { error } = await supabase
                    .from('vacunas')
                    .update({
                        nombre_vacuna: vacunaActual.nombre_vacuna.trim(),
                        fecha_aplicacion: vacunaActual.fechaAplicacion.trim(),
                        descripcion: vacunaActual.descripcion.trim() || null,
                    })
                    .eq('id', vacunaActual.id);

                if (error) { console.error('update vacuna error:', error); throw error; }
            } else {
                const { error } = await supabase
                    .from('vacunas')
                    .insert({
                        mascota_id: mascota.id,
                        nombre_vacuna: vacunaActual.nombre_vacuna.trim(),
                        fecha_aplicacion: vacunaActual.fechaAplicacion.trim(),
                        descripcion: vacunaActual.descripcion.trim() || null,
                    });

                if (error) { console.error('insert vacuna error:', error); throw error; }
            }

            await cargarVacunas();
            cerrarModal();
            Alert.alert(t.ready || 'Listo', isEditingVacuna
                ? (t.vaccineUpdatedShort || 'Vacuna actualizada.')
                : (t.vaccineAddedShort || 'Vacuna agregada.'));
        } catch (err) {
            Alert.alert(t.error || 'Error', t.saveChangesError || 'No se pudieron guardar los cambios.');
        }
    };

    const eliminarVacuna = (id) => {
        Alert.alert(t.deleteVaccineTitle || 'Eliminar vacuna', t.irreversibleAction || 'Esta accion no se puede deshacer.', [
            { text: t.cancel || 'Cancelar', style: 'cancel' },
            {
                text: t.delete || 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const { error } = await supabase.from('vacunas').delete().eq('id', id);
                        if (error) throw error;
                        await cargarVacunas();
                    } catch {
                        Alert.alert(t.error || 'Error', t.saveChangesError || 'No se pudo eliminar.');
                    }
                },
            },
        ]);
    };

    // ─── Mascota ──────────────────────────────────────────────
    const pickImage = async () => {
        if (!isEditable) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const guardarCambios = async () => {
        try {
            let foto_url = mascota.foto_url || null;

            // Subir imagen si cambió
            if (image && image !== mascota.foto_url && image !== mascota.image) {
                const { data: { user } } = await supabase.auth.getUser();
                const ext = image.split('.').pop() || 'jpg';
                const fileName = `${user.id}/${mascota.id}_${Date.now()}.${ext}`;
                const formDataImg = new FormData();
                formDataImg.append('file', { uri: image, name: fileName, type: `image/${ext}` });
                const { error: uploadError } = await supabase.storage
                    .from('mascotas')
                    .upload(fileName, formDataImg, { contentType: `image/${ext}`, upsert: true });
                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from('mascotas').getPublicUrl(fileName);
                    foto_url = urlData.publicUrl;
                }
            }

            const { error } = await supabase
                .from('mascotas')
                .update({ nombre, raza, edad, peso, foto_url })
                .eq('id', mascota.id);

            if (error) throw error;

            Alert.alert(t.savedTitle || 'Guardado', t.infoUpdated || 'La informacion fue actualizada.');
            setIsEditable(false);
            navigation.goBack();
        } catch (error) {
            console.error('guardarCambios error:', error);
            Alert.alert(t.error || 'Error', t.saveChangesError || 'No se pudieron guardar los cambios.');
        }
    };

    return (
        <ScreenWrapper showBack>
            <KeyboardAvoidingView
                style={[styles.root, { backgroundColor: theme.bg }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                    {/* ── Hero ── */}
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroGlowTop} />
                        <View style={styles.heroGlowBottom} />
                        <View style={styles.heroHeaderRow}>
                            <Text style={styles.heroKicker}>{t.petProfileTitle || 'Perfil de mascota'}</Text>
                            <TouchableOpacity
                                style={styles.editToggle}
                                onPress={() => setIsEditable((prev) => !prev)}
                                activeOpacity={0.9}
                            >
                                <Ionicons name={isEditable ? 'close' : 'create-outline'} size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.heroTitle}>{nombre || t.unnamed || 'Sin nombre'}</Text>
                        <Text style={styles.heroSubtitle}>{raza || t.undefinedBreed || 'Raza no definida'}</Text>
                        <View style={styles.pillRow}>
                            <View style={styles.heroPill}>
                                <MaterialCommunityIcons name="needle" size={14} color="#FFFFFF" />
                                <Text style={styles.heroPillText}>{vacunas.length} {t.vaccinesRegistered || 'vacunas registradas'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Tabs ── */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tabBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => navigation.navigate('PerfilMascotaStack', { screen: 'Salud', params: { mascotaId: mascota.id } })}
                        >
                            <Text style={[styles.tabText, { color: theme.text }]}>{t.health || 'Salud'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => navigation.navigate('PerfilMascotaStack', { screen: 'Actividades', params: { mascotaId: mascota.id } })}
                        >
                            <Text style={[styles.tabText, { color: theme.text }]}>{t.activities || 'Actividades'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => navigation.navigate('PerfilMascotaStack', { screen: 'Alimentacion', params: { mascotaId: mascota.id } })}
                        >
                            <Text style={[styles.tabText, { color: theme.text }]}>{t.feeding || 'Alimentacion'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Identidad ── */}
                    <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.identity || 'Identidad'}</Text>
                        <TouchableOpacity onPress={pickImage} disabled={!isEditable} activeOpacity={0.9}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.petImage} />
                            ) : (
                                <View style={[styles.petImagePlaceholder, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                                    <Ionicons name="paw-outline" size={52} color={theme.muted} />
                                    <Text style={[styles.photoHint, { color: theme.muted }]}>{t.addPhoto || 'Agregar foto'}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <Field label={t.petName || 'Nombre'} value={nombre} onChangeText={setNombre} editable={isEditable} theme={theme} />
                        <Field label={t.breedLabel || 'Raza'} value={raza} onChangeText={setRaza} editable={isEditable} theme={theme} />
                        <View style={styles.rowSplit}>
                            <View style={styles.colSplit}>
                                <Field label={t.ageLabel || 'Edad'} value={edad} onChangeText={setEdad} editable={isEditable} keyboardType="numeric" theme={theme} />
                            </View>
                            <View style={styles.colSplit}>
                                <Field label={`${t.weight || 'Peso'} (kg)`} value={peso} onChangeText={setPeso} editable={isEditable} keyboardType="numeric" theme={theme} />
                            </View>
                        </View>
                        <Field label={t.speciesLabel || 'Especie'} value={especie} editable={false} theme={theme} />
                        {isEditable && (
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.brand }]} onPress={guardarCambios} activeOpacity={0.9}>
                                <Text style={styles.saveBtnText}>{t.saveChanges || 'Guardar cambios'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Cartilla de vacunas ── */}
                    <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionHeaderTitleRow}>
                                <MaterialCommunityIcons name="needle" size={18} color={theme.brandSoft} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.vaccineRecordBook || 'Cartilla de vacunas'}</Text>
                            </View>
                            <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.brand }]} onPress={abrirModalAgregar} activeOpacity={0.9}>
                                <Ionicons name="add" size={16} color="#FFFFFF" />
                                <Text style={styles.addBtnText}>{t.add || 'Agregar'}</Text>
                            </TouchableOpacity>
                        </View>

                        {vacunas.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="clipboard-outline" size={26} color={theme.muted} />
                                <Text style={[styles.emptyText, { color: theme.muted }]}>{t.noVaccines || 'No hay vacunas registradas.'}</Text>
                            </View>
                        ) : (
                            vacunas.map((vacuna) => (
                                <View key={vacuna.id} style={[styles.vacunaCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                                    <View style={styles.vacunaMain}>
                                        <View style={[styles.vacunaIconWrap, { backgroundColor: '#EAF8EB' }]}>
                                            <Ionicons name="medkit-outline" size={16} color={theme.brandSoft} />
                                        </View>
                                        <View style={styles.vacunaInfo}>
                                            <Text style={[styles.vacunaNombre, { color: theme.text }]}>{vacuna.nombre_vacuna || vacuna.nombre || 'Vacuna'}</Text>
                                            {vacuna.descripcion ? (
                                                <Text style={[styles.vacunaFecha, { color: theme.muted }]}>{vacuna.descripcion}</Text>
                                            ) : null}
                                            <Text style={[styles.vacunaFecha, { color: theme.muted }]}>{vacuna.fecha_aplicacion}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.vacunaActions}>
                                        <TouchableOpacity onPress={() => abrirModalEditar(vacuna)} style={styles.iconBtn}>
                                            <Ionicons name="create-outline" size={18} color={theme.brandSoft} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => eliminarVacuna(vacuna.id)} style={styles.iconBtn}>
                                            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Modal vacuna ── */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={cerrarModal}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {isEditingVacuna ? (t.editVaccineModal || 'Editar vacuna') : (t.newVaccineModal || 'Nueva vacuna')}
                            </Text>
                            <TouchableOpacity onPress={cerrarModal}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.modalLabel, { color: theme.text }]}>{t.petName || 'Nombre'}</Text>
                        <TextInput
                            style={[styles.modalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
                            placeholder={t.rabiesExample || 'Ej: Rabia'}
                            placeholderTextColor={theme.muted}
                            value={vacunaActual.nombre_vacuna}
                            onChangeText={(text) => setVacunaActual({ ...vacunaActual, nombre_vacuna: text })}
                        />
                        <Text style={[styles.modalLabel, { color: theme.text }]}>{t.applicationDateLabel || 'Fecha de aplicacion'}</Text>
                        <Calendar
                            onDayPress={(day) => setVacunaActual({ ...vacunaActual, fechaAplicacion: day.dateString })}
                            markedDates={vacunaActual.fechaAplicacion ? {
                                [vacunaActual.fechaAplicacion]: { selected: true, selectedColor: theme.brand }
                            } : {}}
                            theme={{
                                backgroundColor: theme.bg,
                                calendarBackground: theme.bg,
                                textSectionTitleColor: theme.muted,
                                dayTextColor: theme.text,
                                monthTextColor: theme.text,
                                todayTextColor: theme.accent,
                                arrowColor: theme.brand,
                                textDisabledColor: theme.border,
                                textDayFontWeight: '500',
                            }}
                            style={{ borderRadius: 10, overflow: 'hidden' }}
                        />
                        {vacunaActual.fechaAplicacion ? (
                            <Text style={[styles.selectedDateText, { color: theme.brand }]}>
                                Fecha: {vacunaActual.fechaAplicacion}
                            </Text>
                        ) : null}
                        <Text style={[styles.modalLabel, { color: theme.text }]}>{'Descripción (opcional)'}</Text>
                        <TextInput
                            style={[styles.modalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.bg }]}
                            placeholder="Ej: Dosis anual, refuerzo..."
                            placeholderTextColor={theme.muted}
                            value={vacunaActual.descripcion}
                            onChangeText={(text) => setVacunaActual({ ...vacunaActual, descripcion: text })}
                            multiline
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtnGhost, { borderColor: theme.border }]} onPress={cerrarModal}>
                                <Text style={[styles.modalBtnGhostText, { color: theme.text }]}>{t.cancel || 'Cancelar'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtnPrimary, { backgroundColor: theme.brand }]} onPress={guardarVacuna}>
                                <Text style={styles.modalBtnPrimaryText}>{isEditingVacuna ? (t.update || 'Actualizar') : (t.save || 'Guardar')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    content: { padding: 16, paddingBottom: 28 },
    heroCard: { borderRadius: 20, padding: 16, overflow: 'hidden' },
    heroGlowTop: { position: 'absolute', right: -30, top: -36, width: 125, height: 125, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' },
    heroGlowBottom: { position: 'absolute', left: -32, bottom: -40, width: 115, height: 115, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.08)' },
    heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heroKicker: { color: '#CDE2D6', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    editToggle: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
    heroTitle: { marginTop: 8, color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
    heroSubtitle: { marginTop: 4, color: '#DCE9E2', fontSize: 14 },
    pillRow: { marginTop: 12 },
    heroPill: { alignSelf: 'flex-start', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
    heroPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    tabRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 8 },
    tabBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: '700' },
    sectionCard: { marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
    sectionTitle: { fontSize: 16, fontWeight: '800' },
    petImage: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
    petImagePlaceholder: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignSelf: 'center', marginTop: 12, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
    photoHint: { marginTop: 4, fontSize: 11, fontWeight: '600' },
    fieldWrap: { marginTop: 10 },
    fieldLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
    fieldInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontWeight: '500' },
    rowSplit: { flexDirection: 'row', gap: 8 },
    colSplit: { flex: 1 },
    saveBtn: { marginTop: 14, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
    addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
    emptyState: { marginTop: 12, alignItems: 'center', paddingVertical: 16 },
    emptyText: { marginTop: 8, fontSize: 13, fontWeight: '500' },
    vacunaCard: { marginTop: 10, borderRadius: 12, borderWidth: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    vacunaMain: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    vacunaIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    vacunaInfo: { flex: 1 },
    vacunaNombre: { fontSize: 14, fontWeight: '700' },
    vacunaFecha: { marginTop: 2, fontSize: 12, fontWeight: '500' },
    vacunaActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    iconBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.04)' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 18 },
    modalCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '800' },
    modalLabel: { marginTop: 12, marginBottom: 6, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    modalInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
    modalActions: { marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    modalBtnGhost: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    modalBtnGhostText: { fontSize: 13, fontWeight: '700' },
    modalBtnPrimary: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    modalBtnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
    selectedDateText: { marginTop: 6, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});