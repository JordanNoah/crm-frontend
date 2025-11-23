import { App, watch } from 'vue';
import { WebSocketProvider } from '@/core/providers/websocket';
import { useChatStore } from '@/stores/chat';
import { useSessionStore } from '@/stores/session';
import { usePresenceStore } from '@/stores/presence';

/**
 * Plugin de WebSocket para Vue 3
 * Maneja la conexión automática y autenticación basada en el estado de sesión
 */
export default {
    install(app: App) {
        // Configurar WebSocket en el objeto global de Vue
        app.config.globalProperties.$ws = WebSocketProvider;

        console.log('[WebSocket Plugin] ✓ Instalado correctamente');

        // Variable para evitar múltiples conexiones
        let isInitialized = false;

        /**
         * Inicializar conexión WebSocket
         */
        const initializeWebSocket = () => {
            if (isInitialized) {
                console.warn('[WebSocket Plugin] WebSocket ya inicializado');
                return;
            }

            const sessionStore = useSessionStore();
            const chatStore = useChatStore();

            // Conectar al WebSocket
            const wsUrl = process.env.VUE_APP_WS_URL || process.env.VUE_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
            
            console.log('[WebSocket Plugin] 🔌 Conectando a:', wsUrl);
            
            WebSocketProvider.connect({
                url: wsUrl,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // Escuchar evento de conexión
            WebSocketProvider.on('connect', () => {
                console.log('[WebSocket Plugin] ✓ Conectado al servidor');
                
                // Autenticar con el token
                if (sessionStore.accessToken) {
                    WebSocketProvider.authenticate(sessionStore.accessToken);
                    console.log('[WebSocket Plugin] ✓ Token enviado para autenticación');
                }

                // Inicializar listeners de tiempo real del chat
                chatStore.initRealtimeListeners();
            });

            // Escuchar desconexión
            WebSocketProvider.on('disconnect', (reason: string) => {
                console.log('[WebSocket Plugin] ✗ Desconectado:', reason);
            });

            // Escuchar errores de conexión
            WebSocketProvider.on('connection:error', (data: any) => {
                console.error('[WebSocket Plugin] ✗ Error de conexión:', data.error);
            });

            // Escuchar reconexión exitosa
            WebSocketProvider.on('connection:reconnected', (data: any) => {
                console.log('[WebSocket Plugin] ✓ Reconectado después de', data.attempts, 'intentos');
                
                // Re-autenticar después de reconectar
                if (sessionStore.accessToken) {
                    WebSocketProvider.authenticate(sessionStore.accessToken);
                    console.log('[WebSocket Plugin] ✓ Re-autenticación después de reconexión');
                }

                // Re-inicializar listeners si es necesario
                if (!chatStore.realtimeEnabled) {
                    chatStore.initRealtimeListeners();
                }
            });

            // Escuchar intentos de reconexión
            WebSocketProvider.on('connection:reconnecting', (data: any) => {
                console.log('[WebSocket Plugin] ⟳ Reintentando conexión... Intento', data.attempt);
            });

            isInitialized = true;
        };

        /**
         * Desconectar WebSocket
         */
        const disconnectWebSocket = () => {
            if (!isInitialized) return;

            console.log('[WebSocket Plugin] 🔌 Desconectando...');
            
            const chatStore = useChatStore();
            const presenceStore = usePresenceStore();
            
            WebSocketProvider.disconnect();
            chatStore.disableRealtimeListeners();
            presenceStore.disablePresenceListeners();  // Limpiar presencia
            
            isInitialized = false;
        };

        // Usar nextTick para asegurar que los stores estén disponibles
        // y ejecutar la lógica después de que la app esté montada
        setTimeout(() => {
            try {
                const sessionStore = useSessionStore();

                console.log('[WebSocket Plugin] 🔍 Verificando autenticación...');
                console.log('[WebSocket Plugin] isAuthenticated:', sessionStore.isAuthenticated);

                // Si ya está autenticado, conectar inmediatamente
                if (sessionStore.isAuthenticated) {
                    console.log('[WebSocket Plugin] ✓ Usuario autenticado, conectando...');
                    initializeWebSocket();
                } else {
                    console.log('[WebSocket Plugin] ⏳ Usuario no autenticado, esperando...');
                }

                // Observar cambios en el estado de autenticación
                watch(
                    () => sessionStore.isAuthenticated,
                    (isAuthenticated: boolean) => {
                        console.log('[WebSocket Plugin] 🔄 Cambio de autenticación:', isAuthenticated);
                        
                        if (isAuthenticated) {
                            // Usuario inició sesión -> conectar
                            console.log('[WebSocket Plugin] ✓ Usuario autenticado, conectando...');
                            if (!isInitialized) {
                                initializeWebSocket();
                            }
                        } else {
                            // Usuario cerró sesión -> desconectar
                            console.log('[WebSocket Plugin] ✗ Usuario desautenticado, desconectando...');
                            if (isInitialized) {
                                disconnectWebSocket();
                            }
                        }
                    }
                );

                console.log('[WebSocket Plugin] ✓ Watch configurado correctamente');
            } catch (error) {
                console.error('[WebSocket Plugin] ✗ Error al inicializar:', error);
            }
        }, 100); // Pequeño delay para asegurar que Pinia esté listo
    },
};
