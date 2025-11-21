import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { TextInput, Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";


const customTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: "#8fa1b4ff",
        outline: "#D1D1D1",
        background: "#FAFAFA",
    },
    roundness: 12,
};

export default function PetProfileScreen() {
    const navigation = useNavigation();
    const [isEditable, setIsEditable] = useState(false);
    const [image, setImage] = useState(null);

    const [nombre, setNombre] = useState("Firulais");
    const [raza, setRaza] = useState("Labrador");
    const [edad, setEdad] = useState("3 años");
    const [peso, setPeso] = useState("25 kg");

    const toggleEdit = () => setIsEditable(!isEditable);

    const handleSave = () => {
        setIsEditable(false);
        Alert.alert(" Cambios guardados", "Los datos de la mascota se actualizaron correctamente.");
    };

    // Elegir o tomar foto
    const pickImage = async () => {
        // Pedir permisos
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permiso denegado", "Necesitas otorgar permiso para acceder a la cámara.");
            return;
        }

        // Tomar o elegir foto
        Alert.alert(
            "Foto de mascota",
            "¿Qué deseas hacer?",
            [
                {
                    text: "Tomar foto",
                    onPress: async () => {
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) setImage(result.assets[0].uri);
                    },
                },
                {
                    text: "Elegir de galería",
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) setImage(result.assets[0].uri);
                    },
                },
                { text: "Cancelar", style: "cancel" },
            ],
            { cancelable: true }
        );
    };

    return (
        <PaperProvider theme={customTheme}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Encabezado */}
                <View style={styles.header}>
                    {/*<TouchableOpacity>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>*/}

                    <Text style={styles.title}>Perfil de Mascota</Text>

                    <TouchableOpacity onPress={isEditable ? handleSave : toggleEdit}>
                        <Ionicons
                            name={isEditable ? "checkmark-outline" : "create-outline"}
                            size={24}
                            color={isEditable ? "#007700ff" : "black"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Salud")}>
                        <Text>Salud</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Actividades")}>
                        <Text>Actividades</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() =>navigation.navigate("Alimentacion")}>
                        <Text>Alimentación</Text>
                    </TouchableOpacity>
                </View>

                {/* Imagen de perfil */}
                <View style={styles.profileImageContainer}>
                    <View style={styles.profileCircle}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <Ionicons name="person-outline" size={70} color="#C0C0C0" />
                        )}

                        {/* Botón cámara */}
                        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={18} color="#030303ff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.petName}>{nombre}</Text>
                </View>

                {/* Info general */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Información general</Text>

                    <TextInput
                        label="Nombre"
                        value={nombre}
                        onChangeText={setNombre}
                        mode="outlined"
                        editable={isEditable}
                        style={styles.input}
                    />

                    <TextInput
                        label="Raza"
                        value={raza}
                        onChangeText={setRaza}
                        mode="outlined"
                        editable={isEditable}
                        style={styles.input}
                    />

                    <TextInput
                        label="Edad"
                        value={edad}
                        onChangeText={setEdad}
                        mode="outlined"
                        editable={isEditable}
                        style={styles.input}
                    />

                    <TextInput
                        label="Peso"
                        value={peso}
                        onChangeText={setPeso}
                        mode="outlined"
                        editable={isEditable}
                        style={styles.input}
                    />

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: isEditable ? "black" : "#CCC" },
                        ]}
                        disabled={!isEditable}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>
                            {isEditable ? "Guardar cambios" : ""}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#FAFAFA",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 25,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 15,
    },
    tabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    tab: {
        borderWidth: 1,
        borderColor: "#D1D1D1",
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
    },
    profileImageContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    profileCircle: {
        width: 130,
        height: 130,
        borderRadius: 60,
        borderWidth: 1,
        borderColor: "#DDD",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: "#F5F5F5",

    },
    profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: 60,
    },
    cameraButton: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "#fefefeff",
        borderRadius: 15,
        padding: 5,
        elevation: 3,
    },
    petName: {
        marginTop: 10,
        color: "#555",
        fontSize: 18,
        fontWeight: "500",
    },
    infoSection: {
        borderTopWidth: 1,
        borderTopColor: "#EEE",
        paddingTop: 20,
    },
    sectionTitle: {
        fontWeight: "600",
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    saveButton: {
        borderRadius: 25,
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});


