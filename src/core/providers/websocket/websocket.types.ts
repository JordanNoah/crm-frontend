// Tipos de eventos que el servidor puede emitir
export enum WebSocketEvent {
    // Eventos de conexión
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CONNECT_ERROR = 'connect_error',
    RECONNECT = 'reconnect',
    
    // Eventos de chat
    NEW_MESSAGE = 'chat:new_message',
    MESSAGE_UPDATED = 'chat:message_updated',
    MESSAGE_DELETED = 'chat:message_deleted',
    MESSAGE_STATUS_CHANGED = 'chat:message_status_changed',
    
    // Eventos de conversación
    CONVERSATION_CREATED = 'chat:conversation_created',
    CONVERSATION_UPDATED = 'chat:conversation_updated',
    CONVERSATION_DELETED = 'chat:conversation_deleted',
    
    // Eventos de participantes
    PARTICIPANT_ADDED = 'chat:participant_added',
    PARTICIPANT_REMOVED = 'chat:participant_removed',
    PARTICIPANT_LEFT = 'chat:participant_left',
    PARTICIPANT_ROLE_CHANGED = 'chat:participant_role_changed',
    
    // Eventos de presencia
    USER_ONLINE = 'presence:user_online',
    USER_OFFLINE = 'presence:user_offline',
    USER_TYPING = 'chat:user_typing',
    USER_STOPPED_TYPING = 'chat:user_stopped_typing',
    
    // Eventos de notificaciones
    NOTIFICATION_RECEIVED = 'notification:received',
    
    // Eventos personalizados
    CUSTOM_EVENT = 'custom:event',
}

// Tipos de datos de eventos (coinciden con el backend)
export interface NewMessageEventData {
    conversationId: number;
    message: any; // El mensaje completo tal como lo devuelve el backend
}

export interface MessageStatusChangedEventData {
    messageId: number;
    accountId: number;
    status: 'sent' | 'delivered' | 'read';
    statusAt: Date | string;
}

export interface MessageUpdatedEventData {
    conversationId: number;
    message: any; // El mensaje completo actualizado
}

export interface MessageDeletedEventData {
    conversationId: number;
    messageId: number;
}

export interface ConversationCreatedEventData {
    conversation: any; // La conversación completa
}

export interface ConversationUpdatedEventData {
    conversation: any; // La conversación completa actualizada
}

export interface ConversationDeletedEventData {
    conversationId: number;
}

export interface ParticipantEventData {
    conversationId: number;
    participant: any; // El participante completo
}

export interface UserTypingEventData {
    conversationId: number;
    accountId: number;
    isTyping: boolean;
}

export interface UserPresenceEventData {
    accountId: number;
    status: 'online' | 'offline';
    lastSeen?: Date | string;
}

export interface NotificationEventData {
    id: number;
    type: string;
    title: string;
    message: string;
    data?: any;
    createdAt: Date | string;
}

// Tipo genérico para handlers de eventos
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

// Configuración del WebSocket
export interface WebSocketConfig {
    url: string;
    path?: string;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    timeout?: number;
    autoConnect?: boolean;
    transports?: string[];
}

// Estado de conexión
export enum ConnectionState {
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    RECONNECTING = 'reconnecting',
    ERROR = 'error',
}
