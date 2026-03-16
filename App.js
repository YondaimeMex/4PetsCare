import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState, createContext } from 'react';
import { enableFreeze } from 'react-native-screens';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import './lib/notificationsBootstrap';
import { supabase } from './lib/Supabase';
import { AppProvider } from './context';
export const AuthContext = createContext();

const Stack = createNativeStackNavigator();

const getLoginScreen = () => require('./screens/Login').default;
const getRegistroScreen = () => require('./screens/Registro').default;
const getRecuperacionScreen = () => require('./screens/Recuperación').default;
const getHomeScreen = () => require('./screens/Home').default;
const getPerfilScreen = () => require('./screens/Perfil').default;
const getRegistroMascotaScreen = () => require('./screens/RegistroMascota').default;
const getMascotasScreen = () => require('./screens/Mascotas').default;
const getPerfilMascotaStackScreen = () => require('./screens/PerfilMascotaStack').default;
const getConfirmacionVacunaScreen = () => require('./screens/ConfirmacionVacuna').default;
const getVacunaRegistradaScreen = () => require('./screens/VacunaRegistrada').default;
const getCalendarioScreen = () => require('./screens/Calendario').default;
const getConsejosScreen = () => require('./screens/Consejos').default;
const getEmergenciasScreen = () => require('./screens/Emergencias').default;
const getRegistroVeterinariaScreen = () => require('./screens/RegistroVeterinaria').default;
const getProgramarCitaScreen = () => require('./screens/ProgramarCita').default;
const getEditarCitaScreen = () => require('./screens/EditarCita').default;
const getEditarVacunaScreen = () => require('./screens/EditarVacuna').default;
const getEditarPerfilScreen = () => require('./screens/EditarPerfil').default;
const getConfiguracionScreen = () => require('./screens/Configuracion').default;
const getBuscadorGoogleScreen = () => require('./screens/BuscadorGoogle').default;
const getMapasScreen = () => require('./screens/Mapas').default;

enableFreeze(true);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    // Escuchar cambios de sesión (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe()
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#43A047" />
      </View>
    );
  }

  return (
    <AppProvider>
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{
            headerShown: false,
            freezeOnBlur: true,
            // Use native transitions for smoother perceived navigation.
            animation: Platform.OS === 'ios' ? 'ios_from_right' : 'fade_from_bottom',
            animationDuration: 220,
          }}>
            {!isLoggedIn ? (
              <Stack.Group>
                <Stack.Screen name="Login" getComponent={getLoginScreen} />
                <Stack.Screen name="Registro" getComponent={getRegistroScreen} />
                <Stack.Screen name="Recuperación" getComponent={getRecuperacionScreen} />
              </Stack.Group>
            ) : (
              <Stack.Group>
                <Stack.Screen name="Home" getComponent={getHomeScreen} />
                <Stack.Screen name="Perfil" getComponent={getPerfilScreen} />
                <Stack.Screen name="RegistroMascota" getComponent={getRegistroMascotaScreen} />
                <Stack.Screen name="Mascotas" getComponent={getMascotasScreen} />
                <Stack.Screen name="PerfilMascotaStack" getComponent={getPerfilMascotaStackScreen} />
                <Stack.Screen name="ConfirmacionVacuna" getComponent={getConfirmacionVacunaScreen} />
                <Stack.Screen name="VacunaRegistrada" getComponent={getVacunaRegistradaScreen} />
                <Stack.Screen name="Calendario" getComponent={getCalendarioScreen} />
                <Stack.Screen name="Consejos" getComponent={getConsejosScreen} />
                <Stack.Screen name="Emergencias" getComponent={getEmergenciasScreen} />
                <Stack.Screen name="RegistroVeterinaria" getComponent={getRegistroVeterinariaScreen} />
                <Stack.Screen name="ProgramarCita" getComponent={getProgramarCitaScreen} />
                <Stack.Screen name="EditarCita" getComponent={getEditarCitaScreen} />
                <Stack.Screen name="EditarVacuna" getComponent={getEditarVacunaScreen} />
                <Stack.Screen name="EditarPerfil" getComponent={getEditarPerfilScreen} />
                <Stack.Screen name="Configuracion" getComponent={getConfiguracionScreen} />
                <Stack.Screen name="BuscadorGoogle" getComponent={getBuscadorGoogleScreen} />
                <Stack.Screen name="Mapas" getComponent={getMapasScreen} />
              </Stack.Group>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
