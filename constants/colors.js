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
    primary: '#4ADE80',        // Verde vibrante para oscuro (mejor contraste)
    primaryLight: '#86EFAC',
    primaryDark: '#22C55E',

    // Colores secundarios
    secondary: '#60A5FA',      // Azul vibrante
    secondaryLight: '#93C5FD',

    // Acento cálido
    accent: '#FB923C',         // Naranja coral vibrante

    // Estados
    warning: '#FBBF24',        // Amarillo dorado
    danger: '#F87171',         // Rojo suave
    success: '#4ADE80',        // Verde éxito

    // Fondos (con tinte verdoso cálido)
    background: '#0F1512',     // Negro con tinte verde sutil
    backgroundLight: '#1A201D',
    card: '#232B27',           // Gris verdoso para cards

    // Texto (mejor jerarquía)
    text: '#F1F5F3',           // Blanco suave con tinte verde
    textLight: '#A3B3AB',      // Gris verdoso claro
    textMuted: '#6B7C73',      // Gris verdoso medio
    textWhite: '#FFFFFF',
    placeholder: '#AAAAAA',

    // Bordes y sombras (más sutiles)
    border: '#2E3B35',         // Borde sutil verdoso
    borderLight: '#252E2A',
    shadow: '#000000',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.75)',

    // Chat
    chatUser: '#1F3A24',       // Verde oscuro para burbujas del usuario
    chatBot: '#232B27',

    // Notificaciones
    notificationDot: '#F87171',

    // Input
    inputBackground: '#1A201D',
};

// Colores por defecto (tema claro para compatibilidad)
export const colors = lightTheme;

export default colors;
