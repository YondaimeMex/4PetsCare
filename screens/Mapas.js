import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Platform,
    KeyboardAvoidingView
} from 'react-native';

import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context';

export default function Mapa() {
    const { colors, t, isDarkMode } = useApp();

    const [message, setMessage] = useState('');
    const [url, setUrl] = useState(
        'https://www.google.com/maps/search/veterinarias'
    );

    const styles = getStyles(colors);

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar style={isDarkMode ? 'light' : 'dark'} />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <MaterialIcons name="menu" size={32} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <Ionicons name="notifications" size={32} color={colors.text} />
                    <Ionicons name="person-circle-outline" size={32} color={colors.text} />
                </View>
            </View>

            {/* TEXTO CENTRAL */}
            <View style={styles.content}>
                <View style={styles.centerMessageContainer}>
                    <Text style={styles.centerMessage}>
                        Veterinarias cercanas
                    </Text>
                    <MaterialCommunityIcons
                        name="map-marker-radius"
                        size={40}
                        color={colors.text}
                        style={{ marginTop: 20 }}
                    />
                </View>
            </View>

            {/* INPUT */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 15 : 0}
            >
                <View style={styles.inputContainer}>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Buscar veterinarias"
                            placeholderTextColor="#9b9b9b"
                            value={message}
                            onChangeText={setMessage}
                        />

                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={() => {
                                if (!message.trim()) return;

                                const mapsURL =
                                    'https://www.google.com/maps/search/' +
                                    encodeURIComponent(message);

                                setUrl(mapsURL);
                            }}
                        >
                            <MaterialCommunityIcons name="send" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* MAPA */}
            {url && (
                <View style={styles.webViewContainer}>
                    <WebView source={{ uri: url }} />
                </View>
            )}

        </SafeAreaView>
    );
}

const getStyles = (colors) => ({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 15
    },

    headerRight: {
        flexDirection: 'row',
        gap: 15
    },

    content: {
        flex: 1
    },

    centerMessageContainer: {
        alignItems: 'center',
        paddingTop: 120
    },

    centerMessage: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text
    },

    inputContainer: {
        paddingBottom: Platform.OS === 'android' ? 12 : 25,
        paddingTop: 10,
        backgroundColor: colors.background
    },

    inputRow: {
        width: '92%',
        height: 54,
        backgroundColor: colors.inputBackground,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        alignSelf: 'center'
    },

    input: {
        flex: 1,
        fontSize: 15,
        color: colors.text
    },

    sendButton: {
        width: 48,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center'
    },

    webViewContainer: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        zIndex: 100
    }
});
