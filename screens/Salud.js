import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Salud() {
  // Estado para vacunas
  const [vacunas, setVacunas] = useState(["Vacuna 1", "Vacuna 2"]);
  const [fecha, setFecha] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowPicker(false); // Oculta el selector
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  // Estado para padecimientos
  const [padecimientos, setPadecimientos] = useState(["Padecimiento 1", "Padecimiento 2"]);
  const [selectedPadecimiento, setSelectedPadecimiento] = useState("Padecimiento 1");
  const [nombrePadecimiento, setNombrePadecimiento] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [medicamentos, setMedicamentos] = useState("");

  // Agregar o eliminar padecimientos
  const addPadecimiento = () => {
    const nuevo = `Padecimiento ${padecimientos.length + 1}`;
    setPadecimientos([...padecimientos, nuevo]);
  };

  const eliminarPadecimiento = () => {
    if (padecimientos.length > 1) {
      const nuevos = padecimientos.filter(p => p !== selectedPadecimiento);
      setPadecimientos(nuevos);
      setSelectedPadecimiento(nuevos[0]);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Salud</Text>

      {/* Sección Vacunas */}
      <Text style={styles.sectionTitle}>Mis vacunas</Text>
      <View style={styles.vacunasContainer}>
        <View style={styles.vacunasList}>
          {vacunas.map((v, index) => (
            <TouchableOpacity key={index} style={styles.vacunaBox}>
              <Text style={styles.vacunaText}>{v}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setVacunas([...vacunas, `Vacuna ${vacunas.length + 1}`])}
          >
            <Ionicons name="add" size={18} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.vacunaInputs}>
         {/* El TextInput abre el selector */}
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <TextInput
          value={fecha.toLocaleDateString()}
          editable={false}               // evita teclado
          pointerEvents="none"           // evita focus
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 8,
          }}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
          <TextInput style={styles.input} placeholder="Dosis" />
          <TextInput style={[styles.input, { height: 60 }]} placeholder="Notas" multiline />
        </View>
      </View>

      {/* Sección Padecimientos */}
      <View style={styles.padecimientosSection}>
        <View style={styles.padecimientosHeader}>
          <Text style={styles.sectionTitle}>Padecimientos</Text>
          <TouchableOpacity onPress={addPadecimiento}>
            <Ionicons name="add-circle-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {padecimientos.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.tab,
                selectedPadecimiento === p && styles.tabActive,
              ]}
              onPress={() => setSelectedPadecimiento(p)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedPadecimiento === p && styles.tabTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nombre de padecimiento"
          value={nombrePadecimiento}
          onChangeText={setNombrePadecimiento}
        />
        <TextInput
          style={styles.input}
          placeholder="Síntomas"
          value={sintomas}
          onChangeText={setSintomas}
        />
        <TextInput
          style={styles.input}
          placeholder="Medicamentos"
          value={medicamentos}
          onChangeText={setMedicamentos}
        />

        <TouchableOpacity style={styles.deleteButton} onPress={eliminarPadecimiento}>
          <Ionicons name="trash-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Guardar cambios */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 15 , marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginVertical: 10 },
  vacunasContainer: { flexDirection: "row", justifyContent: "space-between" },
  vacunasList: {
    flex: 1,
    borderColor: "#010102ff",
    borderWidth: 1,
    borderStyle: "dotted",
    borderRadius: 8,
    padding: 5,
    marginRight: 10,
  },
  vacunaBox: {
    borderBottomWidth: 1,
    borderColor: "#504800ff",
    paddingVertical: 8,
  },
  vacunaText: { fontSize: 14, color: "#000" },
  addButton: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#000000ff",
    padding: 5,
    marginTop: 8,
  },
  vacunaInputs: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  padecimientosSection: { marginTop: 20 },
  padecimientosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabs: { flexDirection: "row", marginTop: 10 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom:20,
  },
  tabActive: {marginBottom:20, borderBottomColor: "#000" },
  tabText: { color: "#777" },
  tabTextActive: { color: "#000", fontWeight: "bold" },
  deleteButton: {
    alignSelf: "flex-end",
    backgroundColor: "#E9E9E9",
    padding: 10,
    borderRadius: 20,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
