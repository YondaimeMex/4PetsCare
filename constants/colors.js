// Sistema de colores centralizado para 4PetsCare

// Tema claro
export const lightTheme = {
    // Colores primarios
    primary: '#43A047',        // Verde principal (más profundo)
    primaryLight: '#81C784',
    primaryDark: '#388E3C',

    // Colores secundarios
    secondary: '#007AFF',      // Azul
    secondaryLight: '#5AC8FA',

    // Acento cálido
    accent: '#FF8A65',         // Coral para CTAs especiales

    // Estados
    warning: '#FF9500',        // Naranja
    danger: '#FF3B30',         // Rojo
    success: '#4BCF5C',        // Verde éxito

    // Fondos
    background: '#FFFFFF',
    backgroundLight: '#F5F5F5',
    card: '#F8F9FA',           // Gris más suave

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

    // Input
    inputBackground: '#FFFFFF',
};

// Tema oscuro
export const darkTheme = {
    // Colores primarios
    primary: '#5FAF7C',        // Verde de marca en modo oscuro
    primaryLight: '#7BC394',
    primaryDark: '#4C8F66',

    // Colores secundarios
    secondary: '#6FA8D6',      // Azul de apoyo para contraste
    secondaryLight: '#8DBDDF',

    // Acento cálido
    accent: '#D7BA7D',         // Ámbar suave tipo editor

    // Estados
    warning: '#CCA86A',
    danger: '#D16969',
    success: '#6A9955',

    // Fondos
    background: '#1E1E1E',
    backgroundLight: '#252526',
    card: '#2D2D30',

    // Texto
    text: '#D4D4D4',
    textLight: '#B8B8B8',
    textMuted: '#9DA3A8',
    textWhite: '#FFFFFF',
    placeholder: '#8B949E',

    // Bordes y sombras
    border: '#3C3C3C',
    borderLight: '#323233',
    shadow: '#000000',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',

    // Chat
    chatUser: '#263238',
    chatBot: '#2D2D30',

    // Notificaciones
    notificationDot: '#D16969',

    // Input
    inputBackground: '#252526',
};

// Colores por defecto (tema claro para compatibilidad)
export const colors = lightTheme;

export default colors;
