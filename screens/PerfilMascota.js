import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView, Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context';

export default function PerfilMascota() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors, t, isDarkMode } = useApp();

    // Recibe la mascota enviada desde la pantalla anterior
    const mascota = route.params?.mascota;

    const [isEditable, setIsEditable] = useState(false);

    const [image, setImage] = useState(mascota?.image || null);
    const [nombre, setNombre] = useState(mascota?.nombre || "");
    const [raza, setRaza] = useState(mascota?.raza || "");
    const [edad, setEdad] = useState(mascota?.edad || "");
    const [peso, setPeso] = useState(mascota?.peso || "");
    const [especie] = useState(mascota?.especie || ""); // no editable

    // Estados para la cartilla de vacunas
    const [vacunas, setVacunas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [vacunaActual, setVacunaActual] = useState({ id: null, nombre: "", fechaAplicacion: "" });
    const [isEditingVacuna, setIsEditingVacuna] = useState(false);

    const vacunasStorageKey = `@vacunas_${mascota?.id}`;

    // Cargar vacunas al montar el componente
    useEffect(() => {
        cargarVacunas();
    }, []);

    const cargarVacunas = async () => {
        try {
            const json = await AsyncStorage.getItem(vacunasStorageKey);
            if (json) {
                setVacunas(JSON.parse(json));
            }
        } catch (e) {
            console.log("Error cargando vacunas:", e);
        }
    };

    const guardarVacunas = async (nuevasVacunas) => {
        try {
            await AsyncStorage.setItem(vacunasStorageKey, JSON.stringify(nuevasVacunas));
            setVacunas(nuevasVacunas);
        } catch (e) {
            console.log("Error guardando vacunas:", e);
        }
    };

    const abrirModalAgregar = () => {
        setVacunaActual({ id: null, nombre: "", fechaAplicacion: "" });
        setIsEditingVacuna(false);
        setModalVisible(true);
    };

    const abrirModalEditar = (vacuna) => {
        setVacunaActual(vacuna);
        setIsEditingVacuna(true);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setVacunaActual({ id: null, nombre: "", fechaAplicacion: "" });
    };

    const guardarVacuna = async () => {
        if (!vacunaActual.nombre.trim() || !vacunaActual.fechaAplicacion.trim()) {
            Alert.alert("Error", "Por favor completa todos los campos.");
            return;
        }

        let nuevasVacunas;
        if (isEditingVacuna) {
            nuevasVacunas = vacunas.map(v => v.id === vacunaActual.id ? vacunaActual : v);
        } else {
            const nuevaVacuna = {
                ...vacunaActual,
                id: Date.now(),
            };
            nuevasVacunas = [nuevaVacuna, ...vacunas];
        }

        await guardarVacunas(nuevasVacunas);
        cerrarModal();
        Alert.alert("✔", isEditingVacuna ? "Vacuna actualizada" : "Vacuna agregada");
    };

    const eliminarVacuna = (id) => {
        Alert.alert(
            "Eliminar vacuna",
            "¿Estás seguro de que deseas eliminar esta vacuna?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        const nuevasVacunas = vacunas.filter(v => v.id !== id);
                        await guardarVacunas(nuevasVacunas);
                    }
                }
            ]
        );
    };

    const pickImage = async () => {
        if (!isEditable) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const guardarCambios = async () => {
        try {
            // 1. Crear objeto actualizado
            const mascotaEditada = {
                ...mascota,   // mantiene ID original
                nombre,
                raza,
                edad,
                peso,
                image,
                especie,
            };

            // 2. Traer lista completa @mascotas
            const raw = await AsyncStorage.getItem("@mascotas");
            let lista = raw ? JSON.parse(raw) : [];

            // 3. Reemplazar mascota por ID
            const actualizadas = lista.map(m =>
                m.id === mascota.id ? mascotaEditada : m
            );

            // 4. Guardar lista completa actualizada
            await AsyncStorage.setItem("@mascotas", JSON.stringify(actualizadas));

            // 5. Mostrar alerta
            Alert.alert("Cambios guardados", "La información ha sido actualizada.");

            // 6. Salir de modo edición
            setIsEditable(false);

            // 7. Volver a la lista de mascotas
            navigation.goBack();

        } catch (error) {
            Alert.alert("Error", "No se pudieron guardar los cambios.");
            console.log(error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <ScrollView
                contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
                keyboardShouldPersistTaps="handled"
            >

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Perfil de Mascota</Text>
                    <TouchableOpacity onPress={() => setIsEditable(!isEditable)}>
                        <Ionicons
                            name={isEditable ? "close" : "create-outline"}
                            size={28}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>

                {/*TABS DE NAVEGACION*/}
                <View style={[styles.tabsContainer, { borderColor: colors.border }]}>

                    <TouchableOpacity
                        style={
                            styles.tabButtonS}
                        onPress={() =>
                            navigation.navigate("PerfilMascotaStack", {
                                screen: "Salud",
                                params: { mascotaId: mascota.id }
                            })
                        }
                    >
                        <Text style={[styles.tabText, { color: colors.text }]}> Salud</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabButtonA}
                        onPress={() =>
                            navigation.navigate("PerfilMascotaStack", {
                                screen: "Actividades",
                                params: { mascotaId: mascota.id }
                            })
                        }
                    >
                        <Text style={[styles.tabText, { color: colors.text }]}>Actividades</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabButtonAl}
                        onPress={() =>
                            navigation.navigate("PerfilMascotaStack", {
                                screen: "Alimentacion",
                                params: { mascotaId: mascota.id }
                            })
                        }
                    >
                        <Text style={[styles.tabText, { color: colors.text }]}>Alimentación</Text>
                    </TouchableOpacity>
                </View>

                {/* FOTO */}
                <TouchableOpacity onPress={pickImage} disabled={!isEditable}>
                    <Image
                        source={
                            image
                                ? { uri: image }
                                : <Ionicons name="paw-outline" size={70} color="#C0C0C0" />
                        }
                        style={styles.petImage}
                    />
                </TouchableOpacity>

                {/* FORMULARIO */}
                <View style={styles.form}>
                    <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabled, { borderColor: colors.border, color: colors.text, backgroundColor: isEditable ? colors.inputBackground : colors.card }]}
                        editable={isEditable}
                        value={nombre}
                        onChangeText={setNombre}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Raza</Text>
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabled, { borderColor: colors.border, color: colors.text, backgroundColor: isEditable ? colors.inputBackground : colors.card }]}
                        editable={isEditable}
                        value={raza}
                        onChangeText={setRaza}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Edad (años)</Text>
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabled, { borderColor: colors.border, color: colors.text, backgroundColor: isEditable ? colors.inputBackground : colors.card }]}
                        editable={isEditable}
                        value={edad}
                        keyboardType="numeric"
                        onChangeText={setEdad}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Peso (kg) </Text>
                    <TextInput
                        style={[styles.input, !isEditable && styles.disabled, { borderColor: colors.border, color: colors.text, backgroundColor: isEditable ? colors.inputBackground : colors.card }]}
                        editable={isEditable}
                        value={peso}
                        keyboardType="numeric"
                        onChangeText={setPeso}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Especie</Text>
                    <TextInput
                        style={[styles.input, styles.disabled, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
                        editable={false}
                        value={especie}
                    />
                </View>
                {isEditable && (
                    <TouchableOpacity onPress={guardarCambios} style={styles.btnSave}>
                        <Text style={styles.btnSaveText}>Guardar cambios</Text>
                    </TouchableOpacity>
                )}

                {/* CARTILLA DIGITAL DE VACUNAS */}
                <View style={[styles.cartillaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cartillaHeader}>
                        <View style={styles.cartillaTitleContainer}>
                            <MaterialCommunityIcons name="needle" size={24} color={colors.primary || "#4CAF50"} />
                            <Text style={[styles.cartillaTitle, { color: colors.text }]}>Cartilla de Vacunas</Text>
                        </View>
                        <TouchableOpacity onPress={abrirModalAgregar} style={[styles.addVacunaBtn, { backgroundColor: colors.primary || "#4CAF50" }]}>
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addVacunaBtnText}>Agregar</Text>
                        </TouchableOpacity>
                    </View>

                    {vacunas.length === 0 ? (
                        <View style={styles.emptyVacunas}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={50} color={colors.textMuted || "#999"} />
                            <Text style={[styles.emptyVacunasText, { color: colors.textMuted || "#999" }]}>
                                No hay vacunas registradas
                            </Text>
                            <Text style={[styles.emptyVacunasSubtext, { color: colors.textMuted || "#999" }]}>
                                Toca "Agregar" para registrar una vacuna
                            </Text>
                        </View>
                    ) : (
                        vacunas.map((vacuna) => (
                            <View key={vacuna.id} style={[styles.vacunaCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                <View style={styles.vacunaInfo}>
                                    <View style={styles.vacunaIconContainer}>
                                        <MaterialCommunityIcons name="paw" size={28} color={colors.primary || "#4CAF50"} />
                                    </View>
                                    <View style={styles.vacunaDetails}>
                                        <Text style={[styles.vacunaNombre, { color: colors.text }]}>{vacuna.nombre}</Text>
                                        <View style={styles.vacunaFechaContainer}>
                                            <Ionicons name="calendar-outline" size={14} color={colors.textMuted || "#999"} />
                                            <Text style={[styles.vacunaFecha, { color: colors.textMuted || "#999" }]}>
                                                {vacuna.fechaAplicacion}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.vacunaActions}>
                                    <TouchableOpacity onPress={() => abrirModalEditar(vacuna)} style={styles.vacunaActionBtn}>
                                        <Ionicons name="create-outline" size={22} color={colors.secondary || "#007AFF"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => eliminarVacuna(vacuna.id)} style={styles.vacunaActionBtn}>
                                        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* MODAL PARA AGREGAR/EDITAR VACUNA */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={cerrarModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    {isEditingVacuna ? "Editar Vacuna" : "Agregar Vacuna"}
                                </Text>
                                <TouchableOpacity onPress={cerrarModal}>
                                    <Ionicons name="close" size={28} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.modalLabel, { color: colors.text }]}>Nombre de la vacuna</Text>
                            <TextInput
                                style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground || "#fff" }]}
                                placeholder="Ej: Rabia, Parvovirus, Moquillo..."
                                placeholderTextColor={colors.textMuted || "#999"}
                                value={vacunaActual.nombre}
                                onChangeText={(text) => setVacunaActual({ ...vacunaActual, nombre: text })}
                            />

                            <Text style={[styles.modalLabel, { color: colors.text }]}>Fecha de aplicación</Text>
                            <TextInput
                                style={[styles.modalInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.inputBackground || "#fff" }]}
                                placeholder="DD/MM/AAAA"
                                placeholderTextColor={colors.textMuted || "#999"}
                                value={vacunaActual.fechaAplicacion}
                                onChangeText={(text) => setVacunaActual({ ...vacunaActual, fechaAplicacion: text })}
                                keyboardType="default"
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity onPress={cerrarModal} style={[styles.modalBtnCancel, { borderColor: colors.border }]}>
                                    <Text style={[styles.modalBtnCancelText, { color: colors.text }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={guardarVacuna} style={[styles.modalBtnSave, { backgroundColor: colors.primary || "#4CAF50" }]}>
                                    <Text style={styles.modalBtnSaveText}>
                                        {isEditingVacuna ? "Actualizar" : "Guardar"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#fff" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 500,
    },
    petImage: {
        width: 150,
        height: 150,
        borderRadius: 100,
        alignSelf: "center",
        marginVertical: 20,
        borderColor: "#333",
        borderWidth: 0.5,
    },

    form: { marginBottom: 20 },

    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
    },

    disabled: {
        backgroundColor: "#eee",
    },


    tabsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },

    tabButtonS: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#4BCF5C",
    },
    tabButtonA: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#00ccffff"
    },
    tabButtonAl: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#ffdd01ff"
    },

    tabText: {
        fontSize: 16,
        color: "#333",
    },

    btnSave: {
        backgroundColor: "#4BCF5C",
        alignItems: "center",
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    btnSaveText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },

    // Estilos para la Cartilla de Vacunas
    cartillaContainer: {
        marginTop: 20,
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 30,
    },
    cartillaHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    cartillaTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    cartillaTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 8,
    },
    addVacunaBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    addVacunaBtnText: {
        color: "#fff",
        fontWeight: "600",
        marginLeft: 4,
        fontSize: 14,
    },
    emptyVacunas: {
        alignItems: "center",
        paddingVertical: 30,
    },
    emptyVacunasText: {
        fontSize: 16,
        marginTop: 10,
        fontWeight: "500",
    },
    emptyVacunasSubtext: {
        fontSize: 13,
        marginTop: 5,
    },
    vacunaCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    vacunaInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    vacunaIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: "rgba(76, 175, 80, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    vacunaDetails: {
        flex: 1,
    },
    vacunaNombre: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    vacunaFechaContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    vacunaFecha: {
        fontSize: 13,
        marginLeft: 5,
    },
    vacunaActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    vacunaActionBtn: {
        padding: 8,
        marginLeft: 5,
    },

    // Estilos para el Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        padding: 20,
        borderRadius: 15,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 10,
    },
    modalInput: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 25,
    },
    modalBtnCancel: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        marginRight: 10,
    },
    modalBtnCancelText: {
        fontWeight: "600",
        fontSize: 15,
    },
    modalBtnSave: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    modalBtnSaveText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 15,
    },
});




