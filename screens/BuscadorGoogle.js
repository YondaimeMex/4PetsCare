import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Platform,
    KeyboardAvoidingView
} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { useApp } from '../context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MENU_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT;

const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 90;

export default function BuscadorGoogle() {
    const { colors, t } = useApp();
    const navigation = useNavigation();
    const scrollViewRef = useRef(null);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [searchUrl, setSearchUrl] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isInitial = !searchUrl && messages.length === 0;

    const toggleMenu = () => setIsMenuOpen(prev => !prev);

    const sendMessage = () => {
        if (!message.trim()) return;

        const query = encodeURIComponent(message.trim());
        setMessages(prev => [...prev, { id: Date.now(), text: message }]);
        setSearchUrl(`https://www.google.com/search?q=${query}`);
        setMessage('');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar style={colors.background === '#121212' ? 'light' : 'auto'} />

                {/* HEADER */}
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                        <MaterialIcons name="menu" size={32} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* CONTENIDO */}
                <View style={styles.content}>

                    {/* PANTALLA INICIAL */}
                    {isInitial && (
                        <View style={styles.centerContent}>
                            <Text style={[styles.title, { color: colors.text }]}>Buscador 4PetsCare</Text>
                            <MaterialCommunityIcons name="paw" size={40} color={colors.primary} />

                            <View style={[styles.centerInput, { backgroundColor: colors.backgroundLight }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Buscar en Google..."
                                    placeholderTextColor={colors.textMuted}
                                    value={message}
                                    onChangeText={setMessage}
                                    onSubmitEditing={sendMessage}
                                />
                                <TouchableOpacity onPress={sendMessage}>
                                    <MaterialCommunityIcons name="send" size={22} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* MENSAJES (opcional, antes de buscar) */}
                    {!isInitial && !searchUrl && (
                        <ScrollView
                            ref={scrollViewRef}
                            onContentSizeChange={() =>
                                scrollViewRef.current?.scrollToEnd({ animated: true })
                            }
                        >
                            {messages.map(msg => (
                                <View key={msg.id} style={[styles.messageBubble, { backgroundColor: colors.secondary }]}>
                                    <Text style={{ color: colors.text }}>{msg.text}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    {/* GOOGLE */}
                    {searchUrl && (
                        <WebView source={{ uri: searchUrl }} />
                    )}
                </View>

                {/* OVERLAY */}
                {isMenuOpen && (
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={toggleMenu}
                    />
                )}

                {/* MENÚ LATERAL */}
                <View
                    style={[
                        styles.sideMenu,
                        { transform: [{ translateX: isMenuOpen ? 0 : -300 }], backgroundColor: colors.card }
                    ]}
                >
                    <View style={styles.menuHeader}>
                        <Text style={[styles.menuTitle, { color: colors.text }]}>{t.menu}</Text>
                        <TouchableOpacity onPress={toggleMenu}>
                            <Ionicons name="close" size={30} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Home'); }}>
                            <Ionicons name="home" size={24} color={colors.text} />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t.home}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}>
                            <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t.pets}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}>
                            <Ionicons name="calendar-number" size={30} color="#007AFF" />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t.calendar}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Consejos'); }}>
                            <MaterialIcons name="tips-and-updates" size={30} color="#FF9500" />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t.tips}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => { toggleMenu(); navigation.navigate('Emergencias'); }}>
                            <MaterialIcons name="emergency" size={30} color="#FF3B30" />
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t.emergencies}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        height: HEADER_HEIGHT,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: 20,
        justifyContent: 'center',
        zIndex: 10
    },

    menuButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center'
    },

    content: { flex: 1 },

    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },

    centerInput: {
        flexDirection: 'row',
        borderRadius: 30,
        paddingHorizontal: 15,
        alignItems: 'center',
        width: '85%',
        marginTop: 20
    },

    input: {
        flex: 1,
        height: 50
    },

    messageBubble: {
        alignSelf: 'flex-end',
        padding: 10,
        borderRadius: 10,
        margin: 10
    },

    overlay: {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000080',
        zIndex: 15
    },

    sideMenu: {
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: 0,
        width: 280,
        height: MENU_HEIGHT,
        padding: 20,
        zIndex: 20,
        elevation: 10
    },

    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30
    },

    menuTitle: {
        fontSize: 22,
        fontWeight: 'bold'
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1
    },

    menuItemText: {
        fontSize: 18,
        marginLeft: 15
    }
});
