import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Perfil from './screens/Perfil';
import RegistroMascota from './screens/RegistroMascota';
import Mascotas from './screens/Mascotas';
import ConfirmacionVacuna from './screens/ConfirmacionVacuna';
import VacunaRegistrada from './screens/VacunaRegistrada';
import Calendario from './screens/Calendario';
import Consejos from './screens/Consejos';
import Emergencias from './screens/Emergencias';
import RegistroVeterinaria from './screens/RegistroVeterinaria';
import ProgramarCita from './screens/ProgramarCita';
import ChatBot from './screens/ChatBot';
import PerfilMascotaStack from "./screens/PerfilMascotaStack";


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="RegistroMascota" component={RegistroMascota} />
        <Stack.Screen name="Mascotas" component={Mascotas} />
        <Stack.Screen name="ConfirmacionVacuna" component={ConfirmacionVacuna} />
        <Stack.Screen name="VacunaRegistrada" component={VacunaRegistrada} />
        <Stack.Screen name="Calendario" component={Calendario} />
        <Stack.Screen name="Consejos" component={Consejos} />
        <Stack.Screen name="Emergencias" component={Emergencias} />
        <Stack.Screen name="RegistroVeterinaria" component={RegistroVeterinaria} />
        <Stack.Screen name="ProgramarCita" component={ProgramarCita} />
        <Stack.Screen name="ChatBot" component={ChatBot} />
       
        <Stack.Screen name="PerfilMascotaStack" component={PerfilMascotaStack} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
