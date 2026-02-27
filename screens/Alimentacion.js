import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Alimentacion({ route }) {
  const { mascotaId } = route.params;

  // ---- ESTADOS ----
  const [data, setData] = useState({
    recordatorios: [
      { id: 1, alimentos: "", porcion: "", hora: new Date() },
    ],
    favoritos: [],
    prohibidos: [],
  });

  const [recordatorioActivo, setRecordatorioActivo] = useState(1);
  const [isEditable, setIsEditable] = useState(false);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const storageKey = `@alimentacion_${mascotaId}`;
  const [favoritos, setFavoritos] = useState([""]);
  const [prohibidos, setProhibidos] = useState([""]);


  // ---------------------- CARGAR DATOS ----------------------
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const json = await AsyncStorage.getItem(storageKey);
      if (json) {
        const d = JSON.parse(json);
        setData(d);
        setFavoritos(d.favoritos.length ? d.favoritos : [""]);
        setProhibidos(d.prohibidos.length ? d.prohibidos : [""]);
      }
    } catch (e) {
      console.log("Error cargando datos:", e);
    }
  };

  // ---------------------- GUARDAR DATOS ----------------------
  const guardarDatos = async () => {
    try {
      const dataActualizado = {
        ...data,
        favoritos: favoritos.filter((f) => f.trim() !== ""),
        prohibidos: prohibidos.filter((p) => p.trim() !== ""),
      };

      setData(dataActualizado);
      await AsyncStorage.setItem(storageKey, JSON.stringify(dataActualizado));
      Alert.alert("✔ Guardado", "Cambios guardados correctamente.");
      setIsEditable(false);
    } catch (e) {
      console.log("Error guardando:", e);
    }
  };

  // ---------------------- RECORDATORIOS ----------------------
  const agregarRecordatorio = () => {
    const nuevo = {
      id: Date.now(),
      alimentos: "",
      porcion: "",
      hora: new Date(),
    };

    setData({
      ...data,
      recordatorios: [...data.recordatorios, nuevo],
    });

    setRecordatorioActivo(nuevo.id);
  };

  const borrarRecordatorio = () => {
    if (data.recordatorios.length === 1) return;

    const nuevos = data.recordatorios.filter(
      (r) => r.id !== recordatorioActivo
    );

    setData({
      ...data,
      recordatorios: nuevos,
    });

    setRecordatorioActivo(nuevos[0].id);
  };

  const actualizarCampo = (campo, valor) => {
    setData((prev) => ({
      ...prev,
      recordatorios: prev.recordatorios.map((r) =>
        r.id === recordatorioActivo ? { ...r, [campo]: valor } : r
      ),
    }));
  };

  const recordatorioActual = data.recordatorios.find(
    (r) => r.id === recordatorioActivo
  );

  const onChangeHora = (_, selectedDate) => {
    if (selectedDate) {
      actualizarCampo("hora", selectedDate);
    }
    setMostrarPicker(false);
  };

  const formatearHora = (date) => {
    if (!date) return "00:00";

    // Si es string, convertir a Date
    if (typeof date === "string") {
      date = new Date(date);
    }

    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };


  // ---------------------- FAVORITOS y prohibidos ----------------------
  const agregarFavorito = () => {
    setFavoritos([...favoritos, ""]);
  };

  const agregarProhibido = () => {
    setProhibidos([...prohibidos, ""]);
  };

  const actualizarFavorito = (text, index) => {
    const copia = [...favoritos];
    copia[index] = text;
    setFavoritos(copia);
  };

  const actualizarProhibido = (text, index) => {
    const copia = [...prohibidos];
    copia[index] = text;
    setProhibidos(copia);
  };


  // Alerta si un alimento prohibido aparece en el input
  useEffect(() => {
    if (!recordatorioActual) return;

    for (let prohibido of data.prohibidos) {
      if (
        recordatorioActual.alimentos
          ?.toLowerCase()
          .includes(prohibido.toLowerCase())
      ) {
        Alert.alert(
          "⚠ Alimento prohibido",
          `El alimento "${prohibido}" está en la lista de prohibidos`
        );
      }
    }
  }, [recordatorioActual?.alimentos]);

  // ---------------------- UI ----------------------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        style={styles.container}
        keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Alimentación</Text>
          <TouchableOpacity onPress={() => setIsEditable(!isEditable)}>
            <Ionicons
              name={isEditable ? "close" : "create-outline"}
              size={28}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* Recordatorios */}
        <Text style={styles.subtitle}>Planificador de comidas</Text>
        <View style={styles.section}>
          <View style={styles.menu}>
            {data.recordatorios.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.item,
                  recordatorioActivo === r.id && styles.itemActivo,
                ]}
                onPress={() => setRecordatorioActivo(r.id)}
              >
                <Text style={recordatorioActivo === r.id ? styles.itemTextActivo : styles.itemText}>
                  Recordatorio
                </Text>
              </TouchableOpacity>
            ))}

            {isEditable && (
              <TouchableOpacity style={styles.btnAdd} onPress={agregarRecordatorio}>
                <Text style={styles.btnAddText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Alimentos"
              value={recordatorioActual?.alimentos}
              editable={isEditable}
              onChangeText={(t) => actualizarCampo("alimentos", t)}
            />
            <TextInput
              style={styles.input}
              placeholder="Porción"
              value={recordatorioActual?.porcion}
              editable={isEditable}
              onChangeText={(t) => actualizarCampo("porcion", t)}
            />

            <TouchableOpacity
              style={styles.input}
              onPress={() => isEditable && setMostrarPicker(true)}
            >
              <Text>
                Horario: {formatearHora(recordatorioActual?.hora || new Date())}
              </Text>
            </TouchableOpacity>

            {mostrarPicker && (
              <DateTimePicker
                value={
                  recordatorioActual?.hora
                    ? new Date(recordatorioActual.hora)
                    : new Date()
                }
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onChangeHora}
              />

            )}

            {isEditable && (
              <TouchableOpacity style={styles.btnDelete} onPress={borrarRecordatorio}>
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ---------------- FAVORITOS ---------------- */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.subtitle}>Alimentos favoritos</Text>
            {isEditable && (
              <TouchableOpacity style={styles.btnAdd} onPress={agregarFavorito}>
                <Text style={styles.btnAddText}>＋</Text>
              </TouchableOpacity>
            )}
          </View>
          {favoritos.map((fav, i) => (
            <TextInput
              key={i}
              style={styles.input}
              placeholder="Alimento favorito"
              value={fav}
              editable={isEditable}
              onChangeText={(t) => actualizarFavorito(t, i)}
            />
          ))}
        </View>

        {/* ---------------- PROHIBIDOS ---------------- */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.subtitle}>Alimentos prohibidos</Text>
            {isEditable && (
              <TouchableOpacity style={styles.btnAdd} onPress={agregarProhibido}>
                <Text style={styles.btnAddText}>＋</Text>
              </TouchableOpacity>
            )}
          </View>
          {prohibidos.map((p, i) => (
            <TextInput
              key={i}
              style={styles.input}
              placeholder="Alimento prohibido"
              value={p}
              editable={isEditable}
              onChangeText={(t) => actualizarProhibido(t, i)}
            />
          ))}
        </View>

        {isEditable && (
          <TouchableOpacity onPress={guardarDatos} style={styles.btnSaveSmall}>
            <Text style={styles.btnSaveSmallText}>Guardar cambios</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderColor: "#dbd6d6ff",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },

  section: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    marginBottom: 10,
  },

  menu: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 8,
  },

  item: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 4
  },

  itemActivo: {
    backgroundColor: "#ffdd01ff"
  },

  itemText: {
    fontSize: 10,
  },

  itemTextActivo: {
    color: "#000",
    fontWeight: "bold",

  },

  btnAddText: {
    fontSize: 22,
    color: "#ffcc01ff",
    fontWeight: "bold",
  },

  form: {
    padding: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  btnDelete: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 5,
    alignSelf: "flex-end",
  },

  btnDeleteText: {
    fontSize: 16
  },

  btnSaveSmall: {
    backgroundColor: "#ffcc01ff",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 30,
  },

  btnSaveSmallText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

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

  btnCardText: {
    color: "#333",
    fontSize: 12
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },

  itemText: {
    fontSize: 16,
  },
  itemFav: { fontSize: 16, paddingLeft: 5, marginBottom: 5 },
  itemProhibido: { fontSize: 16, paddingLeft: 5, marginBottom: 5, color: "red" },
  btnAddItem: {
    backgroundColor: "#0a84ff",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  btnAddItemText: { color: "white", fontSize: 16 },
});




