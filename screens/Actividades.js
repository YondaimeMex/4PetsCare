import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function Actividades() {
  const [rutinas, setRutinas] = useState([
    { id: 1, nombre: "Rutina 1", tiempo: "" },
  ]);
  const [rutinaActiva, setRutinaActiva] = useState(1);
  const [cosasEvitar, setCosasEvitar] = useState("");

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

  const guardarCambios = () => {
    console.log("Rutinas:", rutinas);
    console.log("Cosas para evitar:", cosasEvitar);
    alert("Cambios guardados ✅");
  };

  const rutinaSeleccionada = rutinas.find((r) => r.id === rutinaActiva);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Actividades</Text>

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

          <TouchableOpacity style={styles.btnAdd} onPress={agregarRutina}>
            <Text style={styles.btnAddText}>＋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={rutinaSeleccionada?.nombre || ""}
            onChangeText={(text) => actualizarCampo("nombre", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Tiempo de actividad"
            value={rutinaSeleccionada?.tiempo || ""}
            onChangeText={(text) => actualizarCampo("tiempo", text)}
          />

          <TouchableOpacity style={styles.btnDelete} onPress={borrarRutina}>
            <Text style={styles.btnDeleteText}>Borrar registro</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Cosas para evitar</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Lista:"
          value={cosasEvitar}
          onChangeText={setCosasEvitar}
        />
      </View>

      <TouchableOpacity style={styles.btnSave} onPress={guardarCambios}>
        <Text style={styles.btnSaveText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },
  rutinaSection: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  rutinaMenu: {
    width: "35%",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  rutinaItem: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  rutinaActiva: {
    backgroundColor: "#eee",
  },
  rutinaText: {
    color: "#333",
  },
  rutinaTextActiva: {
    color: "#000",
    fontWeight: "bold",
  },
  btnAdd: {
    marginTop: 10,
    alignItems: "center",
  },
  btnAddText: {
    fontSize: 20,
    color: "#888",
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
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  btnDelete: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnDeleteText: {
    color: "#444",
    fontWeight: "600",
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
  },
  btnSave: {
    backgroundColor: "#000",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 30,
  },
  btnSaveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
