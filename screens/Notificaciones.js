import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform, LogBox } from 'react-native';

const STORAGE_KEY = '@notificaciones_guardadas';

// Ignorar el warning de expo-notifications en Expo Go (las notificaciones locales sí funcionan)
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

// Configurar cómo se muestran las notificaciones cuando la app está abierta
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
} catch (error) {
    console.log('NotificationHandler setup skipped:', error.message);
}

class NotificationService {
    constructor() {
        this.notificationsData = [];
        this.interval = null;
        this.notificationsAvailable = true;
        this.init();
    }

    async init() {
        try {
            // 1. Solicitar permisos de notificaciones
            this.notificationsAvailable = await this.requestPermissions();

            // 2. Cargar notificaciones guardadas (Si existen)
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            this.notificationsData = saved ? JSON.parse(saved) : [];

            // 3. Limpiar historial al iniciar
            await this.clearNotifications();

            // 4. Iniciar envío automático (solo guarda internamente)
            this.startAutoNotifications(180);
        } catch (error) {
            console.log('NotificationService init error:', error.message);
            this.notificationsAvailable = false;
        }
    }

    /**
     * Solicita permisos para enviar notificaciones locales
     */
    async requestPermissions() {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Permisos de notificación no concedidos');
                return false;
            }

            // Configuración específica para Android
            if (Platform.OS === 'android') {
                try {
                    await Notifications.setNotificationChannelAsync('citas', {
                        name: 'Recordatorios de Citas',
                        importance: Notifications.AndroidImportance.HIGH,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: '#4CAF50',
                    });
                } catch (channelError) {
                    console.log('Channel setup skipped:', channelError.message);
                }
            }

            return true;
        } catch (error) {
            console.log('Error solicitando permisos:', error.message);
            return false;
        }
    }

    /**
     * Programa una notificación push local para una cita
     * @param {Object} cita - Objeto con datos de la cita (incluye hora)
     * @param {number} horasAntes - Horas antes de la cita para notificar (default: 24)
     * @returns {string|null} - ID de la notificación programada
     */
    async scheduleAppointmentNotification(cita, horasAntes = 24) {
        try {
            const { id, usuario, veterinaria, fecha, hora } = cita;

            // Parsear la fecha (formato YYYY-MM-DD)
            const [year, month, day] = fecha.split('-').map(Number);

            // Parsear la hora (formato HH:MM) o usar 9:00 por defecto
            let appointmentHour = 9;
            let appointmentMinute = 0;
            if (hora) {
                const [h, m] = hora.split(':').map(Number);
                appointmentHour = h;
                appointmentMinute = m;
            }

            const appointmentDate = new Date(year, month - 1, day, appointmentHour, appointmentMinute, 0);

            // Formatear hora para mostrar (12h con AM/PM)
            const formatTimeDisplay = (h, m) => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const formattedH = h % 12 || 12;
                const formattedM = m < 10 ? `0${m}` : m;
                return `${formattedH}:${formattedM} ${ampm}`;
            };
            const horaDisplay = formatTimeDisplay(appointmentHour, appointmentMinute);

            // Formatear fecha para el mensaje
            const dateFormatted = new Date(year, month - 1, day).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

            // Guardar en el historial interno (esto siempre funciona)
            await this.saveNotification(`📅 Cita programada: ${usuario} en ${veterinaria} el ${dateFormatted} a las ${horaDisplay}`);

            // Si las notificaciones del sistema no están disponibles, solo guardamos en historial
            if (!this.notificationsAvailable) {
                console.log('Notificaciones del sistema no disponibles, guardado solo en historial');
                return null;
            }

            // Calcular cuándo enviar la notificación (horasAntes antes de la cita)
            const notificationDate = new Date(appointmentDate.getTime() - horasAntes * 60 * 60 * 1000);

            // Si la fecha ya pasó, programar para el mismo día
            const now = new Date();
            if (notificationDate <= now) {
                // Si la cita es hoy y aún no ha pasado, notificar de inmediato
                if (appointmentDate.toDateString() === now.toDateString() && now < appointmentDate) {
                    // Notificar en 5 segundos si la cita es hoy
                    const trigger = { seconds: 5 };
                    const notificationId = await Notifications.scheduleNotificationAsync({
                        content: {
                            title: '🐾 ¡Cita veterinaria hoy!',
                            body: `${usuario} tiene cita en ${veterinaria} a las ${horaDisplay}`,
                            data: { citaId: id, tipo: 'cita' },
                            sound: true,
                        },
                        trigger,
                    });

                    // Guardar el ID de la notificación asociado a la cita
                    await this.saveNotificationId(id, notificationId);
                    console.log(`Notificación programada para hoy: ${notificationId}`);
                    return notificationId;
                }
                console.log('La fecha de notificación ya pasó');
                return null;
            }

            // Programar la notificación
            const secondsUntilNotification = Math.floor((notificationDate - now) / 1000);

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🐾 Recordatorio de cita',
                    body: `${usuario} tiene cita mañana en ${veterinaria} a las ${horaDisplay}`,
                    data: { citaId: id, tipo: 'cita' },
                    sound: true,
                },
                trigger: {
                    seconds: secondsUntilNotification,
                    channelId: Platform.OS === 'android' ? 'citas' : undefined,
                },
            });

            // Guardar el ID de la notificación asociado a la cita
            await this.saveNotificationId(id, notificationId);

            console.log(`Notificación programada para ${notificationDate.toLocaleString()}: ${notificationId}`);

            return notificationId;
        } catch (error) {
            console.log('Error programando notificación:', error.message);
            return null;
        }
    }

    /**
     * Cancela una notificación programada para una cita
     * @param {string} citaId - ID de la cita
     */
    async cancelAppointmentNotification(citaId) {
        try {
            if (!this.notificationsAvailable) return;

            const notificationId = await this.getNotificationId(citaId);
            if (notificationId) {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
                await this.removeNotificationId(citaId);
                console.log(`Notificación cancelada: ${notificationId}`);
            }
        } catch (error) {
            console.log('Error cancelando notificación:', error.message);
        }
    }

    /**
     * Guarda la relación entre cita y notificación
     */
    async saveNotificationId(citaId, notificationId) {
        const key = '@notification_ids';
        const saved = await AsyncStorage.getItem(key);
        const mapping = saved ? JSON.parse(saved) : {};
        mapping[citaId] = notificationId;
        await AsyncStorage.setItem(key, JSON.stringify(mapping));
    }

    /**
     * Obtiene el ID de notificación para una cita
     */
    async getNotificationId(citaId) {
        const key = '@notification_ids';
        const saved = await AsyncStorage.getItem(key);
        const mapping = saved ? JSON.parse(saved) : {};
        return mapping[citaId] || null;
    }

    /**
     * Elimina la relación entre cita y notificación
     */
    async removeNotificationId(citaId) {
        const key = '@notification_ids';
        const saved = await AsyncStorage.getItem(key);
        const mapping = saved ? JSON.parse(saved) : {};
        delete mapping[citaId];
        await AsyncStorage.setItem(key, JSON.stringify(mapping));
    }

    /**
     * Obtiene todas las notificaciones programadas (para debug)
     */
    async getAllScheduledNotifications() {
        return await Notifications.getAllScheduledNotificationsAsync();
    }

    /**
     * @returns {number} Cantidad de notificaciones internas no vistas.
     */
    async getUnreadCount() {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const data = saved ? JSON.parse(saved) : [];
        return data.filter(n => !n.visto).length;
    }

    /**
     * Marca todas las notificaciones internas como vistas.
     */
    async markAllAsRead() {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        let data = saved ? JSON.parse(saved) : [];

        data = data.map(n => ({
            ...n,
            visto: true
        }));

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        this.notificationsData = data;
        console.log("Todas las notificaciones internas marcadas como vistas.");
    }

    /**
     * Limpia completamente el historial de notificaciones.
     */
    async clearNotifications() {
        this.notificationsData = [];
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log("Historial de notificaciones internas limpiado.");
    }

    /**
     * Guarda la notificación en el historial interno (AsyncStorage).
     */
    async saveNotification(text) {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        this.notificationsData = saved ? JSON.parse(saved) : [];

        const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });

        const notif = {
            id: Date.now(),
            text,
            date: now,
            visto: false
        };

        this.notificationsData.unshift(notif);
        this.notificationsData = this.notificationsData.slice(0, 50);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.notificationsData));
    }

    /**
     * Obtener todas las notificaciones guardadas (para el panel)
     */
    async getNotifications() {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const data = saved ? JSON.parse(saved).sort((a, b) => b.id - a.id) : [];
        this.notificationsData = data;
        return data;
    }

    /**
     * Inicia el temporizador para guardar notificaciones automáticas.
     */
    startAutoNotifications(intervalSeconds = 300) {
        if (this.interval) clearInterval(this.interval);

        const mensajes = [
            '¡Revisa tus mascotas!',
            'Recuerda la próxima cita.',
            'Es hora de la vacuna.',
            'No olvides tus tareas de hoy.',
            'Hora de comer: ¡Sirve el alimento de tu mascota!',
            'Paseo pendiente: ¡Saca a tu amigo peludo a estirar las patas!',
            'Medicación importante: Administra la dosis de hoy.',
            'Chequeo mensual: Revisa el peso y la piel de tu compañero.',
            'Momento de mimos: ¡Dale un abrazo y juega con tu mascota!',
            'Falta poco: Revisa el calendario para los próximos eventos.',
            'Día de baño: ¡No olvides cepillar o bañar a tu mascota!',
            '¡Que no falte el agua! Asegúrate de que su cuenco esté lleno.',
            'Anti-pulgas: Recuerda aplicar el tratamiento preventivo.',
        ];

        this.interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * mensajes.length);
            const message = mensajes[randomIndex];

            // Solo guardamos en el historial interno (AsyncStorage).
            this.saveNotification(message);

        }, intervalSeconds * 1000);
    }

    stopAutoNotifications() {
        if (this.interval) clearInterval(this.interval);
    }
}

// Exportar una sola instancia
export default new NotificationService();