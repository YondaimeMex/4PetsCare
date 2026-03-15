export const buildFormTheme = (colors) => ({
    brand: colors?.primaryDark || '#2F6E4F',
    brandSoft: colors?.primary || '#43A047',
    accent: colors?.accent || '#FF7F5A',
    bg: colors?.backgroundLight || '#F6F8F4',
    card: colors?.background || '#FFFFFF',
    border: colors?.border || '#E4E9E5',
    text: colors?.text || '#22352D',
    muted: colors?.textMuted || '#5D6E64',
    inputBg: colors?.inputBackground || '#F6F8F4',
});

export const getSingleSelectedMarkedDates = (selectedDate, selectedColor) => {
    if (!selectedDate) return {};

    return {
        [selectedDate]: { selected: true, selectedColor },
    };
};
