import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Actividades({ route }) {
  const mascotaId = route.params?.mascotaId;

  const [rutinas, setRutinas] = useState([{ id: 1, nombre: "Rutina 1", tiempo: "" }]);
  const [rutinaActiva, setRutinaActiva] = useState(1);
  const [cosasEvitar, setCosasEvitar] = useState("");
  const [isEditable, setIsEditable] = useState(false);

  const agregarRutina = () => {
    const nuevaRutina = {
      id: Date.now(), // ID REAL único por rutina
      nombre: `Rutina ${rutinas.length + 1}`,
      tiempo: "",
    };

    setRutinas([...rutinas, nuevaRutina]);
    setRutinaActiva(nuevaRutina.id);
  };

  const borrarRutina = () => {
    if (rutinas.length === 1) return;
    const nuevas = rutinas.filter((r) => r.id !== rutinaActiva);
    setRutinas(nuevas);
    setRutinaActiva(nuevas[0].id);
  };

  const actualizarCampo = (campo, valor) => {
    setRutinas((prev) =>
      prev.map((r) =>
        r.id === rutinaActiva ? { ...r, [campo]: valor } : r
      )
    );
  };

  const handleSave = async () => {
    await guardarDatos();
    setIsEditable(false);
  };

  const guardarDatos = async () => {
    try {
      const data = {
        rutinas,
        rutinaActiva,
        cosasEvitar,
      };

      await AsyncStorage.setItem(
        `@actividades_mascota_${mascotaId}`,
        JSON.stringify(data)
      );

      Alert.alert("Cambios guardados", "La información ha sido actualizada.");
      console.log("Datos guardados ✔");

    } catch (e) {
      console.log("Error guardando datos:", e);
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const json = await AsyncStorage.getItem(`@actividades_mascota_${mascotaId}`);
        if (json) {
          const data = JSON.parse(json);
          setRutinas(data.rutinas || []);
          setRutinaActiva(data.rutinaActiva || 1);
          setCosasEvitar(data.cosasEvitar || "");
        }
      } catch (e) {
        console.log("Error cargando datos:", e);
      }
    };

    if (mascotaId) {
      cargarDatos();
    }
  }, [mascotaId]);

  const rutinaSeleccionada = rutinas.find((r) => r.id === rutinaActiva);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Actividades</Text>
          <TouchableOpacity onPress={() => setIsEditable(!isEditable)}>
            <Ionicons name={isEditable ? "close" : "create-outline"} size={30} color="black" />
          </TouchableOpacity>
        </View>

        {/* Rutinas */}
        <Text style={styles.subtitle}>Rutinas</Text>
        <View style={styles.rutinaSection}>
          <View style={styles.rutinaMenu}>
            {rutinas.map((rutina) => (
              <TouchableOpacity
                key={rutina.id}
                style={[
                  styles.rutinaItem,
                  rutinaActiva === rutina.id && styles.rutinaActiva,
                ]}
                onPress={() => setRutinaActiva(rutina.id)}
              >
                <Text style={rutinaActiva === rutina.id ? styles.rutinaTextActiva : styles.rutinaText}>
                  {rutina.nombre}
                </Text>
              </TouchableOpacity>
            ))}

            {isEditable && (
              <TouchableOpacity style={styles.btnAdd} onPress={agregarRutina}>
                <Text style={styles.btnAddText}>＋</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={rutinaSeleccionada?.nombre || ""}
              editable={isEditable}
              onChangeText={(text) => actualizarCampo("nombre", text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Tiempo de actividad"
              value={rutinaSeleccionada?.tiempo || ""}
              editable={isEditable}
              onChangeText={(text) => actualizarCampo("tiempo", text)}
            />

            {isEditable && (
              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.btnDelete} onPress={borrarRutina}>
                  <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Cosas a evitar */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Cosas para evitar</Text>

          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Escribe tu lista..."
            value={cosasEvitar}
            editable={isEditable}
            onChangeText={setCosasEvitar}
          />

          {isEditable && (
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={styles.btnSaveText}>Guardar cambios</Text>
            </TouchableOpacity>
          )}
        </View>
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
    fontWeight: "600",
    marginBottom: 5,

  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 5,
    marginBottom:15,
  },
  rutinaSection: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  rutinaMenu: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth:1,
    borderBottomColor: "#ddd",
  },
  rutinaItem: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  rutinaActiva: {
    backgroundColor: "#00ccff9e",
  },
  rutinaText: {
    color: "#333",
    fontSize: 14,
  },
  rutinaTextActiva: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  btnAdd: {
    marginTop: 10,
    alignItems: "center",
  },
  btnAddText: {
    fontSize: 20,
    color: "#00ccffff",
    fontWeight: "bold",
  },
  form: {
    flex: 1,
    paddingLeft: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    height: 60,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  btnDelete: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  section: {
    marginTop: 20,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    alignItems: "flex-start"
  },
  btnSave: {
    backgroundColor: "#006affff",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 30,
  },
  btnSaveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
