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
const TUTORIAL_STORAGE_KEY = '@4PetsCare_tutorial_completed_v1';
const DEFAULT_LANGUAGE = 'es';

const AppContext = createContext();

const normalizeLanguageCode = (rawLanguage) => {
    if (!rawLanguage || typeof rawLanguage !== 'string') return DEFAULT_LANGUAGE;

    const normalized = rawLanguage.toLowerCase().split('-')[0].trim();
    const supportedLanguages = availableLanguages.map((lang) => lang.code);

    return supportedLanguages.includes(normalized) ? normalized : DEFAULT_LANGUAGE;
};

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
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

    // Estado del tutorial guiado
    const [isTutorialVisible, setIsTutorialVisible] = useState(false);
    const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
    const [isTutorialCompleted, setIsTutorialCompleted] = useState(false);
    const [isTutorialLoaded, setIsTutorialLoaded] = useState(false);
    const [isTutorialPendingStart, setIsTutorialPendingStart] = useState(false);
    const [tutorialViewport, setTutorialViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [tutorialTargets, setTutorialTargets] = useState({});

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
    const t = translations[language] || translations[DEFAULT_LANGUAGE] || {};

    // Función helper para obtener traducción
    const translate = useCallback((key) => {
        return t[key] || translations[DEFAULT_LANGUAGE][key] || key;
    }, [t]);

    // Cargar datos del usuario, tema e idioma desde AsyncStorage al iniciar
    useEffect(() => {
        const loadPersistedState = async () => {
            try {
                const entries = await AsyncStorage.multiGet([
                    USER_STORAGE_KEY,
                    THEME_STORAGE_KEY,
                    LANGUAGE_STORAGE_KEY,
                    TUTORIAL_STORAGE_KEY,
                ]);
                const storedValues = Object.fromEntries(entries);

                const storedData = storedValues[USER_STORAGE_KEY];
                if (storedData) {
                    setUserData(JSON.parse(storedData));
                }

                const storedTheme = storedValues[THEME_STORAGE_KEY];
                if (storedTheme !== null) {
                    setIsDarkMode(storedTheme === 'dark');
                }

                const storedLanguage = storedValues[LANGUAGE_STORAGE_KEY];
                const safeLanguage = normalizeLanguageCode(storedLanguage);
                setLanguage(safeLanguage);

                if (storedLanguage !== safeLanguage) {
                    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
                }

                setIsTutorialCompleted(storedValues[TUTORIAL_STORAGE_KEY] === 'true');
            } catch (error) {
                console.log('Error cargando estado inicial:', error);
            } finally {
                setIsUserDataLoaded(true);
                setIsThemeLoaded(true);
                setIsLanguageLoaded(true);
                setIsTutorialLoaded(true);
            }
        };

        loadPersistedState();
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
            const safeLanguage = normalizeLanguageCode(newLanguage);
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
            setLanguage(safeLanguage);
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

    const tutorialSteps = useMemo(() => ([
        {
            id: 'profile',
            targetKey: 'header.profile',
            title: t.tutorialProfileTitle || 'Tu perfil en un toque',
            description: t.tutorialProfileDescription || 'Aqui puedes acceder a tu perfil para editar tu informacion, foto y preferencias.',
        },
        {
            id: 'register-pet',
            targetKey: 'home.registerPet',
            title: t.tutorialRegisterPetTitle || 'Registra a tu mascota',
            description: t.tutorialRegisterPetDescription || 'Desde aqui registras a tus mascotas para llevar su historial y cuidados.',
        },
        {
            id: 'calendar',
            targetKey: 'home.calendar',
            title: t.tutorialCalendarTitle || 'Calendario y citas',
            description: t.tutorialCalendarDescription || 'Aqui puedes ver el calendario con citas programadas y campanas de vacunacion disponibles.',
        },
        {
            id: 'search',
            targetKey: 'home.search',
            title: t.tutorialSearchTitle || 'Busqueda de cuidados',
            description: t.tutorialSearchDescription || 'Usa esta busqueda para consultar sintomas, cuidados y recomendaciones para tus mascotas.',
        },
        {
            id: 'emergencies',
            targetKey: 'home.emergencies',
            title: t.tutorialEmergenciesTitle || 'Seccion de emergencias',
            description: t.tutorialEmergenciesDescription || 'En emergencias encuentras atencion rapida y contactos utiles cuando cada minuto cuenta.',
        },
        {
            id: 'map',
            targetKey: 'home.vetMap',
            title: t.tutorialMapTitle || 'Mapa de veterinarias',
            description: t.tutorialMapDescription || 'Con Mapa vet puedes ubicar veterinarias cercanas y explorar opciones por zona.',
        },
        {
            id: 'menu',
            targetKey: 'header.menu',
            title: t.tutorialMenuTitle || 'Abre el menu principal',
            description: t.tutorialMenuDescription || 'Desde el menu accedes a funciones como Consejos, Configuracion y otras secciones clave.',
        },
        {
            id: 'tips',
            targetKey: 'menu.tips',
            title: t.tutorialTipsTitle || 'Consejos diarios',
            description: t.tutorialTipsDescription || 'En Consejos veras recomendaciones de bienestar, alimentacion y habitos saludables.',
        },
    ]), [t]);

    const registerTutorialViewport = useCallback((layout) => {
        if (!layout) return;

        setTutorialViewport((prev) => {
            const isSame = prev.x === layout.x
                && prev.y === layout.y
                && prev.width === layout.width
                && prev.height === layout.height;

            if (isSame) return prev;
            return layout;
        });
    }, []);

    const registerTutorialTarget = useCallback((key, layout) => {
        if (!key || !layout) return;

        const normalizedLayout = {
            x: layout.x - tutorialViewport.x,
            y: layout.y - tutorialViewport.y,
            width: layout.width,
            height: layout.height,
        };

        setTutorialTargets((prev) => {
            const current = prev[key];
            const isSame = current
                && current.x === normalizedLayout.x
                && current.y === normalizedLayout.y
                && current.width === normalizedLayout.width
                && current.height === normalizedLayout.height;

            if (isSame) return prev;
            return { ...prev, [key]: normalizedLayout };
        });
    }, [tutorialViewport.x, tutorialViewport.y]);

    const goToTutorialStep = useCallback((newIndex) => {
        const boundedIndex = Math.max(0, Math.min(newIndex, tutorialSteps.length - 1));
        const nextStep = tutorialSteps[boundedIndex];

        if (nextStep?.targetKey === 'menu.tips') {
            setIsMenuOpen(true);
            setIsNotificationsOpen(false);
        } else {
            setIsMenuOpen(false);
        }

        setTutorialStepIndex(boundedIndex);
    }, [tutorialSteps]);

    const maybeStartTutorial = useCallback(() => {
        const canAutoStart = isTutorialPendingStart || !isTutorialCompleted;
        if (!isTutorialLoaded || !canAutoStart || isTutorialVisible || tutorialSteps.length === 0) return false;
        setIsTutorialPendingStart(false);
        setIsTutorialVisible(true);
        goToTutorialStep(0);
        return true;
    }, [goToTutorialStep, isTutorialCompleted, isTutorialLoaded, isTutorialPendingStart, isTutorialVisible, tutorialSteps.length]);

    const queueTutorialStart = useCallback(async () => {
        try {
            await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'false');
        } catch (error) {
            console.log('Error preparando reinicio de tutorial:', error);
        }

        setIsTutorialVisible(false);
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
        setTutorialStepIndex(0);
        setIsTutorialCompleted(false);
        setIsTutorialPendingStart(true);
    }, []);

    const startTutorial = useCallback(async () => {
        try {
            await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'false');
        } catch (error) {
            console.log('Error reiniciando estado de tutorial:', error);
        }
        setIsTutorialPendingStart(false);
        setIsTutorialVisible(true);
        setIsTutorialCompleted(false);
        goToTutorialStep(0);
    }, [goToTutorialStep]);

    const completeTutorial = useCallback(async () => {
        setIsTutorialVisible(false);
        setIsMenuOpen(false);
        setIsTutorialPendingStart(false);
        setTutorialStepIndex(0);
        setIsTutorialCompleted(true);
        try {
            await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        } catch (error) {
            console.log('Error guardando estado de tutorial:', error);
        }
    }, []);

    const skipTutorial = useCallback(async () => {
        await completeTutorial();
    }, [completeTutorial]);

    const nextTutorialStep = useCallback(async () => {
        if (tutorialStepIndex >= tutorialSteps.length - 1) {
            await completeTutorial();
            return;
        }
        goToTutorialStep(tutorialStepIndex + 1);
    }, [completeTutorial, goToTutorialStep, tutorialStepIndex, tutorialSteps.length]);

    const previousTutorialStep = useCallback(() => {
        if (tutorialStepIndex <= 0) return;
        goToTutorialStep(tutorialStepIndex - 1);
    }, [goToTutorialStep, tutorialStepIndex]);

    const value = useMemo(() => ({
        // Estado
        isMenuOpen,
        isNotificationsOpen,
        notifications,
        isOverlayVisible: isMenuOpen || isNotificationsOpen,
        isTutorialVisible,
        tutorialStepIndex,
        tutorialSteps,
        tutorialTargets,
        tutorialViewport,
        isTutorialCompleted,
        isTutorialLoaded,
        isTutorialPendingStart,

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

        // Tutorial guiado
        registerTutorialViewport,
        registerTutorialTarget,
        maybeStartTutorial,
        queueTutorialStart,
        startTutorial,
        nextTutorialStep,
        previousTutorialStep,
        skipTutorial,
        completeTutorial,
    }), [
        isMenuOpen,
        isNotificationsOpen,
        notifications,
        isTutorialVisible,
        tutorialStepIndex,
        tutorialSteps,
        tutorialTargets,
        tutorialViewport,
        isTutorialCompleted,
        isTutorialLoaded,
        isTutorialPendingStart,
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
        registerTutorialViewport,
        registerTutorialTarget,
        maybeStartTutorial,
        queueTutorialStart,
        startTutorial,
        nextTutorialStep,
        previousTutorialStep,
        skipTutorial,
        completeTutorial,
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
