import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Platform,
    KeyboardAvoidingView
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
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

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar style="auto" />

            {/* TEXTO CENTRAL */}
            <View style={styles.content}>
                <View style={styles.centerMessageContainer}>
                    <Text style={[styles.centerMessage, { color: colors.text }]}>
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
                <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.inputRow, { backgroundColor: isDarkMode ? colors.background : '#e9e9e9' }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Buscar veterinarias"
                            placeholderTextColor="#9b9b9b"
                            value={message}
                            onChangeText={setMessage}
                        />

                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: colors.card }]}
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
                <View style={[styles.webViewContainer, { backgroundColor: colors.background }]}>
                    <WebView source={{ uri: url }} />
                </View>
            )}
        </SafeAreaView>
    );
}

// ================== ESTILOS ==================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        width: '100%',
        marginBottom: 30,
        zIndex: 50,
    },

    headerRight: {
        flexDirection: 'row',
        width: '45%',
        justifyContent: 'space-between',
    },

    menuHamburguesa: {
        padding: 5,
    },

    headerIcon: {
        padding: 5,
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000080',
        zIndex: 10,
    },

    sideMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#fff',
        padding: 20,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        flex: 1,
    },

    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 30,
    },

    menuTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    menuItemText: {
        fontSize: 18,
        marginLeft: 15,
        color: '#333',
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
        fontWeight: '700'
    },

    inputContainer: {
        paddingBottom: Platform.OS === 'android' ? 12 : 25,
        paddingTop: 10,
        backgroundColor: '#fff'
    },

    inputRow: {
        width: '92%',
        height: 54,
        backgroundColor: '#e9e9e9',
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        alignSelf: 'center'
    },

    input: {
        flex: 1,
        fontSize: 15
    },

    sendButton: {
        width: 48,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    webViewContainer: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 100
    }
});

// Estilos para las notificaciones
const notificationStyles = StyleSheet.create({
    notificationsContainer: {
        position: 'absolute',
        top: 100,
        right: 30,
        width: 300,
        maxHeight: 400,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        padding: 15,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: 'black',
    },
    list: {
        flexGrow: 0,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
        marginRight: 10,
        marginTop: 5,
        flexShrink: 0,
    },
    notificationText: {
        fontSize: 16,
        flexShrink: 1,
    },
});
