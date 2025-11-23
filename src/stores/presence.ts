import { defineStore } from 'pinia';
import { WebSocketProvider } from '@/core/providers/websocket';

interface UserPresence {
    accountId: number;
    status: 'online' | 'offline';
    lastSeen?: Date;
}

interface PresenceState {
    onlineUsers: Map<number, UserPresence>;
    initialized: boolean;
}

export const usePresenceStore = defineStore('presence', {
    state: (): PresenceState => ({
        onlineUsers: new Map(),
        initialized: false,
    }),

    getters: {
        /**
         * Verificar si un usuario está conectado
         */
        isUserOnline: (state) => (accountId: number): boolean => {
            const user = state.onlineUsers.get(accountId);
            return user?.status === 'online';
        },

        /**
         * Obtener información de presencia de un usuario
         */
        getUserPresence: (state) => (accountId: number): UserPresence | undefined => {
            return state.onlineUsers.get(accountId);
        },

        /**
         * Obtener todos los usuarios online
         */
        getAllOnlineUsers: (state): number[] => {
            return Array.from(state.onlineUsers.entries())
                .filter(([_, user]) => user.status === 'online')
                .map(([accountId]) => accountId);
        },

        /**
         * Contar usuarios online
         */
        onlineUsersCount: (state): number => {
            return Array.from(state.onlineUsers.values())
                .filter(user => user.status === 'online')
                .length;
        },
    },

    actions: {
        /**
         * Marcar usuario como online
         */
        setUserOnline(accountId: number) {
            this.onlineUsers.set(accountId, {
                accountId,
                status: 'online',
            });
            console.log('[PresenceStore] Usuario conectado:', accountId);
        },

        /**
         * Marcar usuario como offline
         */
        setUserOffline(accountId: number, lastSeen?: Date) {
            this.onlineUsers.set(accountId, {
                accountId,
                status: 'offline',
                lastSeen: lastSeen || new Date(),
            });
            console.log('[PresenceStore] Usuario desconectado:', accountId);
        },

        /**
         * Limpiar un usuario del Map
         */
        removeUser(accountId: number) {
            this.onlineUsers.delete(accountId);
        },

        /**
         * Limpiar todos los usuarios
         */
        clearAll() {
            this.onlineUsers.clear();
            console.log('[PresenceStore] Limpiado todos los usuarios');
        },

        /**
         * Inicializar listeners de presencia del WebSocket
         */
        initPresenceListeners() {
            if (this.initialized) {
                console.warn('[PresenceStore] Listeners ya inicializados');
                return;
            }

            console.log('[PresenceStore] Inicializando listeners de presencia');

            // Escuchar usuario conectado
            WebSocketProvider.onUserOnline((data) => {
                console.log('[PresenceStore] Evento user_online recibido:', data);
                this.setUserOnline(data.accountId);
            });

            // Escuchar usuario desconectado
            WebSocketProvider.onUserOffline((data) => {
                console.log('[PresenceStore] Evento user_offline recibido:', data);
                this.setUserOffline(
                    data.accountId, 
                    data.lastSeen ? new Date(data.lastSeen) : undefined
                );
            });

            this.initialized = true;
            console.log('[PresenceStore] ✓ Listeners inicializados correctamente');
        },

        /**
         * Desactivar listeners (limpiar al desconectar)
         */
        disablePresenceListeners() {
            // WebSocketProvider maneja la limpieza automáticamente al desconectar
            this.initialized = false;
            this.clearAll();
            console.log('[PresenceStore] Listeners desactivados');
        },
    },
});
