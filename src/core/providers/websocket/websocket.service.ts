import { io, Socket } from 'socket.io-client';
import {
    WebSocketEvent,
    WebSocketConfig,
    ConnectionState,
    EventHandler,
} from './websocket.types';

export class WebSocketService {
    private static instance: WebSocketService;
    private socket: Socket | null = null;
    private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
    private eventHandlers: Map<string, Set<EventHandler>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    private constructor() {
        // Constructor privado para singleton
    }

    /**
     * Obtener instancia del servicio (Singleton)
     */
    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    /**
     * Conectar al servidor WebSocket
     */
    public connect(config: WebSocketConfig): void {
        if (this.socket && this.socket.connected) {
            console.warn('[WebSocket] Ya existe una conexión activa');
            return;
        }

        this.connectionState = ConnectionState.CONNECTING;
        
        const defaultConfig: WebSocketConfig = {
            url: config.url,
            path: config.path || '/socket.io',
            reconnection: config.reconnection !== false,
            reconnectionAttempts: config.reconnectionAttempts || this.maxReconnectAttempts,
            reconnectionDelay: config.reconnectionDelay || 1000,
            reconnectionDelayMax: config.reconnectionDelayMax || 5000,
            timeout: config.timeout || 20000,
            autoConnect: config.autoConnect !== false,
            transports: config.transports || ['websocket', 'polling'],
        };

        this.socket = io(defaultConfig.url, {
            path: defaultConfig.path,
            reconnection: defaultConfig.reconnection,
            reconnectionAttempts: defaultConfig.reconnectionAttempts,
            reconnectionDelay: defaultConfig.reconnectionDelay,
            reconnectionDelayMax: defaultConfig.reconnectionDelayMax,
            timeout: defaultConfig.timeout,
            autoConnect: defaultConfig.autoConnect,
            transports: defaultConfig.transports,
        });

        this.setupEventListeners();
    }

    /**
     * Configurar event listeners básicos de Socket.io
     */
    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on(WebSocketEvent.CONNECT, () => {
            console.log('[WebSocket] Conectado al servidor');
            this.connectionState = ConnectionState.CONNECTED;
            this.reconnectAttempts = 0;
            this.emit('connection:state_changed', { state: ConnectionState.CONNECTED });
        });

        this.socket.on(WebSocketEvent.DISCONNECT, (reason: string) => {
            console.log('[WebSocket] Desconectado del servidor:', reason);
            this.connectionState = ConnectionState.DISCONNECTED;
            this.emit('connection:state_changed', { state: ConnectionState.DISCONNECTED, reason });
        });

        this.socket.on(WebSocketEvent.CONNECT_ERROR, (error: Error) => {
            console.error('[WebSocket] Error de conexión:', error);
            this.connectionState = ConnectionState.ERROR;
            this.emit('connection:error', { error: error.message });
        });

        this.socket.on(WebSocketEvent.RECONNECT, (attemptNumber: number) => {
            console.log('[WebSocket] Reconectado después de', attemptNumber, 'intentos');
            this.connectionState = ConnectionState.CONNECTED;
            this.reconnectAttempts = 0;
            this.emit('connection:reconnected', { attempts: attemptNumber });
        });

        this.socket.io.on('reconnect_attempt', (attemptNumber: number) => {
            console.log('[WebSocket] Intento de reconexión', attemptNumber);
            this.connectionState = ConnectionState.RECONNECTING;
            this.reconnectAttempts = attemptNumber;
            this.emit('connection:reconnecting', { attempt: attemptNumber });
        });
    }

    /**
     * Desconectar del servidor
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connectionState = ConnectionState.DISCONNECTED;
            console.log('[WebSocket] Desconectado manualmente');
        }
    }

    /**
     * Reconectar al servidor
     */
    public reconnect(): void {
        if (this.socket) {
            this.socket.connect();
        } else {
            console.warn('[WebSocket] No se puede reconectar, socket no inicializado');
        }
    }

    /**
     * Verificar si está conectado
     */
    public isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Obtener estado de conexión
     */
    public getConnectionState(): ConnectionState {
        return this.connectionState;
    }

    /**
     * Emitir un evento al servidor
     */
    public send<T = any>(event: string, data?: T): void {
        if (!this.socket || !this.socket.connected) {
            console.warn('[WebSocket] No se puede enviar evento, no conectado');
            return;
        }

        this.socket.emit(event, data);
    }

    /**
     * Escuchar un evento del servidor
     */
    public on<T = any>(event: string, handler: EventHandler<T>): () => void {
        // Agregar handler al mapa
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);

        // Escuchar en el socket
        if (this.socket) {
            this.socket.on(event, handler);
        }

        // Retornar función para desuscribirse
        return () => this.off(event, handler);
    }

    /**
     * Dejar de escuchar un evento
     */
    public off<T = any>(event: string, handler?: EventHandler<T>): void {
        if (handler) {
            // Remover handler específico
            const handlers = this.eventHandlers.get(event);
            if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    this.eventHandlers.delete(event);
                }
            }

            if (this.socket) {
                this.socket.off(event, handler);
            }
        } else {
            // Remover todos los handlers del evento
            this.eventHandlers.delete(event);
            if (this.socket) {
                this.socket.off(event);
            }
        }
    }

    /**
     * Escuchar un evento una sola vez
     */
    public once<T = any>(event: string, handler: EventHandler<T>): void {
        if (!this.socket) {
            console.warn('[WebSocket] No se puede escuchar evento, socket no inicializado');
            return;
        }

        this.socket.once(event, handler);
    }

    /**
     * Emitir evento localmente (para comunicación interna)
     */
    private emit<T = any>(event: string, data: T): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`[WebSocket] Error en handler de ${event}:`, error);
                }
            });
        }
    }

    /**
     * Autenticar con el servidor
     */
    public authenticate(token: string): void {
        if (!this.socket || !this.socket.connected) {
            console.warn('[WebSocket] No se puede autenticar, no conectado');
            return;
        }

        this.socket.emit('authenticate', { token });
    }

    /**
     * Unirse a una sala (room)
     */
    public joinRoom(room: string): void {
        if (!this.socket || !this.socket.connected) {
            console.warn('[WebSocket] No se puede unir a la sala, no conectado');
            return;
        }

        this.socket.emit('join_room', { room });
        console.log('[WebSocket] Unido a la sala:', room);
    }

    /**
     * Salir de una sala (room)
     */
    public leaveRoom(room: string): void {
        if (!this.socket || !this.socket.connected) {
            console.warn('[WebSocket] No se puede salir de la sala, no conectado');
            return;
        }

        this.socket.emit('leave_room', { room });
        console.log('[WebSocket] Salido de la sala:', room);
    }

    /**
     * Obtener ID del socket
     */
    public getSocketId(): string | undefined {
        return this.socket?.id;
    }

    /**
     * Limpiar todos los event handlers
     */
    public removeAllListeners(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
        this.eventHandlers.clear();
    }
}

// Exportar instancia única
export default WebSocketService.getInstance();
