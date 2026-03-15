import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Platform,
    Keyboard,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function BuscadorGoogle() {
    const { colors, t } = useApp();
    const [message, setMessage] = useState('');
    const [url, setUrl] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        brandSoft: colors?.primary || '#43A047',
        accent: colors?.accent || '#FF7F5A',
        bg: colors?.backgroundLight || '#F6F8F4',
        card: colors?.background || '#FFFFFF',
        border: colors?.border || '#E4E9E5',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
        inputBg: colors?.inputBackground || '#F6F8F4',
    }), [colors]);

    const doSearch = () => {
        if (!message.trim()) return;
        const googleURL = `https://www.google.com/search?q=${encodeURIComponent(message)}`;
        setUrl(googleURL);
        Keyboard.dismiss();
    };

    useEffect(() => {
        if (Platform.OS !== 'android') return undefined;

        const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
            setKeyboardHeight(event.endCoordinates?.height || 0);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return (
        <ScreenWrapper>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <View
                    style={styles.mainContent}
                    onStartShouldSetResponderCapture={() => {
                        Keyboard.dismiss();
                        return false;
                    }}
                >
                    <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                        <View style={styles.heroTopRow}>
                            <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                                <MaterialCommunityIcons name="google" size={22} color="#FFFFFF" />
                            </View>
                            {url ? (
                                <TouchableOpacity
                                    style={[styles.closeWebBtn, { backgroundColor: theme.accent }]}
                                    onPress={() => setUrl(null)}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="close" size={18} color="#FFFFFF" />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <Text style={styles.heroKicker}>{t.searchKicker || 'BUSQUEDA'}</Text>
                        <Text style={styles.heroTitle}>{t.searchHeroTitle || 'Google para mascotas'}</Text>
                        <Text style={styles.heroSubtitle}>{t.searchHeroSubtitle || 'Investiga sintomas, cuidados, alimentacion y mas.'}</Text>
                    </View>

                    {url ? (
                        <View style={[styles.webViewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <WebView source={{ uri: url }} style={{ flex: 1 }} />
                        </View>
                    ) : (
                        <View style={styles.emptyStateWrap}>
                            <MaterialCommunityIcons name="dog-side" size={46} color={theme.muted} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>{t.searchWelcomeTitle || 'Bienvenido al buscador'}</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.muted }]}>{t.searchWelcomeSubtitle || 'Escribe tu pregunta y abre resultados en Google.'}</Text>
                        </View>
                    )}
                </View>

                <View
                    style={[
                        styles.bottomInputWrap,
                        Platform.OS === 'android' && { paddingBottom: 14 + keyboardHeight },
                    ]}
                >
                    <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="search-outline" size={18} color={theme.muted} style={{ marginRight: 8 }} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder={t.searchPlaceholder || 'Pregunta sobre mascotas'}
                            placeholderTextColor={theme.muted}
                            value={message}
                            onChangeText={setMessage}
                            returnKeyType="search"
                            onSubmitEditing={doSearch}
                        />
                        <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.brand }]} onPress={doSearch}>
                            <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
    },
    heroCard: {
        borderRadius: 18,
        margin: 16,
        marginBottom: 12,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 22,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    heroIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeWebBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroKicker: {
        color: 'rgba(255,255,255,0.74)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.79)',
        fontSize: 13,
        lineHeight: 18,
        marginTop: 6,
    },
    webViewCard: {
        flex: 1,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    emptyStateWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 10,
    },
    emptySubtitle: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 18,
    },
    bottomInputWrap: {
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'android' ? 14 : 24,
        paddingTop: 8,
    },
    inputRow: {
        minHeight: 54,
        borderRadius: 28,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 14,
        paddingRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});