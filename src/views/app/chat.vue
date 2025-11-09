<template>
    <v-card height="100%" width="100%" variant="elevated" elevation="0" class="border">
        <v-layout height="100%" width="100%">
            <!-- Chat Interface right side -->
            <v-navigation-drawer v-model="openContactList" permanent right width="340">
                <div class="d-flex flex-column" style="height: 100%;">
                    <div style="height: 75px;" class="border-b-sm px-2 d-flex align-center">
                        <div class="mr-2">
                            <UserAvatar :account="sessionStore.getAccount" :show-status="true" size="40" color="red" />
                        </div>

                        <v-text-field v-model="searchQuery" dense hide-details label="Buscar"
                            prepend-inner-icon="mdi-magnify" clearable />
                        <v-btn icon size="small" color="transparent" class="ml-2"
                            @click="showNewConversationDialog = true">
                            <v-icon>mdi-message-plus</v-icon>
                        </v-btn>
                    </div>
                    <div style="flex: auto; overflow-y: auto;">
                        <v-progress-linear v-if="loadingConversations" indeterminate />

                        <div v-else-if="filteredConversations.length === 0"
                            class="text-center pa-4 d-flex align-center flex-column justify-center"
                            style="height: 100%;">
                            <v-icon size="64" color="grey">mdi-message-outline</v-icon>
                            <p class="text-grey mt-2">No hay conversaciones</p>
                        </div>

                        <div class="pa-2" v-else>
                            <Conversation v-for="conversation in filteredConversations" :key="conversation.uuid"
                                :conversation="conversation"
                                :is-active="selectedConversation?.uuid === conversation.uuid"
                                :name="getConversationName(conversation)" :avatar="getConversationAvatar(conversation)"
                                :avatar-color="getConversationColor(conversation)"
                                :initials="getConversationInitials(conversation)"
                                @click="selectConversation(conversation)" class="mb-2" />
                        </div>
                    </div>
                </div>
            </v-navigation-drawer>
            <!-- Chat Interface left side -->
            <v-main>
                <div v-if="!selectedConversation" class="d-flex align-center justify-center flex-column"
                    style="height: 100%;">
                    <v-icon size="120" color="grey-lighten-2">mdi-message-text-outline</v-icon>
                    <h2 class="text-grey-lighten-1 mt-4">Selecciona una conversación</h2>
                    <p class="text-grey">Elige un chat de la lista para comenzar a conversar</p>
                </div>
                <div v-else class="d-flex flex-column" style="height: 100%;">
                    <div class="border-b-sm d-flex align-center px-4" style="height: 75px;">
                        <UserAvatar :image-url="getConversationAvatar(selectedConversation)"
                            :initials="getConversationInitials(selectedConversation)"
                            :color="getConversationColor(selectedConversation)" size="40" class="mr-3" />
                        <div class="flex-grow-1">
                            <h4 class="mb-0">{{ getConversationName(selectedConversation) }}</h4>
                            <p class="text-caption text-grey mb-0">
                                {{ selectedConversation.isGroup ? `${selectedConversation.participantCount}
                                participantes` : 'En línea' }}
                            </p>
                        </div>
                        <v-btn icon size="small">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </div>
                    <div class="messages-wrapper">
                        <div ref="messagesContainer" class="messages-area" style="background-color: #f5f5f5;">
                            <v-progress-linear v-if="loadingMessages" indeterminate />

                            <div v-else-if="messages.length === 0" class="text-center pa-8">
                                <p class="text-grey">No hay mensajes en esta conversación</p>
                                <p class="text-caption text-grey">Envía un mensaje para comenzar</p>
                            </div>

                            <div v-else>
                                <Message v-for="(message, index) in messages" :key="message.uuid" :message="message"
                                    :is-own="message.senderId === currentAccountId"
                                    :show-timestamp="shouldShowTimestamp(message, index)" @reply="handleReply"
                                    @delete="handleDeleteMessage" />
                            </div>
                        </div>

                        <!-- Message Input Area - Flotante -->
                        <div class="input-area-wrapper">
                            <!-- Preview de archivos seleccionados -->
                            <div v-if="selectedFiles.length" class="pb-2">
                                <div class="d-flex flex-wrap gap-2" style="max-height: 100px; overflow-y: auto;">
                                    <v-chip v-for="(file, index) in selectedFiles" :key="file.name + index" closable
                                        @click:close="removeFile(index)" size="small" class="mr-2 mb-2">
                                        <v-icon start size="small">mdi-file</v-icon>
                                        {{ file.name }} ({{ formatBytes(file.size) }})
                                    </v-chip>
                                </div>
                            </div>

                            <!-- Reply preview -->
                            <div v-if="replyingTo" class="mb-2 pa-2 bg-white rounded d-flex align-center"
                                style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                                <div class="flex-grow-1">
                                    <p class="text-caption text-primary mb-0">Respondiendo a:</p>
                                    <p class="text-body-2 mb-0 text-truncate">{{ replyingTo.content }}</p>
                                </div>
                                <v-btn icon size="x-small" variant="text" @click="replyingTo = null">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </div>

                            <!-- Input container flotante -->
                            <div class="message-input-container">
                                <!-- Hidden file input -->
                                <input ref="fileInput" type="file" multiple :accept="acceptedMimeTypes"
                                    style="display: none;" @change="onFilesSelected" />

                                <div class="d-flex align-center gap-2">
                                    <!-- Text input -->
                                    <v-text-field ref="messageInput" v-model="newMessage"
                                        placeholder="Escribe un mensaje..." variant="outlined" density="comfortable"
                                        hide-details single-line class="flex-grow-1 messageInput"
                                        @keydown.enter.exact.prevent="sendMessage"
                                        @keydown.enter.shift.exact.prevent="newMessage += '\n'">
                                    </v-text-field>

                                    <!-- Emoji picker (simplificado) -->
                                    <v-menu v-model="showEmojiPicker" :close-on-content-click="false" location="top" max-height="300" max-width="300">
                                        <template #activator="{ props }">
                                            <v-btn color="transparent" icon size="small" class="mr-2" v-bind="props">
                                                <v-icon>mdi-emoticon-outline</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-card variant="elevated">
                                            <EmojiPicker :native="true" @select="onSelectEmoji" />
                                        </v-card>
                                    </v-menu>

                                    <!-- Attach file button -->
                                    <v-btn icon variant="text" size="small" @click="openFileDialog" class="mr-2">
                                        <v-icon>mdi-paperclip</v-icon>
                                    </v-btn>

                                    <!-- Send button -->
                                    <v-btn color="primary" :disabled="!canSendMessage" @click="sendMessage">
                                        <span class="mr-2 text-white">
                                            Enviar
                                        </span>
                                        <v-icon color="white">mdi-send</v-icon>
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </v-main>
        </v-layout>
    </v-card>
</template>

<script lang="ts">
import AccountModel from "@/core/model/account.model";
import Conversation from '@/components/chat/conversation.vue';
import { ConversationModel } from "@/core/model/chat/conversation.model";
import { useChatStore } from "@/stores/chat";
import { useSessionStore } from "@/stores/session";
import { defineComponent } from "vue";
import Message from '@/components/chat/message.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { ConversationMessageModel } from "@/core/model/chat/conversationMessage.model";
import EmojiPicker from 'vue3-emoji-picker'

export default defineComponent({
    name: "ChatView",
    data: () => ({
        sessionStore: useSessionStore(),
        openContactList: true,
        searchQuery: '',
        showNewConversationDialog: false,
        newConversationSearch: '',
        searchResults: [] as AccountModel[],
        selectedUser: null as AccountModel | null,
        loadingConversations: false,
        chatStore: useChatStore(),
        selectedConversation: null as ConversationModel | null,
        loadingMessages: false,
        replyingTo: null as ConversationMessageModel | null,
        selectedFiles: [] as File[],
        newMessage: '',
        showEmojiPicker: false,
        maxFiles: 10,
        maxSizeMB: 25,
        acceptedMimeTypes: 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain',
    }),
    components: {
        Conversation,
        Message,
        UserAvatar,
        EmojiPicker,
    },
    computed: {
        profileImageUrl() {
            return this.sessionStore.getAccount?.profileImageUrl;
        },
        filteredConversations() {
            if (!this.searchQuery) return this.conversations;

            const query = this.searchQuery.toLowerCase();
            return this.conversations.filter(conv => {
                const name = this.getConversationName(conv).toLowerCase();
                return name.includes(query);
            });
        },
        conversations() {
            return this.chatStore.getConversations;
        },
        currentAccountId() {
            return this.sessionStore.getAccount?.id;
        },
        messages() {
            return this.chatStore.getMessages;
        },
        canSendMessage() {
            return (this.newMessage.trim().length > 0 || this.selectedFiles.length > 0) && this.selectedConversation !== null;
        },
    },
    methods: {
        onSelectEmoji(emoji: { i?: string } & Record<string, any>) {
            // En vue3-emoji-picker, 'i' es el carácter nativo cuando :native="true"
            const char = emoji?.i ?? '';
            if (char) this.newMessage += char;

            this.showEmojiPicker = false;

            // Devolver foco al input para seguir escribiendo
            this.$nextTick(() => {
                const input = this.$refs.messageInput as any;
                input?.focus?.();
            });
        },
        async sendMessage() {
            if ((!this.newMessage.trim() && !this.selectedFiles.length) || !this.selectedConversation) return;

            try {
                // Si hay archivos adjuntos
                if (this.selectedFiles.length > 0) {
                    for (const file of this.selectedFiles) {
                        const messageType = this.getMessageType(file);

                        await this.chatStore.sendMessage({
                            conversationId: this.selectedConversation.id,
                            senderId: this.currentAccountId!,
                            content: this.newMessage.trim() || file.name,
                            type: messageType,
                            metadata: JSON.stringify({
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type,
                            }),
                            replyToId: this.replyingTo?.id || null,
                            file: file,
                        });
                    }
                    this.selectedFiles = [];
                } else {
                    // Solo texto
                    await this.chatStore.sendMessage({
                        conversationId: this.selectedConversation.id,
                        senderId: this.currentAccountId!,
                        content: this.newMessage.trim(),
                        type: 'text',
                        replyToId: this.replyingTo?.id || null,
                    });
                }

                this.newMessage = '';
                this.replyingTo = null;
                this.scrollToBottom();
            } catch (error) {
                console.error('Error sending message:', error);
            }
        },
        getMessageType(file: File): 'text' | 'image' | 'file' | 'audio' | 'video' {
            if (file.type.startsWith('image/')) return 'image';
            if (file.type.startsWith('video/')) return 'video';
            if (file.type.startsWith('audio/')) return 'audio';
            return 'file';
        },
        onFilesSelected(e: Event) {
            const input = e.target as HTMLInputElement;
            if (!input.files?.length) return;

            const next = Array.from(input.files);
            // validaciones
            const errors: string[] = [];

            // límite de cantidad
            if (this.selectedFiles.length + next.length > this.maxFiles) {
                errors.push(`Máximo ${this.maxFiles} archivos.`);
            }

            // límite de tamaño por archivo
            const overSized = next.filter(f => f.size > this.maxSizeMB * 1024 * 1024);
            if (overSized.length) {
                errors.push(`Cada archivo debe pesar ≤ ${this.maxSizeMB} MB.`);
            }

            // aplica si no hay errores
            if (!errors.length) {
                this.selectedFiles = [...this.selectedFiles, ...next].slice(0, this.maxFiles);
            } else {
                // Muestra los errores como quieras
                console.warn(errors.join(' '));
            }

            // limpia el input para permitir volver a seleccionar el mismo archivo
            input.value = '';
        },
        openFileDialog() {
            (this.$refs.fileInput as HTMLInputElement)?.click();
        },
        formatBytes(bytes: number) {
            if (bytes === 0) return '0 B';
            const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
        },
        removeFile(index: number) {
            this.selectedFiles.splice(index, 1);
        },
        async handleDeleteMessage(message: ConversationMessageModel) {
            if (confirm('¿Estás seguro de eliminar este mensaje?')) {
                try {
                    await this.chatStore.deleteMessage(message.uuid);
                } catch (error) {
                    console.error('Error deleting message:', error);
                }
            }
        },
        async loadConversations() {
            if (!this.currentAccountId) return;

            this.loadingConversations = true;
            try {
                await this.chatStore.loadConversations(this.currentAccountId);
            } catch (error) {
                console.error('Error loading conversations:', error);
            } finally {
                this.loadingConversations = false;
            }
        },
        closeNewConversationDialog() {
            this.showNewConversationDialog = false;
            this.newConversationSearch = '';
            this.searchResults = [];
            this.selectedUser = null;
        },
        getConversationName(conversation: ConversationModel): string {
            if (conversation.name) return conversation.name;

            // Para conversaciones privadas
            if (conversation.isPrivate && conversation.participants) {
                // Buscar al otro participante (que no sea el usuario actual)
                const otherParticipant = conversation.participants.find(
                    p => p.accountId !== this.currentAccountId
                );

                // Si encontramos otro participante, mostrar su nombre
                if (otherParticipant?.account) {
                    return `${otherParticipant.account.firstName} ${otherParticipant.account.lastName}`;
                }

                // Si no hay otro participante, es un chat consigo mismo
                return 'Conversación privada';
            }

            return 'Conversación privada';
        },
        getConversationAvatar(conversation: ConversationModel): string | undefined {
            if (conversation.isPrivate && conversation.participants) {
                const otherParticipant = conversation.participants.find(
                    p => p.accountId !== this.currentAccountId
                );

                // Si hay otro participante, usar su avatar
                if (otherParticipant?.account?.profileImageUrl) {
                    return otherParticipant.account.profileImageUrl;
                }

                // Si es chat consigo mismo, usar el propio avatar
                if (!otherParticipant && this.profileImageUrl) {
                    return this.profileImageUrl;
                }
            }
            return undefined;
        },

        getConversationColor(conversation: ConversationModel): string {
            const colors = ['primary', 'secondary', 'success', 'info', 'warning'];
            const index = conversation.id % colors.length;
            return colors[index];
        },

        getConversationInitials(conversation: ConversationModel): string {
            // Si tiene nombre personalizado, usar ese
            if (conversation.name) {
                const parts = conversation.name.split(' ');
                return (parts[0]?.charAt(0) + (parts[1]?.charAt(0) || '')).toUpperCase();
            }

            // Para conversaciones privadas
            if (conversation.isPrivate && conversation.participants) {
                const otherParticipant = conversation.participants.find(
                    p => p.accountId !== this.currentAccountId
                );

                // Si hay otro participante, usar sus iniciales
                if (otherParticipant?.account) {
                    const first = (otherParticipant.account.firstName ?? '').trim().charAt(0);
                    const last = (otherParticipant.account.lastName ?? '').trim().charAt(0);
                    return (first + last).toUpperCase();
                }

                // Si es chat consigo mismo, usar las propias iniciales
                const account = this.sessionStore.getAccount;
                if (account) {
                    const first = (account.firstName ?? '').trim().charAt(0);
                    const last = (account.lastName ?? '').trim().charAt(0);
                    return (first + last).toUpperCase() || 'NN';
                }
                return 'NN';
            }

            return 'CP';
        },
        async selectConversation(conversation: ConversationModel) {
            this.selectedConversation = conversation;
            this.loadingMessages = true;

            try {
                await this.chatStore.loadMessages(conversation.id);
                this.scrollToBottom();
                await this.chatStore.markConversationAsRead(conversation.id, this.currentAccountId!);
            } catch (error) {
                console.error('Error loading messages:', error);
            } finally {
                this.loadingMessages = false;
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer as HTMLElement;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },
        handleReply(message: ConversationMessageModel) {
            this.replyingTo = message;
        },
        shouldShowTimestamp(message: ConversationMessageModel, index: number): boolean {
            // Si es el último mensaje, siempre mostrar timestamp
            if (index === this.messages.length - 1) {
                return true;
            }

            // Obtener el siguiente mensaje
            const nextMessage = this.messages[index + 1];
            if (!nextMessage) {
                return true;
            }

            // Formatear los timestamps a la misma granularidad (fecha + hora + minuto)
            const currentTime = new Date(message.createdAt);
            const nextTime = new Date(nextMessage.createdAt);

            // Crear claves de agrupación basadas en fecha, hora y minuto
            const currentKey = `${currentTime.getFullYear()}-${currentTime.getMonth()}-${currentTime.getDate()}-${currentTime.getHours()}-${currentTime.getMinutes()}`;
            const nextKey = `${nextTime.getFullYear()}-${nextTime.getMonth()}-${nextTime.getDate()}-${nextTime.getHours()}-${nextTime.getMinutes()}`;

            // Si las claves son diferentes, mostrar timestamp
            // Si son iguales, no mostrar (el siguiente mensaje del grupo lo mostrará)
            return currentKey !== nextKey;
        },
    },
    async mounted() {
        await this.loadConversations();
    },
});
</script>

<style>
.online-dot {
    width: 12px;
    height: 12px;
    background-color: #22c55e;
    /* verde */
    border-radius: 9999px;
    border: 2px solid white;
    /* borde blanco */
}

.messages-wrapper {
    flex-grow: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.messages-area {
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 120px;
    /* Espacio para el input flotante */
}

.input-area-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: linear-gradient(to top, #f5f5f5 70%, transparent);
    pointer-events: none;
}

.input-area-wrapper>* {
    pointer-events: all;
}

.message-input-container {
    background-color: white;
    border-radius: 24px;
    padding: 8px 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.2s;
}

.message-input-container:focus-within {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.message-input-container .v-text-field {
    background-color: transparent;
}

.message-input-container .v-field {
    background-color: transparent;
    box-shadow: none;
}

.message-input-container .v-field__outline {
    opacity: 0;
}

.message-input-container .v-field--focused .v-field__outline {
    opacity: 0;
}
</style>