import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Platform, Alert, } from "react-native";
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

  const guardarCambios = () => {
    console.log("Recordatorios guardados:", recordatorios);
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Alimentación</Text>
      <Text style={styles.subtitle}>Planificador de comidas 🍽️</Text>

      <View style={styles.section}>
        {/* Menú lateral */}
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
            onChangeText={(t) => actualizarCampo("alimentos", t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Porción"
            value={recordatorioSeleccionado.porcion}
            onChangeText={(t) => actualizarCampo("porcion", t)}
          />

          <TouchableOpacity
            style={styles.input}
            onPress={() => setMostrarPicker(true)}
          >
            <Text style={{ color: "#888" }}>
              Horario programado: {formatearHora(recordatorioSeleccionado.hora)}
            </Text>
          </TouchableOpacity>

          {mostrarPicker && (
            <DateTimePicker
              value={recordatorioSeleccionado.hora}
              mode="time"
              is24Hour={true}
              display="default"
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

      <TouchableOpacity style={styles.btnSaveSmall} onPress={guardarCambios}>
        <Text style={styles.btnSaveSmallText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  subtitle: { fontSize: 16, fontWeight: "600", marginVertical: 10 },
  section: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  menu: { width: "35%", borderRightWidth: 1, borderRightColor: "#ddd" },
  item: { padding: 8, borderRadius: 8, marginVertical: 4 },
  itemActivo: { backgroundColor: "#eee" },
  itemText: { color: "#333" },
  itemTextActivo: { color: "#000", fontWeight: "bold" },
  btnAdd: { alignItems: "center", marginTop: 10 },
  btnAddText: { fontSize: 22, color: "#888" },
  form: { flex: 1, paddingLeft: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  rowButtons: { flexDirection: "row", justifyContent: "space-between" },
  btnDelete: {
    backgroundColor: "#ddd",
    borderRadius: 50,
    padding: 12,
    width: 50,
    alignItems: "center",
  },
  btnDeleteText: { fontSize: 16 },
  btnSaveSmall: {
    backgroundColor: "#000",
    borderRadius: 20,
    paddingHorizontal: 100,
    paddingVertical: 10,
    //justifyContent: "center",
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

