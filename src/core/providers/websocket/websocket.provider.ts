import WebSocketService from './websocket.service';
import {
    WebSocketEvent,
    WebSocketConfig,
    ConnectionState,
    EventHandler,
    NewMessageEventData,
    MessageStatusChangedEventData,
    MessageUpdatedEventData,
    MessageDeletedEventData,
    ConversationCreatedEventData,
    ConversationUpdatedEventData,
    ConversationDeletedEventData,
    ParticipantEventData,
    UserTypingEventData,
    UserPresenceEventData,
    NotificationEventData,
} from './websocket.types';

/**
 * Provider para WebSocket siguiendo el mismo patrón de AuthProvider
 */
export default class WebSocketProvider {
    private static service = WebSocketService;

    /**
     * Inicializar conexión WebSocket
     */
    static connect(config?: Partial<WebSocketConfig>): void {
        const defaultConfig: WebSocketConfig = {
            url: process.env.VUE_APP_WS_URL || process.env.VUE_APP_API_URL || 'http://localhost:3000',
            path: '/socket.io',
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
            transports: ['websocket', 'polling'],
        };

        this.service.connect({ ...defaultConfig, ...config });
    }

    /**
     * Desconectar WebSocket
     */
    static disconnect(): void {
        this.service.disconnect();
    }

    /**
     * Reconectar WebSocket
     */
    static reconnect(): void {
        this.service.reconnect();
    }

    /**
     * Verificar si está conectado
     */
    static isConnected(): boolean {
        return this.service.isConnected();
    }

    /**
     * Obtener estado de conexión
     */
    static getConnectionState(): ConnectionState {
        return this.service.getConnectionState();
    }

    /**
     * Autenticar con token
     */
    static authenticate(token: string): void {
        this.service.authenticate(token);
    }

    /**
     * Unirse a una sala
     */
    static joinRoom(room: string): void {
        this.service.joinRoom(room);
    }

    /**
     * Salir de una sala
     */
    static leaveRoom(room: string): void {
        this.service.leaveRoom(room);
    }

    /**
     * Emitir evento al servidor
     */
    static send<T = any>(event: string, data?: T): void {
        this.service.send(event, data);
    }

    /**
     * Escuchar evento del servidor
     */
    static on<T = any>(event: string, handler: EventHandler<T>): () => void {
        return this.service.on(event, handler);
    }

    /**
     * Dejar de escuchar evento
     */
    static off<T = any>(event: string, handler?: EventHandler<T>): void {
        this.service.off(event, handler);
    }

    /**
     * Escuchar evento una sola vez
     */
    static once<T = any>(event: string, handler: EventHandler<T>): void {
        this.service.once(event, handler);
    }

    // ==================== HELPERS ESPECÍFICOS DE CHAT ====================

    /**
     * Escuchar nuevos mensajes
     * Datos: { conversationId: number, message: any }
     */
    static onNewMessage(handler: EventHandler<NewMessageEventData>): () => void {
        return this.on(WebSocketEvent.NEW_MESSAGE, handler);
    }

    /**
     * Escuchar cambios de estado de mensaje
     * Datos: { messageId: number, accountId: number, status: 'sent'|'delivered'|'read', statusAt: Date }
     */
    static onMessageStatusChanged(handler: EventHandler<MessageStatusChangedEventData>): () => void {
        return this.on(WebSocketEvent.MESSAGE_STATUS_CHANGED, handler);
    }

    /**
     * Escuchar actualización de mensaje
     * Datos: { conversationId: number, message: any }
     */
    static onMessageUpdated(handler: EventHandler<MessageUpdatedEventData>): () => void {
        return this.on(WebSocketEvent.MESSAGE_UPDATED, handler);
    }

    /**
     * Escuchar eliminación de mensaje
     * Datos: { conversationId: number, messageId: number }
     */
    static onMessageDeleted(handler: EventHandler<MessageDeletedEventData>): () => void {
        return this.on(WebSocketEvent.MESSAGE_DELETED, handler);
    }

    /**
     * Escuchar nueva conversación
     * Datos: { conversation: any }
     */
    static onConversationCreated(handler: EventHandler<ConversationCreatedEventData>): () => void {
        return this.on(WebSocketEvent.CONVERSATION_CREATED, handler);
    }

    /**
     * Escuchar actualización de conversación
     * Datos: { conversation: any }
     */
    static onConversationUpdated(handler: EventHandler<ConversationUpdatedEventData>): () => void {
        return this.on(WebSocketEvent.CONVERSATION_UPDATED, handler);
    }

    /**
     * Escuchar eliminación de conversación
     * Datos: { conversationId: number }
     */
    static onConversationDeleted(handler: EventHandler<ConversationDeletedEventData>): () => void {
        return this.on(WebSocketEvent.CONVERSATION_DELETED, handler);
    }

    /**
     * Escuchar participante añadido
     * Datos: { conversationId: number, participant: any }
     */
    static onParticipantAdded(handler: EventHandler<ParticipantEventData>): () => void {
        return this.on(WebSocketEvent.PARTICIPANT_ADDED, handler);
    }

    /**
     * Escuchar participante removido
     * Datos: { conversationId: number, participant: any }
     */
    static onParticipantRemoved(handler: EventHandler<ParticipantEventData>): () => void {
        return this.on(WebSocketEvent.PARTICIPANT_REMOVED, handler);
    }

    /**
     * Escuchar participante que salió
     * Datos: { conversationId: number, participant: any }
     */
    static onParticipantLeft(handler: EventHandler<ParticipantEventData>): () => void {
        return this.on(WebSocketEvent.PARTICIPANT_LEFT, handler);
    }

    /**
     * Escuchar cambio de rol de participante
     * Datos: { conversationId: number, participant: any }
     */
    static onParticipantRoleChanged(handler: EventHandler<ParticipantEventData>): () => void {
        return this.on(WebSocketEvent.PARTICIPANT_ROLE_CHANGED, handler);
    }

    /**
     * Escuchar usuario escribiendo
     * Datos: { conversationId: number, accountId: number, isTyping: boolean }
     */
    static onUserTyping(handler: EventHandler<UserTypingEventData>): () => void {
        return this.on(WebSocketEvent.USER_TYPING, handler);
    }

    /**
     * Escuchar usuario dejó de escribir
     * Datos: { conversationId: number, accountId: number, isTyping: boolean }
     */
    static onUserStoppedTyping(handler: EventHandler<UserTypingEventData>): () => void {
        return this.on(WebSocketEvent.USER_STOPPED_TYPING, handler);
    }

    /**
     * Escuchar usuario conectado
     * Datos: { accountId: number, status: 'online' }
     */
    static onUserOnline(handler: EventHandler<UserPresenceEventData>): () => void {
        return this.on(WebSocketEvent.USER_ONLINE, handler);
    }

    /**
     * Escuchar usuario desconectado
     * Datos: { accountId: number, status: 'offline', lastSeen?: Date }
     */
    static onUserOffline(handler: EventHandler<UserPresenceEventData>): () => void {
        return this.on(WebSocketEvent.USER_OFFLINE, handler);
    }

    /**
     * Escuchar notificaciones
     * Datos: { id, type, title, message, data?, createdAt }
     */
    static onNotification(handler: EventHandler<NotificationEventData>): () => void {
        return this.on(WebSocketEvent.NOTIFICATION_RECEIVED, handler);
    }

    // ==================== EMISIÓN DE EVENTOS ====================

    /**
     * Notificar que el usuario está escribiendo
     * Envía: { conversationId: number, accountId: number, isTyping: true }
     */
    static sendTyping(conversationId: number, accountId: number): void {
        this.send('chat:typing', { conversationId, accountId, isTyping: true });
    }

    /**
     * Notificar que el usuario dejó de escribir
     * Envía: { conversationId: number, accountId: number, isTyping: false }
     */
    static sendStoppedTyping(conversationId: number, accountId: number): void {
        this.send('chat:typing', { conversationId, accountId, isTyping: false });
    }

    /**
     * Marcar mensaje como entregado
     * Envía: { messageId: number, accountId: number }
     */
    static sendMessageDelivered(messageId: number, accountId: number): void {
        this.send('chat:message_delivered', { messageId, accountId });
    }

    /**
     * Marcar mensaje como leído
     * Envía: { messageId: number, accountId: number }
     */
    static sendMessageRead(messageId: number, accountId: number): void {
        this.send('chat:message_read', { messageId, accountId });
    }

    /**
     * Unirse a conversación (sala)
     * Envía: { room: 'conversation:X' }
     */
    static joinConversation(conversationId: number): void {
        this.joinRoom(`conversation:${conversationId}`);
    }

    /**
     * Salir de conversación (sala)
     * Envía: { room: 'conversation:X' }
     */
    static leaveConversation(conversationId: number): void {
        this.leaveRoom(`conversation:${conversationId}`);
    }

    /**
     * Obtener ID del socket
     */
    static getSocketId(): string | undefined {
        return this.service.getSocketId();
    }

    /**
     * Remover todos los listeners
     */
    static removeAllListeners(): void {
        this.service.removeAllListeners();
    }
}
