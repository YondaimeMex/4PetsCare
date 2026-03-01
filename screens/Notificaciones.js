import AsyncStorage from '@react-native-async-storage/async-storage';
// Eliminamos la importación de 'Platform' y 'expo-notifications' para evitar errores en Expo Go

const STORAGE_KEY = '@notificaciones_guardadas';

class NotificationService {
    constructor() {
        this.notificationsData = [];
        this.interval = null;
        this.init();
    }

    async init() {
        // 1. Cargar notificaciones guardadas (Si existen)
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        this.notificationsData = saved ? JSON.parse(saved) : [];

        // 2. CORRECCIÓN REVERTIDA: Reinsertamos la llamada a clearNotifications().
        // Esto asegura que cada vez que la aplicación se inicie/recargue, el historial anterior se borre, 
        // cumpliendo con la solicitud de limpiar al "cerrar/presentar".
        await this.clearNotifications();

        // 3. Iniciar envío automático (solo guarda internamente, ya no dispara el sistema)
        this.startAutoNotifications(180);
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
        // Cargar la data actual para asegurar que estamos actualizando la última versión
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        let data = saved ? JSON.parse(saved) : [];

        // Mapea y marca como vistas
        data = data.map(n => ({
            ...n,
            visto: true
        }));

        // Guardar la data actualizada
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        this.notificationsData = data; // Actualizar la instancia local
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
        // Recargar la data para manejar concurrencia
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        this.notificationsData = saved ? JSON.parse(saved) : [];

        const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });

        // AÑADIMOS 'visto: false' a cada nueva notificación
        const notif = {
            id: Date.now(), // Añadir un ID único
            text,
            date: now,
            visto: false
        };

        // Guardar solo las 50 más recientes
        this.notificationsData.unshift(notif);
        this.notificationsData = this.notificationsData.slice(0, 50);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.notificationsData));
    }

    /**
     * Obtener todas las notificaciones guardadas (para el panel)
     */
    async getNotifications() {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        // Aseguramos que la lista se muestre de más reciente a más antigua
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