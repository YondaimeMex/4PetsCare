import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PerfilMascota from "./PerfilMascota";
import Salud from "./Salud";
import Actividades from "./Actividades";
import Alimentacion from "./Alimentacion";

const Stack = createNativeStackNavigator();

export default function PerfilMascotaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilMascota" component={PerfilMascota} />
      <Stack.Screen name="Salud" component={Salud} />
      <Stack.Screen name="Actividades" component={Actividades} />
      <Stack.Screen name="Alimentacion" component={Alimentacion}/>
    </Stack.Navigator>
  );
}
