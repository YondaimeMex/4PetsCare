// Sistema de colores centralizado para 4PetsCare

// Tema claro
export const lightTheme = {
    // Colores primarios
    primary: '#4CAF50',        // Verde principal
    primaryLight: '#81C784',
    primaryDark: '#388E3C',

    // Colores secundarios
    secondary: '#007AFF',      // Azul
    secondaryLight: '#5AC8FA',

    // Estados
    warning: '#FF9500',        // Naranja
    danger: '#FF3B30',         // Rojo
    success: '#4BCF5C',        // Verde éxito

    // Fondos
    background: '#FFFFFF',
    backgroundLight: '#F5F5F5',
    card: '#E8E8E8',

    // Texto
    text: '#333333',
    textLight: '#666666',
    textMuted: '#999999',
    textWhite: '#FFFFFF',
    

    // Bordes y sombras
    border: '#E0E0E0',
    borderLight: '#EEEEEE',
    shadow: '#000000',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Chat
    chatUser: '#DCF8C6',
    chatBot: '#EAEAEA',

    // Notificaciones
    notificationDot: '#FF3B30',
};

// Tema oscuro
export const darkTheme = {
    // Colores primarios
    primary: '#66BB6A',        // Verde más brillante para oscuro
    primaryLight: '#81C784',
    primaryDark: '#388E3C',

    // Colores secundarios
    secondary: '#64B5F6',      // Azul más brillante
    secondaryLight: '#90CAF9',

    // Estados
    warning: '#FFB74D',        // Naranja
    danger: '#EF5350',         // Rojo
    success: '#81C784',        // Verde éxito

    // Fondos
    background: '#121212',
    backgroundLight: '#1E1E1E',
    card: '#2D2D2D',

    // Texto
    text: '#FFFFFF',
    textLight: '#B0B0B0',
    textMuted: '#808080',
    textWhite: '#FFFFFF',
    placeholder: '#AAAAAA',

    // Bordes y sombras
    border: '#3D3D3D',
    borderLight: '#2D2D2D',
    shadow: '#000000',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Chat
    chatUser: '#2E5428',
    chatBot: '#2D2D2D',

    // Notificaciones
    notificationDot: '#EF5350',
};

// Colores por defecto (tema claro para compatibilidad)
export const colors = lightTheme;

export default colors;
