import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    TextInput, Platform, KeyboardAvoidingView, SafeAreaView
} from 'react-native';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import React from 'react';
import axios from "axios";
import Markdown from "react-native-markdown-display";

/*------------------------------------------------------------
Pantalla principal del ChatBot
------------------------------------------------------------*/
export default function ChatBot() {

    const navigation = useNavigation();
    let scrollViewRef = null;

    /*--------------------------------------------------------
    Estados de la interfaz
    --------------------------------------------------------*/
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    /*--------------------------------------------------------
    Control del menú lateral (hamburguesa)
    --------------------------------------------------------*/
    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    /* Cerrar el menú cuando se hace clic fuera */
    const handleOverlayClick = () => {
        if (isMenuOpen) toggleMenu();
    };

    const isOverlayVisible = isMenuOpen;

    /*--------------------------------------------------------
    Enviar mensaje al backend IA
    --------------------------------------------------------*/
    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { role: "user", content: message };
        setChatMessages(prev => [...prev, userMessage]);
        setMessage("");

        try {
            const response = await axios.post("http://192.168.1.79:3000/api/chat", { message });

            const botMessage = {
                role: "assistant",
                content: response.data.reply
            };

            setChatMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error al conectar con IA:", error);

            const errorMsg = {
                role: "assistant",
                content: "Error: No pude conectar con el servidor de IA."
            };

            setChatMessages(prev => [...prev, errorMsg]);
        }
    };

    /*--------------------------------------------------------
    Render principal
    --------------------------------------------------------*/
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>

            {/* Evita que el teclado tape el input */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View style={styles.container}>
                    <StatusBar style="auto" />

                    {/*--------------------------------------------------------
                    Encabezado (solo botón de menú)
                    --------------------------------------------------------*/}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.menuHamburguesa} onPress={toggleMenu}>
                            <MaterialIcons name="menu" size={32} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/*--------------------------------------------------------
                    Contenedor del chat
                    --------------------------------------------------------*/}
                    <View style={styles.chatContainer}>

                        {/* Mensaje inicial cuando no hay mensajes */}
                        {chatMessages.length === 0 && (
                            <View style={styles.welcomeBox}>
                                <Text style={styles.centerMessage}>Bienvenido al ChatBot 4PetsCare</Text>
                                <MaterialCommunityIcons name="dog" size={40} color="black" />
                            </View>
                        )}

                        {/* Scroll del chat */}
                        <ScrollView
                            style={styles.chatScroll}
                            contentContainerStyle={{
                                paddingTop: 20,
                                paddingBottom: 100 // no cubrir mensajes con input
                            }}
                            ref={(ref) => (scrollViewRef = ref)}
                            onContentSizeChange={() => scrollViewRef?.scrollToEnd({ animated: true })}
                        >
                            {chatMessages.map((msg, index) => (
                                <View
                                    key={index}
                                    style={{
                                        alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                        backgroundColor: msg.role === "user" ? "#DCF8C6" : "#EAEAEA",
                                        borderRadius: 10,
                                        padding: 10,
                                        marginVertical: 5,
                                        maxWidth: "80%"
                                    }}
                                >
                                    <Markdown style={markdownStyles}>{msg.content}</Markdown>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/*--------------------------------------------------------
                    Input inferior
                    --------------------------------------------------------*/}
                    <View style={styles.bottomInputWrapper}>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Pregunta sobre mascotas"
                                placeholderTextColor="#9b9b9b"
                                value={message}
                                onChangeText={setMessage}
                                returnKeyType="send"
                                onSubmitEditing={sendMessage}
                            />

                            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                                <MaterialCommunityIcons name="send" size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/*--------------------------------------------------------
                    Cerrar menú al tocar fuera
                    --------------------------------------------------------*/}
                    {isOverlayVisible && (
                        <TouchableOpacity
                            style={styles.overlay}
                            activeOpacity={1}
                            onPress={handleOverlayClick}
                        />
                    )}

                    {/*--------------------------------------------------------
                    Menú lateral
                    --------------------------------------------------------*/}
                    <View
                        style={[
                            styles.sideMenu,
                            { transform: [{ translateX: isMenuOpen ? 0 : -300 }] }
                        ]}
                    >
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>Menú</Text>
                            <TouchableOpacity onPress={toggleMenu}>
                                <MaterialIcons name="close" size={30} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <MaterialCommunityIcons name="home" size={24} color="black" />
                            <Text style={styles.menuItemText}>Inicio</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { toggleMenu(); navigation.navigate('Mascotas'); }}
                        >
                            <MaterialCommunityIcons name="paw-outline" size={30} color="#4BCF5C" />
                            <Text style={styles.menuItemText}>Mascotas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { toggleMenu(); navigation.navigate('Calendario'); }}
                        >
                            <MaterialCommunityIcons name="calendar-month" size={30} color="#007AFF" />
                            <Text style={styles.menuItemText}>Calendario</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { toggleMenu(); navigation.navigate('Consejos'); }}
                        >
                            <MaterialCommunityIcons name="lightbulb-on-outline" size={30} color="#FF9500" />
                            <Text style={styles.menuItemText}>Consejos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { toggleMenu(); navigation.navigate('Emergencias'); }}
                        >
                            <MaterialCommunityIcons name="alert" size={30} color="#FF3B30" />
                            <Text style={styles.menuItemText}>Emergencias</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/*------------------------------------------------------------
Estilos principales
------------------------------------------------------------*/
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 6,
        backgroundColor: '#fff',
    },

    menuHamburguesa: {
        padding: 5,
    },

    /* Chat */
    chatContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },

    chatScroll: {
        flex: 1,
    },

    welcomeBox: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 20,
    },

    centerMessage: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
    },

    /* Input */
    bottomInputWrapper: {
        width: "100%",
        paddingHorizontal: 10,
        paddingBottom: Platform.OS === "ios" ? 20 : 10,
        backgroundColor: "#fff",
    },

    inputRow: {
        width: '100%',
        height: 54,
        backgroundColor: '#e9e9e9',
        borderRadius: 28,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },

    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },

    sendButton: {
        width: 48,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },

    /* Overlay */
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000080',
        zIndex: 20,
    },

    /* Menú lateral */
    sideMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 280,
        backgroundColor: '#fff',
        padding: 20,
        zIndex: 40,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
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
        paddingVertical: 40,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    menuItemText: {
        fontSize: 18,
        marginLeft: 15,
        color: '#333',
    },
});

/*------------------------------------------------------------
Estilos de Markdown (negritas, cursivas, etc.)
------------------------------------------------------------*/
const markdownStyles = {
    body: {
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0.2,
        color: "#111",
    },
    strong: { fontWeight: "700" },
    em: { fontStyle: "italic" },
};