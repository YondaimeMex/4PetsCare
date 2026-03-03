// Sistema de tipografía para 4PetsCare
import { lightTheme } from './colors';

// Usar lightTheme como colores por defecto para la tipografía
const colors = lightTheme;

export const typography = {
    // Títulos
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 5,
    },

    // Cuerpo
    body: {
        fontSize: 16,
        color: colors.text,
    },
    bodySmall: {
        fontSize: 14,
        color: colors.textLight,
    },

    // Etiquetas
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textLight,
    },
    caption: {
        fontSize: 12,
        color: colors.textMuted,
    },

    // Menú
    menuItem: {
        fontSize: 18,
        color: colors.text,
    },

    // Botones
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
};

export default typography;
