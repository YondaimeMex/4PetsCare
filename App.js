import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState, createContext } from 'react';
import Login from './screens/Login';
import Registro from './screens/Registro';
import Recuperación from './screens/Recuperación';
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


export const AuthContext = createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificación de token/sesión
    // En producción, verificarías aquí si hay una sesión activa
    const checkAuth = async () => {
      try {
        // Aquí puedes llamar a tu backend para verificar si hay sesión activa
        // const token = await AsyncStorage.getItem('userToken');
        // setIsLoggedIn(!!token);
        setIsLoggedIn(false); // Por ahora, siempre comienza con Login
      } catch (error) {
        console.error('Error verificando autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return null; // O un splash screen
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <Stack.Group>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{
                  animationEnabled: false,
                }}
              />
              <Stack.Screen
                name="Registro"
                component={Registro}
                options={{
                  animationEnabled: true,
                }}
              />
              <Stack.Screen
                name="Recuperación"
                component={Recuperación}
                options={{
                  animationEnabled: true,
                }}
              />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Perfil" component={Perfil} />
              <Stack.Screen name="RegistroMascota" component={RegistroMascota} />
              <Stack.Screen name="Mascotas" component={Mascotas} />
              <Stack.Screen name="PerfilMascotaStack" component={PerfilMascotaStack}/>
              <Stack.Screen name="ConfirmacionVacuna" component={ConfirmacionVacuna} />
              <Stack.Screen name="VacunaRegistrada" component={VacunaRegistrada} />
              <Stack.Screen name="Calendario" component={Calendario} />
              <Stack.Screen name="Consejos" component={Consejos} />
              <Stack.Screen name="Emergencias" component={Emergencias} />
              <Stack.Screen name="RegistroVeterinaria" component={RegistroVeterinaria} />
              <Stack.Screen name="ProgramarCita" component={ProgramarCita} />
              <Stack.Screen name="ChatBot" component={ChatBot} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
