import { defineStore } from 'pinia';
import ChatProvider from '@/core/providers/auth/auth';
import { ConversationModel } from '@/core/model/chat/conversation.model';
import { ConversationMessageModel } from '@/core/model/chat/conversationMessage.model';
import { ConversationParticipantModel } from '@/core/model/chat/conversationParticipant.model';
import { WebSocketProvider } from '@/core/providers/websocket';

interface ChatState {
    conversations: ConversationModel[];
    messages: ConversationMessageModel[];
    currentConversationId: number | null;
    participants: ConversationParticipantModel[];
    loading: boolean;
    error: string | null;
    realtimeEnabled: boolean;
}

export const useChatStore = defineStore('chat', {
    state: (): ChatState => ({
        conversations: [],
        messages: [],
        currentConversationId: null,
        participants: [],
        loading: false,
        error: null,
        realtimeEnabled: false,
    }),

    getters: {
        getConversations: (state) => state.conversations,
        
        getMessages: (state) => state.messages,
        
        getCurrentConversation: (state) => {
            if (!state.currentConversationId) return null;
            return state.conversations.find(c => c.id === state.currentConversationId) || null;
        },
        
        getConversationByUuid: (state) => (uuid: string) => {
            return state.conversations.find(c => c.uuid === uuid) || null;
        },
        
        getUnreadConversationsCount: (state) => {
            return state.conversations.filter(c => c.hasUnreadMessages).length;
        },
        
        getTotalUnreadCount: (state) => {
            return state.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        },
        
        getParticipants: (state) => state.participants,
        
        isLoading: (state) => state.loading,
        
        getError: (state) => state.error,
    },

    actions: {
        // ==================== TIEMPO REAL ====================
        
        /**
         * Inicializar listeners de WebSocket
         */
        initRealtimeListeners() {
            if (this.realtimeEnabled) {
                console.warn('[ChatStore] Los listeners de tiempo real ya están activos');
                return;
            }

            console.log('[ChatStore] Inicializando listeners de tiempo real');

            // Escuchar nuevos mensajes
            WebSocketProvider.onNewMessage((data) => {
                console.log('[ChatStore] Nuevo mensaje recibido:', data);
                this.handleNewMessage(data.message);
            });

            // Escuchar cambios de estado de mensaje
            WebSocketProvider.onMessageStatusChanged((data) => {
                console.log('[ChatStore] Estado de mensaje cambiado:', data);
                this.updateMessageStatusRealtime(data.messageId, data.accountId, data.status);
            });

            // Escuchar mensaje actualizado
            WebSocketProvider.onMessageUpdated((data) => {
                console.log('[ChatStore] Mensaje actualizado:', data);
                this.handleMessageUpdated(data.message);
            });

            // Escuchar mensaje eliminado
            WebSocketProvider.onMessageDeleted((data) => {
                console.log('[ChatStore] Mensaje eliminado:', data);
                this.handleMessageDeleted(data.messageId);
            });

            // Escuchar nueva conversación
            WebSocketProvider.onConversationCreated((data) => {
                console.log('[ChatStore] Nueva conversación creada:', data);
                this.handleConversationCreated(data.conversation);
            });

            // Escuchar conversación actualizada
            WebSocketProvider.onConversationUpdated((data) => {
                console.log('[ChatStore] Conversación actualizada:', data);
                this.handleConversationUpdated(data.conversation);
            });

            // Escuchar conversación eliminada
            WebSocketProvider.onConversationDeleted((data) => {
                console.log('[ChatStore] Conversación eliminada:', data);
                this.handleConversationDeleted(data.conversationId);
            });

            // Escuchar participante añadido
            WebSocketProvider.onParticipantAdded((data) => {
                console.log('[ChatStore] Participante añadido:', data);
                this.handleParticipantAdded(data);
            });

            // Escuchar participante removido
            WebSocketProvider.onParticipantRemoved((data) => {
                console.log('[ChatStore] Participante removido:', data);
                this.handleParticipantRemoved(data);
            });

            this.realtimeEnabled = true;
        },

        /**
         * Desactivar listeners de WebSocket
         */
        disableRealtimeListeners() {
            // Los listeners se limpian automáticamente cuando se desconecta el WebSocket
            this.realtimeEnabled = false;
            console.log('[ChatStore] Listeners de tiempo real desactivados');
        },

        // ==================== HANDLERS DE EVENTOS EN TIEMPO REAL ====================

        handleNewMessage(message: any) {
            const messageModel = ConversationMessageModel.fromExternal(message);
            
            // Si estamos en la conversación, agregar el mensaje
            if (this.currentConversationId === messageModel.conversationId) {
                const exists = this.messages.find(m => m.uuid === messageModel.uuid);
                if (!exists) {
                    this.messages.push(messageModel);
                    // Ordenar mensajes por fecha
                    this.messages.sort((a, b) => {
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    });
                }
            }
            
            // Actualizar conversación
            const conv = this.conversations.find(c => c.id === messageModel.conversationId);
            if (conv) {
                conv.lastMessage = messageModel;
                conv.updatedAt = new Date();
                
                // Incrementar contador de no leídos si no es el usuario actual
                // (esto lo decides basado en tu lógica)
                conv.unreadCount = (conv.unreadCount || 0) + 1;
                
                // Mover conversación al inicio
                const index = this.conversations.findIndex(c => c.id === messageModel.conversationId);
                if (index !== -1 && index !== 0) {
                    const conversation = this.conversations.splice(index, 1)[0];
                    this.conversations.unshift(conversation);
                }
            }
        },

        handleMessageUpdated(message: any) {
            const messageModel = ConversationMessageModel.fromExternal(message);
            const index = this.messages.findIndex(m => m.uuid === messageModel.uuid);
            
            if (index !== -1) {
                this.messages[index] = messageModel;
            }
        },

        handleMessageDeleted(messageId: number) {
            const index = this.messages.findIndex(m => m.id === messageId);
            
            if (index !== -1) {
                this.messages.splice(index, 1);
            }
        },

        handleConversationCreated(conversation: any) {
            const conversationModel = ConversationModel.fromExternal(conversation);
            const exists = this.conversations.find(c => c.uuid === conversationModel.uuid);
            
            if (!exists) {
                this.conversations.unshift(conversationModel);
            }
        },

        handleConversationUpdated(conversation: any) {
            const conversationModel = ConversationModel.fromExternal(conversation);
            const index = this.conversations.findIndex(c => c.uuid === conversationModel.uuid);
            
            if (index !== -1) {
                this.conversations[index] = conversationModel;
            }
        },

        handleConversationDeleted(conversationId: number) {
            const index = this.conversations.findIndex(c => c.id === conversationId);
            
            if (index !== -1) {
                this.conversations.splice(index, 1);
            }
            
            // Si es la conversación actual, limpiar
            if (this.currentConversationId === conversationId) {
                this.clearCurrentConversation();
            }
        },

        handleParticipantAdded(data: any) {
            const participantModel = ConversationParticipantModel.fromExternal(data.participant);
            
            // Si estamos viendo los participantes de esta conversación, agregarlos
            if (this.currentConversationId === data.conversationId) {
                const exists = this.participants.find(p => p.uuid === participantModel.uuid);
                if (!exists) {
                    this.participants.push(participantModel);
                }
            }
        },

        handleParticipantRemoved(data: any) {
            if (this.currentConversationId === data.conversationId) {
                const index = this.participants.findIndex(p => p.uuid === data.participant.uuid);
                if (index !== -1) {
                    this.participants.splice(index, 1);
                }
            }
        },

        updateMessageStatusRealtime(messageId: number, accountId: number, status: 'sent' | 'delivered' | 'read') {
            const message = this.messages.find(m => m.id === messageId);
            if (message && message.statuses) {
                const statusObj = message.statuses.find(s => s.accountId === accountId);
                if (statusObj) {
                    statusObj.status = status;
                    statusObj.statusAt = new Date();
                }
            }
        },

        // ==================== CONVERSACIONES ====================
        
        async loadConversations(accountId: number, options?: { limit?: number; offset?: number }) {
            this.loading = true;
            this.error = null;
            
            try {
                const conversations = await ChatProvider.getConversationsByAccount(accountId, options);
                this.conversations = conversations;

            } catch (error: any) {
                this.error = error.message || 'Error al cargar conversaciones';
                console.error('Error loading conversations:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async loadConversation(uuid: string) {
            this.loading = true;
            this.error = null;
            
            try {
                const conversation = await ChatProvider.getConversationByUuid(uuid);
                
                // Actualizar o agregar la conversación
                const index = this.conversations.findIndex(c => c.uuid === uuid);
                if (index !== -1) {
                    this.conversations[index] = conversation;
                } else {
                    this.conversations.push(conversation);
                }
                
                return conversation;
            } catch (error: any) {
                this.error = error.message || 'Error al cargar conversación';
                console.error('Error loading conversation:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createConversation(data: {
            name: string | null;
            type: 'private' | 'group';
            createdBy: number;
            participants: number[];
        }) {
            this.loading = true;
            this.error = null;
            
            try {
                const conversation = await ChatProvider.createConversation({
                    name: data.name,
                    type: data.type,
                    createdBy: data.createdBy,
                });
                
                // Agregar participantes
                if (data.participants.length > 0) {
                    await ChatProvider.addMultipleParticipants(
                        conversation.id,
                        data.participants.map(accountId => ({
                            accountId,
                            role: accountId === data.createdBy ? 'admin' : 'member',
                        }))
                    );
                }
                
                this.conversations.unshift(conversation);
                return conversation;
            } catch (error: any) {
                this.error = error.message || 'Error al crear conversación';
                console.error('Error creating conversation:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateConversation(uuid: string, data: { name?: string; type?: 'private' | 'group' }) {
            this.loading = true;
            this.error = null;
            
            try {
                const updated = await ChatProvider.updateConversation(uuid, data);
                
                const index = this.conversations.findIndex(c => c.uuid === uuid);
                if (index !== -1) {
                    this.conversations[index] = updated;
                }
                
                return updated;
            } catch (error: any) {
                this.error = error.message || 'Error al actualizar conversación';
                console.error('Error updating conversation:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteConversation(uuid: string) {
            this.loading = true;
            this.error = null;
            
            try {
                await ChatProvider.deleteConversation(uuid);
                
                const index = this.conversations.findIndex(c => c.uuid === uuid);
                if (index !== -1) {
                    this.conversations.splice(index, 1);
                }
                
                if (this.getCurrentConversation?.uuid === uuid) {
                    this.currentConversationId = null;
                    this.messages = [];
                }
            } catch (error: any) {
                this.error = error.message || 'Error al eliminar conversación';
                console.error('Error deleting conversation:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async findOrCreatePrivateConversation(accountId1: number, accountId2: number) {
            this.loading = true;
            this.error = null;
            
            try {
                let conversation = await ChatProvider.getPrivateConversation(accountId1, accountId2);
                
                if (!conversation) {
                    conversation = await this.createConversation({
                        name: null,
                        type: 'private',
                        createdBy: accountId1,
                        participants: [accountId1, accountId2],
                    });
                }
                
                return conversation;
            } catch (error: any) {
                this.error = error.message || 'Error al buscar/crear conversación';
                console.error('Error finding/creating private conversation:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // ==================== MENSAJES ====================
        
        async loadMessages(conversationId: number, options?: { limit?: number; offset?: number; before?: Date; after?: Date }) {
            this.loading = true;
            this.error = null;
            this.currentConversationId = conversationId;
            
            try {
                const messages = await ChatProvider.getMessagesByConversation(conversationId, options);
                console.log(messages);
                
                this.messages = messages.sort((a, b) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                });
                
                // Unirse a la sala de la conversación para recibir eventos en tiempo real
                if (WebSocketProvider.isConnected()) {
                    WebSocketProvider.joinConversation(conversationId);
                }
            } catch (error: any) {
                this.error = error.message || 'Error al cargar mensajes';
                console.error('Error loading messages:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async sendMessage(data: {
            conversationId: number;
            senderId: number;
            content: string;
            type: 'text' | 'image' | 'file' | 'audio' | 'video';
            metadata?: string;
            replyToId?: number | null;
            file?: File;
        }) {
            this.error = null;
            
            try {
                const message = await ChatProvider.sendMessage(data);
                
                // El mensaje se agregará automáticamente vía WebSocket,
                // pero lo agregamos localmente por si acaso
                if (this.currentConversationId === data.conversationId) {
                    const exists = this.messages.find(m => m.uuid === message.uuid);
                    if (!exists) {
                        this.messages.push(message);
                    }
                }
                
                // Actualizar última actualización de la conversación
                const convIndex = this.conversations.findIndex(c => c.id === data.conversationId);
                if (convIndex !== -1) {
                    this.conversations[convIndex].updatedAt = new Date();
                    this.conversations[convIndex].lastMessage = message;
                    
                    // Reordenar conversaciones
                    const conv = this.conversations.splice(convIndex, 1)[0];
                    this.conversations.unshift(conv);
                }
                
                return message;
            } catch (error: any) {
                this.error = error.message || 'Error al enviar mensaje';
                console.error('Error sending message:', error);
                throw error;
            }
        },

        async updateMessage(uuid: string, data: { content?: string; metadata?: string }) {
            this.error = null;
            
            try {
                const updated = await ChatProvider.updateMessage(uuid, data);
                
                const index = this.messages.findIndex(m => m.uuid === uuid);
                if (index !== -1) {
                    this.messages[index] = updated;
                }
                
                return updated;
            } catch (error: any) {
                this.error = error.message || 'Error al actualizar mensaje';
                console.error('Error updating message:', error);
                throw error;
            }
        },

        async deleteMessage(uuid: string) {
            this.error = null;
            
            try {
                await ChatProvider.deleteMessage(uuid);
                
                const index = this.messages.findIndex(m => m.uuid === uuid);
                if (index !== -1) {
                    this.messages.splice(index, 1);
                }
            } catch (error: any) {
                this.error = error.message || 'Error al eliminar mensaje';
                console.error('Error deleting message:', error);
                throw error;
            }
        },

        async loadUnreadMessages(conversationId: number, accountId: number) {
            this.error = null;
            
            try {
                return await ChatProvider.getUnreadMessages(conversationId, accountId);
            } catch (error: any) {
                this.error = error.message || 'Error al cargar mensajes no leídos';
                console.error('Error loading unread messages:', error);
                throw error;
            }
        },

        async searchMessages(conversationId: number, searchTerm: string, options?: { limit?: number; offset?: number }) {
            this.loading = true;
            this.error = null;
            
            try {
                return await ChatProvider.searchMessages(conversationId, searchTerm, options);
            } catch (error: any) {
                this.error = error.message || 'Error al buscar mensajes';
                console.error('Error searching messages:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // ==================== PARTICIPANTES ====================
        
        async loadParticipants(conversationId: number, includeLeft?: boolean) {
            this.loading = true;
            this.error = null;
            
            try {
                this.participants = await ChatProvider.getParticipants(conversationId, includeLeft);
            } catch (error: any) {
                this.error = error.message || 'Error al cargar participantes';
                console.error('Error loading participants:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addParticipant(conversationId: number, accountId: number, role: 'admin' | 'member' = 'member') {
            this.error = null;
            
            try {
                const participant = await ChatProvider.addParticipant(conversationId, accountId, role);
                this.participants.push(participant);
                
                // Actualizar contador de participantes
                const conv = this.conversations.find(c => c.id === conversationId);
                if (conv && conv.participants) {
                    conv.participants.push(participant);
                }
                
                return participant;
            } catch (error: any) {
                this.error = error.message || 'Error al agregar participante';
                console.error('Error adding participant:', error);
                throw error;
            }
        },

        async removeParticipant(uuid: string) {
            this.error = null;
            
            try {
                await ChatProvider.removeParticipant(uuid);
                
                const index = this.participants.findIndex(p => p.uuid === uuid);
                if (index !== -1) {
                    this.participants.splice(index, 1);
                }
            } catch (error: any) {
                this.error = error.message || 'Error al eliminar participante';
                console.error('Error removing participant:', error);
                throw error;
            }
        },

        async leaveConversation(uuid: string) {
            this.error = null;
            
            try {
                await ChatProvider.leaveConversation(uuid);
                
                const index = this.participants.findIndex(p => p.uuid === uuid);
                if (index !== -1) {
                    this.participants[index].leftAt = new Date();
                }
            } catch (error: any) {
                this.error = error.message || 'Error al salir de la conversación';
                console.error('Error leaving conversation:', error);
                throw error;
            }
        },

        async updateParticipantRole(uuid: string, role: 'admin' | 'member') {
            this.error = null;
            
            try {
                const updated = await ChatProvider.updateParticipantRole(uuid, role);
                
                const index = this.participants.findIndex(p => p.uuid === uuid);
                if (index !== -1) {
                    this.participants[index] = updated;
                }
                
                return updated;
            } catch (error: any) {
                this.error = error.message || 'Error al actualizar rol';
                console.error('Error updating participant role:', error);
                throw error;
            }
        },

        // ==================== ESTADOS DE MENSAJES ====================
        
        async markAsRead(messageId: number, accountId: number) {
            this.error = null;
            
            try {
                await ChatProvider.markAsRead(messageId, accountId);
                
                // Actualizar estado del mensaje localmente
                const message = this.messages.find(m => m.id === messageId);
                if (message && message.statuses) {
                    const status = message.statuses.find(s => s.accountId === accountId);
                    if (status) {
                        status.status = 'read';
                        status.statusAt = new Date();
                    }
                }
            } catch (error: any) {
                this.error = error.message || 'Error al marcar como leído';
                console.error('Error marking as read:', error);
                throw error;
            }
        },

        async markConversationAsRead(conversationId: number, accountId: number) {
            this.error = null;
            
            try {
                await ChatProvider.markAllAsReadInConversation(conversationId, accountId);
                
                // Actualizar contador de no leídos
                const conv = this.conversations.find(c => c.id === conversationId);
                if (conv) {
                    conv.unreadCount = 0;
                }
                
                // Actualizar estados de mensajes localmente
                this.messages.forEach(message => {
                    if (message.conversationId === conversationId && message.statuses) {
                        const status = message.statuses.find(s => s.accountId === accountId);
                        if (status) {
                            status.status = 'read';
                            status.statusAt = new Date();
                        }
                    }
                });
            } catch (error: any) {
                this.error = error.message || 'Error al marcar conversación como leída';
                console.error('Error marking conversation as read:', error);
                throw error;
            }
        },

        // ==================== HELPERS ====================
        
        clearCurrentConversation() {
            // Salir de la sala antes de limpiar
            if (this.currentConversationId && WebSocketProvider.isConnected()) {
                WebSocketProvider.leaveConversation(this.currentConversationId);
            }
            
            this.currentConversationId = null;
            this.messages = [];
            this.participants = [];
        },

        clearError() {
            this.error = null;
        },

        // Métodos legacy para compatibilidad (deprecated)
        addMessageRealtime(message: ConversationMessageModel) {
            console.warn('[ChatStore] addMessageRealtime está deprecated, usa initRealtimeListeners()');
            this.handleNewMessage(message);
        },
    },
});
