import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useApp } from '../context';
import { ScreenWrapper } from '../components';

export default function Mapa() {
    const { colors } = useApp();
    const [message, setMessage] = useState('');
    const [url, setUrl] = useState('https://www.google.com/maps/search/veterinarias');

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
        const mapsURL = `https://www.google.com/maps/search/${encodeURIComponent(message)}`;
        setUrl(mapsURL);
    };

    return (
        <ScreenWrapper>
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <View style={[styles.heroCard, { backgroundColor: theme.brand }]}>
                    <View style={styles.heroTopRow}>
                        <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                            <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color="#FFFFFF" />
                        </View>
                        <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Text style={styles.pillText}>Veterinarias</Text>
                        </View>
                    </View>
                    <Text style={styles.heroKicker}>MAPAS</Text>
                    <Text style={styles.heroTitle}>Veterinarias cercanas</Text>
                    <Text style={styles.heroSubtitle}>Busca clínicas y ubicaciones rápidas en Google Maps.</Text>
                </View>

                <View style={[styles.webViewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <WebView source={{ uri: url }} style={{ flex: 1 }} />
                </View>

                <KeyboardAvoidingView
                    style={styles.bottomInputWrap}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
                >
                    <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="search-outline" size={18} color={theme.muted} style={{ marginRight: 8 }} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Buscar veterinarias"
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
                </KeyboardAvoidingView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
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
    pill: {
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    pillText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
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