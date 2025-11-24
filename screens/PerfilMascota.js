import React, { useState } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PerfilMascota() {
    const navigation = useNavigation();
    const route = useRoute();

    // Recibe la mascota enviada desde la pantalla anterior
    const mascota = route.params?.mascota;

    const [isEditable, setIsEditable] = useState(false);

    const [image, setImage] = useState(mascota?.image || null);
    const [nombre, setNombre] = useState(mascota?.nombre || "");
    const [raza, setRaza] = useState(mascota?.raza || "");
    const [edad, setEdad] = useState(mascota?.edad || "");
    const [peso, setPeso] = useState(mascota?.peso || "");
    const [especie] = useState(mascota?.especie || ""); // no editable

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
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>Perfil de Mascota</Text>
                    <TouchableOpacity onPress={() => setIsEditable(!isEditable)}>
                        <Ionicons
                            name={isEditable ? "close" : "create-outline"}
                            size={28}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>

                {/*TABS DE NAVEGACION*/}
                <View style={styles.tabsContainer}>

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
                        <Text style={styles.tabText}> Salud</Text>
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
                    <Text style={styles.tabText}>Actividades</Text>
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
                    <Text style={styles.tabText}>Alimentación</Text>
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
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                    style={[styles.input, !isEditable && styles.disabled]}
                    editable={isEditable}
                    value={nombre}
                    onChangeText={setNombre}
                />

                <Text style={styles.label}>Raza</Text>
                <TextInput
                    style={[styles.input, !isEditable && styles.disabled]}
                    editable={isEditable}
                    value={raza}
                    onChangeText={setRaza}
                />

                <Text style={styles.label}>Edad (años)</Text>
                <TextInput
                    style={[styles.input, !isEditable && styles.disabled]}
                    editable={isEditable}
                    value={edad}
                    keyboardType="numeric"
                    onChangeText={setEdad}
                />

                <Text style={styles.label}>Peso (kg) </Text>
                <TextInput
                    style={[styles.input, !isEditable && styles.disabled]}
                    editable={isEditable}
                    value={peso}
                    keyboardType="numeric"
                    onChangeText={setPeso}
                />

                <Text style={styles.label}>Especie</Text>
                <TextInput
                    style={[styles.input, styles.disabled]}
                    editable={false}
                    value={especie}
                />
            </View>
            {isEditable && (
                <TouchableOpacity onPress={guardarCambios} style={styles.btnSave}>
                    <Text style={styles.btnSaveText}>Guardar cambios</Text>
                </TouchableOpacity>
            )}

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
});




