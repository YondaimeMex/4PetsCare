import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Actividades() {
  const [rutinas, setRutinas] = useState([
    { id: 1, nombre: "Rutina 1", tiempo: "" },
  ]);
  const [rutinaActiva, setRutinaActiva] = useState(1);
  const [cosasEvitar, setCosasEvitar] = useState("");
  const [isEditable, setIsEditable] = useState(false);

  const agregarRutina = () => {
    const nuevaRutina = {
      id: rutinas.length + 1,
      nombre: `Rutina ${rutinas.length + 1}`,
      tiempo: "",
    };
    setRutinas([...rutinas, nuevaRutina]);
    setRutinaActiva(nuevaRutina.id);
  };



  const borrarRutina = () => {
    if (rutinas.length === 1) return; // No borrar si solo hay una
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

  const toggleEdit = () => setIsEditable(!isEditable);
  const handleSave = () => {
    setIsEditable(false);
    alert("Cambios guardados ✅");
  };

  const rutinaSeleccionada = rutinas.find((r) => r.id === rutinaActiva);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/*Encabezado*/}
        <View style={styles.header}>
          <Text style={styles.title}>Actividades</Text>
          <TouchableOpacity onPress={isEditable ? handleSave : toggleEdit}>
            <Ionicons
              name={isEditable ? "checkmark-outline" : "create-outline"}
              size={30}
              color={isEditable ? "#007700ff" : "black"}
            />
          </TouchableOpacity>
        </View>

        {/*Seccion rutinas*/}
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
                <Text
                  style={
                    rutinaActiva === rutina.id
                      ? styles.rutinaTextActiva
                      : styles.rutinaText
                  }
                >
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
                  <Text style={styles.btnDeleteText}><Ionicons name="trash-outline" size={20} color="#000" /></Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Cosas para evitar</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Escribe tu lista..."
            editable={isEditable}
            value={cosasEvitar}
            onChangeText={setCosasEvitar}
          />
          {isEditable && (
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={styles.btnSaveText}>Guardar cambios</Text>
            </TouchableOpacity>)}
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
    marginBottom: 10,          // separarlo del contenido
    borderBottomWidth: 1,      // en vez de borderRight <- ahora es una línea horizontal
    borderBottomColor: "#ddd",
    paddingBottom: 8,
  },
  rutinaItem: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  rutinaActiva: {
    backgroundColor: "#dafcc7ff",
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
    color: "#ff0202ff",
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

  },
  btnDelete: {
    backgroundColor: "#ffffffff",
    borderRadius: 50,
    padding: 12,
    width: 50,
    alignItems: "center",
  },
  //{/*} btnDeleteText: {
  //color: "white",
  //fontWeight: "600",
  //},
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
    backgroundColor: "#4BCF5C",
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
