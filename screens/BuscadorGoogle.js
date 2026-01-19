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

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MENU_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT;

const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 90;

export default function BuscadorGoogle() {

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
            <View style={styles.container}>
                <StatusBar style="auto" />

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                        <MaterialIcons name="menu" size={32} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* CONTENIDO */}
                <View style={styles.content}>

                    {/* PANTALLA INICIAL */}
                    {isInitial && (
                        <View style={styles.centerContent}>
                            <Text style={styles.title}>Buscador 4PetsCare</Text>
                            <MaterialCommunityIcons name="paw" size={40} />

                            <View style={styles.centerInput}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Buscar en Google..."
                                    value={message}
                                    onChangeText={setMessage}
                                    onSubmitEditing={sendMessage}
                                />
                                <TouchableOpacity onPress={sendMessage}>
                                    <MaterialCommunityIcons name="send" size={22} />
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
                                <View key={msg.id} style={styles.messageBubble}>
                                    <Text>{msg.text}</Text>
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
                        { transform: [{ translateX: isMenuOpen ? 0 : -300 }] }
                    ]}
                >
                    <View style={styles.menuHeader}>
                        <Text style={styles.menuTitle}>Menú</Text>
                        <TouchableOpacity onPress={toggleMenu}>
                            <Ionicons name="close" size={30} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Home'); }}>
                            <Ionicons name="home" size={24} />
                            <Text style={styles.menuItemText}>Inicio</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}>
                            <Ionicons name="paw-outline" size={30} color="#4BCF5C" />
                            <Text style={styles.menuItemText}>Mascotas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}>
                            <Ionicons name="calendar-number" size={30} color="#007AFF" />
                            <Text style={styles.menuItemText}>Calendario</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Consejos'); }}>
                            <MaterialIcons name="tips-and-updates" size={30} color="#FF9500" />
                            <Text style={styles.menuItemText}>Consejos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('Emergencias'); }}>
                            <MaterialIcons name="emergency" size={30} color="#FF3B30" />
                            <Text style={styles.menuItemText}>Emergencias</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        height: HEADER_HEIGHT,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
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
        backgroundColor: '#e9e9e9',
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
        backgroundColor: '#DCF8C6',
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
        backgroundColor: '#fff',
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
        paddingVertical: 20
    },

    menuItemText: {
        fontSize: 18,
        marginLeft: 15
    }
});
