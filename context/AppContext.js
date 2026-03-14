import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/colors';
import { translations, availableLanguages } from '../constants/translations';

// Datos de notificaciones de ejemplo
const defaultNotifications = [
    '¡Se acerca el día de la cita! ¿Ya tienes todo preparado?',
    '¡Campaña de vacunación!, el día 30 de Octubre',
    'Recordatorio: Próxima dosis de medicamento.',
];

// Datos de usuario por defecto
const defaultUserData = {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '999 888 7777',
    address: 'Calle Principal #123',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
};

const USER_STORAGE_KEY = '@4PetsCare_userData';
const THEME_STORAGE_KEY = '@4PetsCare_theme';
const LANGUAGE_STORAGE_KEY = '@4PetsCare_language';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Estado del menú lateral
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Estado del usuario
    const [userData, setUserData] = useState(defaultUserData);
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

    // Estado del tema
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);

    // Estado del idioma
    const [language, setLanguage] = useState('es');
    const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

    // Colores actuales basados en el tema (con fallback de seguridad)
    const colors = (isDarkMode ? darkTheme : lightTheme) || lightTheme || {
        primary: '#43A047',
        card: '#F8F9FA',
        background: '#FFFFFF',
        text: '#333333',
        textMuted: '#999999',
        border: '#E0E0E0',
        textWhite: '#FFFFFF',
    };

    // Traducciones actuales basadas en el idioma
    const t = translations[language] || translations['es'] || {};

    // Función helper para obtener traducción
    const translate = useCallback((key) => {
        return t[key] || translations['es'][key] || key;
    }, [t]);

    // Cargar datos del usuario, tema e idioma desde AsyncStorage al iniciar
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedData = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (storedData) {
                    setUserData(JSON.parse(storedData));
                }
            } catch (error) {
                console.log('Error cargando datos de usuario:', error);
            } finally {
                setIsUserDataLoaded(true);
            }
        };

        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme !== null) {
                    setIsDarkMode(storedTheme === 'dark');
                }
            } catch (error) {
                console.log('Error cargando tema:', error);
            } finally {
                setIsThemeLoaded(true);
            }
        };

        const loadLanguage = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                if (storedLanguage !== null) {
                    setLanguage(storedLanguage);
                }
            } catch (error) {
                console.log('Error cargando idioma:', error);
            } finally {
                setIsLanguageLoaded(true);
            }
        };

        loadUserData();
        loadTheme();
        loadLanguage();
    }, []);

    // Cambiar tema
    const toggleDarkMode = useCallback(async () => {
        try {
            const newMode = !isDarkMode;
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
            setIsDarkMode(newMode);
        } catch (error) {
            console.log('Error guardando tema:', error);
        }
    }, [isDarkMode]);

    // Cambiar idioma
    const changeLanguage = useCallback(async (newLanguage) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
            setLanguage(newLanguage);
        } catch (error) {
            console.log('Error guardando idioma:', error);
        }
    }, []);

    // Actualizar datos del usuario
    const updateUserData = useCallback(async (newData) => {
        try {
            const updatedData = { ...userData, ...newData };
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedData));
            setUserData(updatedData);
            return true;
        } catch (error) {
            console.log('Error guardando datos de usuario:', error);
            return false;
        }
    }, [userData]);

    // Estado del panel de notificaciones
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Lista de notificaciones
    const [notifications, setNotifications] = useState(defaultNotifications);

    // Abrir/cerrar menú
    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => {
            const newState = !prev;
            if (newState) setIsNotificationsOpen(false);
            return newState;
        });
    }, []);

    const openMenu = useCallback(() => {
        setIsMenuOpen(true);
        setIsNotificationsOpen(false);
    }, []);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    // Abrir/cerrar notificaciones
    const toggleNotifications = useCallback(() => {
        setIsNotificationsOpen(prev => {
            const newState = !prev;
            if (newState) setIsMenuOpen(false);
            return newState;
        });
    }, []);

    const closeNotifications = useCallback(() => {
        setIsNotificationsOpen(false);
    }, []);

    // Cerrar todo (menú y notificaciones)
    const closeAll = useCallback(() => {
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
    }, []);

    // Agregar notificación
    const addNotification = useCallback((text) => {
        setNotifications(prev => [text, ...prev]);
    }, []);

    // Limpiar notificaciones
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const value = useMemo(() => ({
        // Estado
        isMenuOpen,
        isNotificationsOpen,
        notifications,
        isOverlayVisible: isMenuOpen || isNotificationsOpen,

        // Estado del usuario
        userData,
        isUserDataLoaded,
        updateUserData,

        // Estado del tema
        isDarkMode,
        isThemeLoaded,
        toggleDarkMode,
        colors,

        // Estado del idioma
        language,
        isLanguageLoaded,
        changeLanguage,
        t,
        translate,
        availableLanguages,

        // Acciones del menú
        toggleMenu,
        openMenu,
        closeMenu,

        // Acciones de notificaciones
        toggleNotifications,
        closeNotifications,
        addNotification,
        clearNotifications,

        // Acciones generales
        closeAll,
    }), [
        isMenuOpen,
        isNotificationsOpen,
        notifications,
        userData,
        isUserDataLoaded,
        updateUserData,
        isDarkMode,
        isThemeLoaded,
        toggleDarkMode,
        colors,
        language,
        isLanguageLoaded,
        changeLanguage,
        t,
        translate,
        toggleMenu,
        openMenu,
        closeMenu,
        toggleNotifications,
        closeNotifications,
        addNotification,
        clearNotifications,
        closeAll,
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Hook personalizado para usar el contexto
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp debe usarse dentro de un AppProvider');
    }
    return context;
}

export default AppContext;
