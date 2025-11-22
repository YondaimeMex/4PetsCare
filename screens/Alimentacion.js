import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Platform, Alert, KeyboardAvoidingView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function Alimentacion() {
  const [recordatorios, setRecordatorios] = useState([
    { id: 1, alimentos: "", porcion: "", hora: new Date() },
  ]);
  const [recordatorioActivo, setRecordatorioActivo] = useState(1);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [imagenes, setImagenes] = useState([null, null, null, null]);

  // --- Recordatorios ---
  const agregarRecordatorio = () => {
    const nuevo = {
      id: recordatorios.length + 1,
      alimentos: "",
      porcion: "",
      hora: new Date(),
    };
    setRecordatorios([...recordatorios, nuevo]);
    setRecordatorioActivo(nuevo.id);
  };

  const borrarRecordatorio = () => {
    if (recordatorios.length === 1) return;
    const nuevos = recordatorios.filter((r) => r.id !== recordatorioActivo);
    setRecordatorios(nuevos);
    setRecordatorioActivo(nuevos[0].id);
  };

  const actualizarCampo = (campo, valor) => {
    setRecordatorios((prev) =>
      prev.map((r) =>
        r.id === recordatorioActivo ? { ...r, [campo]: valor } : r
      )
    );
  };

  const handleSave = () => {
    setIsEditable(false);
    alert("Cambios guardados ✅");
  };

  const recordatorioSeleccionado = recordatorios.find(
    (r) => r.id === recordatorioActivo
  );

  // --- DateTimePicker ---
  const onChangeHora = (event, selectedDate) => {
    const currentDate = selectedDate || recordatorioSeleccionado.hora;
    setMostrarPicker(Platform.OS === "ios");
    actualizarCampo("hora", currentDate);
  };

  const formatearHora = (date) => {
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  };

  // --- Image Picker ---
  const seleccionarImagen = async (index) => {
    const opciones = [
      { text: "Tomar foto", onPress: () => tomarFoto(index) },
      { text: "Elegir de galería", onPress: () => abrirGaleria(index) },
      { text: "Cancelar", style: "cancel" },
    ];
    Alert.alert("Agregar imagen", "Selecciona una opción", opciones);
  };

  const abrirGaleria = async (index) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newImages = [...imagenes];
      newImages[index] = result.assets[0].uri;
      setImagenes(newImages);
    }
  };

  const tomarFoto = async (index) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permiso de cámara denegado 😢");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled) {
      const newImages = [...imagenes];
      newImages[index] = result.assets[0].uri;
      setImagenes(newImages);
    }
  };

  const [isEditable, setIsEditable] = useState(false);
  const toggleEdit = () => setIsEditable(!isEditable);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado */}
        <View style={styles.header}>

          <Text style={styles.title}>Alimentación</Text>

          <TouchableOpacity onPress={isEditable ? handleSave : toggleEdit}>
            <Ionicons
              name={isEditable ? "checkmark-outline" : "create-outline"}
              size={28}
              color={isEditable ? "#007700ff" : "black"}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Planificador de comidas</Text>
        {/* Rutinas */}
        <View style={styles.section}>
          <View style={styles.menu}>
            {recordatorios.map((rec) => (
              <TouchableOpacity
                key={rec.id}
                style={[
                  styles.item,
                  recordatorioActivo === rec.id && styles.itemActivo,
                ]}
                onPress={() => setRecordatorioActivo(rec.id)}
              >
                <Text
                  style={
                    recordatorioActivo === rec.id
                      ? styles.itemTextActivo
                      : styles.itemText
                  }
                >
                  Recordatorio {rec.id}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.btnAdd} onPress={agregarRecordatorio}>
              <Text style={styles.btnAddText}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Alimentos"
              value={recordatorioSeleccionado.alimentos}
              editable={isEditable}
              onChangeText={(t) => actualizarCampo("alimentos", t)}
            />
            <TextInput
              style={styles.input}
              placeholder="Porción"
              value={recordatorioSeleccionado.porcion}
              editable={isEditable}
              onChangeText={(t) => actualizarCampo("porcion", t)}
            />

            <TouchableOpacity
              style={styles.input}
              onPress={() => setMostrarPicker(true)}
            >
              <Text style={{ color: "#888", fontSize:18, }}>
                Horario programado: {formatearHora(recordatorioSeleccionado.hora)}
              </Text>
            </TouchableOpacity>

            {mostrarPicker && (
              <DateTimePicker
                value={recordatorioSeleccionado.hora}
                mode="time"
                is24Hour={true}
                display="default"
                editable={isEditable}
                onChange={onChangeHora}
              />
            )}

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.btnDelete} onPress={borrarRecordatorio}>
                <Text style={styles.btnDeleteText}><Ionicons name="trash-outline" size={20} color="#000" /></Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {/* Sección de alimentos recomendados */}
        <Text style={[styles.subtitle, { marginTop: 20 }]}>
          Alimentos recomendados
        </Text>
        <View style={styles.grid}>
          {imagenes.map((img, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => seleccionarImagen(index)}
            >
              {img ? (
                <Image source={{ uri: img }} style={styles.image} />
              ) : (
                <>
                  <Text style={{ textAlign: "center", color: "#aaa" }}>📷</Text>
                  <View style={styles.btnCard}>
                    <Text style={styles.btnCardText}>Agregar</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
        {isEditable && (
          <TouchableOpacity style={styles.btnSaveSmall} onPress={handleSave}>
            <Text style={styles.btnSaveSmallText}>Guardar cambios</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", padding: 20, padingTop:20, },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    borderBottomWidth:1,
    borderColor:"#dbd6d6ff",
  },
  title: {
    fontSize: 24, fontWeight: "bold", textAlign: "left", marginTop:10, marginBottom:10,
  },
  subtitle: {
    fontSize: 18, fontWeight: "600", marginVertical: 10
  },
  section: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  menu: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 10,          // separarlo del contenido
    borderBottomWidth: 1,      // en vez de borderRight <- ahora es una línea horizontal
    borderBottomColor: "#ddd",
    paddingBottom: 8,
  },
  item: { padding: 8, borderRadius: 8, marginVertical: 4 },
  itemActivo: { backgroundColor: "#dafcc7ff" },
  itemText: { color: "#333" },
  itemTextActivo: { color: "#000", fontWeight: "bold" },
  btnAdd: { alignItems: "center", marginTop: 10, },
  btnAddText: { fontSize: 22, color:"#ff0202ff", fontWeight:"bold", },
  form: { flex: 1, paddingLeft: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 18,
  },
  rowButtons: { flexDirection: "row", justifyContent: "space-between" },
  btnDelete: {
    backgroundColor: "#ffffffff",
    borderRadius: 50,
    padding: 12,
    width: 50,
    alignItems: "center",
  },
  btnDeleteText: { fontSize: 16 },
  btnSaveSmall: {
    backgroundColor: "#4BCF5C",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 30,
  },
  btnSaveSmallText: { color: "#fff", fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    height: 120,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  btnCard: {
    backgroundColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 8,
  },
  btnCardText: { color: "#333", fontSize: 12 },
  image: { width: "100%", height: "100%", borderRadius: 10 },
});

