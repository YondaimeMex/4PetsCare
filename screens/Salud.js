import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Salud({ route }) {
  const { mascotaId } = route.params;

  const [padecimientos, setPadecimientos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const storageKey = `@salud_${mascotaId}`;

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const json = await AsyncStorage.getItem(storageKey);
      if (json) {
        setPadecimientos(JSON.parse(json));
      }
    } catch (e) {
      console.log("Error cargando datos:", e);
    }
  };

  // Guardar datos
  const guardarDatos = async () => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(padecimientos));
      Alert.alert("✔ Guardado", "Cambios guardados correctamente.");
      setIsEditing(false);
    } catch (e) {
      console.log("Error guardando datos:", e);
    }
  };

  // Agregar padecimiento
  const addPadecimiento = () => {
    const nuevo = {
      id: Date.now(),
      nombre: "",
      sintomas: "",
      medicamentos: "",
    };
    setPadecimientos([nuevo, ...padecimientos]);
    setIsEditing(true);
  };

  // Eliminar padecimiento
  const eliminarPadecimiento = (id) => {
    const nuevos = padecimientos.filter((p) => p.id !== id);
    setPadecimientos(nuevos);
  };

  // Actualizar campos
  const actualizarCampo = (id, campo, valor) => {
    setPadecimientos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Salud</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Ionicons
            name={isEditing ? "close" : "create-outline"}
            size={28}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Padecimientos o enfermedades</Text>
      {/* Botón agregar */}
      {isEditing&&(
         <TouchableOpacity style={styles.addButtonContainer} onPress={addPadecimiento}>
        <Text style={styles.addButtonText}>＋ Agregar </Text>
      </TouchableOpacity>
      )}
     

      {padecimientos.length === 0 && (
        <Text style={styles.noPadecimientos}>No hay padecimientos agregados</Text>
      )}

      {padecimientos.map((padecimiento) => (
        <View key={padecimiento.id} style={styles.card}>
          {isEditing ? (
            <>

              <Text style={styles.label}>Nombre del padecimiento</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del padecimiento"
                value={padecimiento.nombre}
                onChangeText={(text) => actualizarCampo(padecimiento.id, "nombre", text)}
              />

              <Text style={styles.label}>Síntomas</Text>
              <View style={styles.iconInputContainer}>
                <MaterialIcons name="healing" size={20} color="#555" />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Síntomas"
                  value={padecimiento.sintomas}
                  onChangeText={(text) => actualizarCampo(padecimiento.id, "sintomas", text)}
                />
              </View>

              <Text style={styles.label}>Medicamentos</Text>
              <View style={styles.iconInputContainer}>
                <Ionicons name="medkit-outline" size={20} color="#555" />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Medicamentos"
                  value={padecimiento.medicamentos}
                  onChangeText={(text) => actualizarCampo(padecimiento.id, "medicamentos", text)}
                />
              </View>

              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => eliminarPadecimiento(padecimiento.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>{padecimiento.nombre || "Sin nombre"}</Text>
              <View style={styles.cardRow}>
                <MaterialIcons name="healing" size={20} color="#555" />
                <Text style={styles.cardText}>{padecimiento.sintomas || "-"}</Text>
              </View>
              <View style={styles.cardRow}>
                <Ionicons name="medkit-outline" size={20} color="#555" />
                <Text style={styles.cardText}>{padecimiento.medicamentos || "-"}</Text>
              </View>
            </>
          )}
        </View>
      ))}

  {padecimientos.length > 0 && isEditing && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={guardarDatos}
        >
          <Text style={styles.saveButtonText}>
            Guardar cambios
          </Text>
        </TouchableOpacity>
      )}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20, paddingTop:40, },
   header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderColor: "#dbd6d6ff",
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10,},
  subtitle:{
    fontSize: 18,
    marginBottom:20,
    fontWeight: "600",
  },
  addButtonContainer: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 12,
    borderWidth:1,
    borderColor:"#59bc67ff",
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "#12bd02ff", fontWeight: "bold", fontSize: 16 },
  noPadecimientos: { fontStyle: "italic", color: "#777", marginVertical: 20, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  cardText: { fontSize: 14, marginLeft: 8, color: "#555" },
  cardRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: "#fdfdfd",
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 10,
  },

  iconInputContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10, },
  deleteButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  rowButtons: { flexDirection: "row", justifyContent: "flex-end" },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#4BCF5C",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});


