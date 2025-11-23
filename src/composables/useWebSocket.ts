import { ref, onMounted, onUnmounted, Ref } from 'vue';
import { WebSocketProvider, ConnectionState, EventHandler } from '@/core/providers/websocket';

/**
 * Composable para usar WebSocket en componentes Vue
 */
export function useWebSocket() {
    const isConnected = ref(false);
    const connectionState = ref<ConnectionState>(ConnectionState.DISCONNECTED);
    const socketId = ref<string | undefined>(undefined);

    // Actualizar estado de conexión
    const updateConnectionState = () => {
        isConnected.value = WebSocketProvider.isConnected();
        connectionState.value = WebSocketProvider.getConnectionState();
        socketId.value = WebSocketProvider.getSocketId();
    };

    // Escuchar cambios de estado de conexión
    const unsubscribeStateChanged = WebSocketProvider.on('connection:state_changed', () => {
        updateConnectionState();
    });

    // Escuchar reconexión
    const unsubscribeReconnected = WebSocketProvider.on('connection:reconnected', () => {
        updateConnectionState();
    });

    // Escuchar errores
    const unsubscribeError = WebSocketProvider.on('connection:error', () => {
        updateConnectionState();
    });

    // Limpiar listeners al desmontar
    onUnmounted(() => {
        unsubscribeStateChanged();
        unsubscribeReconnected();
        unsubscribeError();
    });

    // Actualizar estado inicial
    onMounted(() => {
        updateConnectionState();
    });

    return {
        isConnected,
        connectionState,
        socketId,
        // Métodos del provider
        connect: WebSocketProvider.connect.bind(WebSocketProvider),
        disconnect: WebSocketProvider.disconnect.bind(WebSocketProvider),
        reconnect: WebSocketProvider.reconnect.bind(WebSocketProvider),
        send: WebSocketProvider.send.bind(WebSocketProvider),
        on: WebSocketProvider.on.bind(WebSocketProvider),
        off: WebSocketProvider.off.bind(WebSocketProvider),
        once: WebSocketProvider.once.bind(WebSocketProvider),
        authenticate: WebSocketProvider.authenticate.bind(WebSocketProvider),
        joinRoom: WebSocketProvider.joinRoom.bind(WebSocketProvider),
        leaveRoom: WebSocketProvider.leaveRoom.bind(WebSocketProvider),
    };
}

/**
 * Composable para escuchar eventos de chat en tiempo real
 */
export function useChatEvents() {
    const subscriptions: Array<() => void> = [];

    const subscribe = <T = any>(eventName: string, handler: EventHandler<T>) => {
        const unsubscribe = WebSocketProvider.on(eventName, handler);
        subscriptions.push(unsubscribe);
        return unsubscribe;
    };

    // Limpiar todas las suscripciones al desmontar
    onUnmounted(() => {
        subscriptions.forEach(unsubscribe => unsubscribe());
    });

    return {
        // Métodos de suscripción
        onNewMessage: (handler: EventHandler) => subscribe('chat:new_message', handler),
        onMessageUpdated: (handler: EventHandler) => subscribe('chat:message_updated', handler),
        onMessageDeleted: (handler: EventHandler) => subscribe('chat:message_deleted', handler),
        onMessageStatusChanged: (handler: EventHandler) => subscribe('chat:message_status_changed', handler),
        onConversationCreated: (handler: EventHandler) => subscribe('chat:conversation_created', handler),
        onConversationUpdated: (handler: EventHandler) => subscribe('chat:conversation_updated', handler),
        onConversationDeleted: (handler: EventHandler) => subscribe('chat:conversation_deleted', handler),
        onParticipantAdded: (handler: EventHandler) => subscribe('chat:participant_added', handler),
        onParticipantRemoved: (handler: EventHandler) => subscribe('chat:participant_removed', handler),
        onUserTyping: (handler: EventHandler) => subscribe('chat:user_typing', handler),
        onUserStoppedTyping: (handler: EventHandler) => subscribe('chat:user_stopped_typing', handler),
        onUserOnline: (handler: EventHandler) => subscribe('presence:user_online', handler),
        onUserOffline: (handler: EventHandler) => subscribe('presence:user_offline', handler),
        onNotification: (handler: EventHandler) => subscribe('notification:received', handler),
        
        // Métodos para emitir eventos
        sendTyping: WebSocketProvider.sendTyping.bind(WebSocketProvider),
        sendStoppedTyping: WebSocketProvider.sendStoppedTyping.bind(WebSocketProvider),
        sendMessageDelivered: WebSocketProvider.sendMessageDelivered.bind(WebSocketProvider),
        sendMessageRead: WebSocketProvider.sendMessageRead.bind(WebSocketProvider),
        joinConversation: WebSocketProvider.joinConversation.bind(WebSocketProvider),
        leaveConversation: WebSocketProvider.leaveConversation.bind(WebSocketProvider),
    };
}

/**
 * Composable para manejar el indicador de "escribiendo"
 */
export function useTypingIndicator(conversationId: Ref<number | null>, accountId: Ref<number | null>) {
    const typingUsers = ref<Set<number>>(new Set());
    let typingTimeout: ReturnType<typeof setTimeout> | null = null;

    // Escuchar eventos de typing
    const unsubscribeTyping = WebSocketProvider.onUserTyping((data) => {
        if (data.conversationId === conversationId.value && data.accountId !== accountId.value) {
            typingUsers.value.add(data.accountId);
        }
    });

    const unsubscribeStoppedTyping = WebSocketProvider.onUserStoppedTyping((data) => {
        if (data.conversationId === conversationId.value) {
            typingUsers.value.delete(data.accountId);
        }
    });

    // Notificar que el usuario está escribiendo
    const notifyTyping = () => {
        if (!conversationId.value || !accountId.value) return;

        WebSocketProvider.sendTyping(conversationId.value, accountId.value);

        // Auto-detener después de 3 segundos
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        typingTimeout = setTimeout(() => {
            notifyStoppedTyping();
        }, 3000);
    };

    // Notificar que el usuario dejó de escribir
    const notifyStoppedTyping = () => {
        if (!conversationId.value || !accountId.value) return;

        WebSocketProvider.sendStoppedTyping(conversationId.value, accountId.value);

        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
    };

    // Limpiar al desmontar
    onUnmounted(() => {
        unsubscribeTyping();
        unsubscribeStoppedTyping();
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
    });

    return {
        typingUsers,
        notifyTyping,
        notifyStoppedTyping,
    };
}
