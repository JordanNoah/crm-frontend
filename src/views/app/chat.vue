<template>
    <v-card height="100%" width="100%" variant="elevated" elevation="0">
        <v-container fluid class="py-0" style="height: 100%;">
            <v-row class="fill-height" no-gutters>
                <!-- Lista de conversaciones -->
                <v-col cols="3" class="border-e-sm pb-0 d-flex flex-column">
                    <!-- Header -->
                    <div class="border-b-sm mb-4 py-4 pr-2 d-flex align-center">
                        <v-avatar size="40" class="mr-2">
                            <v-img :src="profileImageUrl ?? undefined" v-if="profileImageUrl" />
                            <span v-else>{{ getInitials() }}</span>
                        </v-avatar>
                        <v-text-field v-model="searchQuery" dense hide-details label="Buscar"
                            prepend-inner-icon="mdi-magnify" clearable />
                        <v-btn icon size="small" color="transparent" class="ml-2"
                            @click="showNewConversationDialog = true">
                            <v-icon>mdi-message-plus</v-icon>
                        </v-btn>
                    </div>

                    <!-- Lista de conversaciones -->
                    <div class="flex-grow-1 overflow-y-auto">
                        <h4 class="mb-2">Chats</h4>

                        <v-progress-linear v-if="loadingConversations" indeterminate />

                        <div v-else-if="filteredConversations.length === 0" class="text-center pa-4">
                            <v-icon size="64" color="grey">mdi-message-outline</v-icon>
                            <p class="text-grey mt-2">No hay conversaciones</p>
                        </div>

                        <div v-else>
                            <Conversation v-for="conversation in filteredConversations" :key="conversation.uuid"
                                :conversation="conversation"
                                :is-active="selectedConversation?.uuid === conversation.uuid"
                                :name="getConversationName(conversation)" :avatar="getConversationAvatar(conversation)"
                                :avatar-color="getConversationColor(conversation)"
                                :initials="getConversationInitials(conversation)"
                                @click="selectConversation(conversation)" />
                        </div>
                    </div>
                </v-col>

                <!-- Área de chat -->
                <v-col cols="9" class="d-flex flex-column pa-0">
                    <!-- Sin conversación seleccionada -->
                    <div v-if="!selectedConversation" class="d-flex align-center justify-center flex-column"
                        style="height: 100%;">
                        <v-icon size="120" color="grey-lighten-2">mdi-message-text-outline</v-icon>
                        <h2 class="text-grey-lighten-1 mt-4">Selecciona una conversación</h2>
                        <p class="text-grey">Elige un chat de la lista para comenzar a conversar</p>
                    </div>

                    <!-- Conversación seleccionada -->
                    <div v-else class="d-flex flex-column" style="height: 100%;">
                        <!-- Header del chat -->
                        <div class="border-b-sm pa-4 d-flex align-center">
                            <v-avatar size="40" :color="getConversationColor(selectedConversation)" class="mr-3">
                                <v-img :src="getConversationAvatar(selectedConversation)"
                                    v-if="getConversationAvatar(selectedConversation)" />
                                <span v-else>{{ getConversationInitials(selectedConversation) }}</span>
                            </v-avatar>
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

                        <!-- Mensajes -->
                        <div ref="messagesContainer" class="flex-grow-1 overflow-y-auto pa-4"
                            style="background-color: #f5f5f5;">
                            <v-progress-linear v-if="loadingMessages" indeterminate />

                            <div v-else-if="messages.length === 0" class="text-center pa-8">
                                <p class="text-grey">No hay mensajes en esta conversación</p>
                                <p class="text-caption text-grey">Envía un mensaje para comenzar</p>
                            </div>

                            <div v-else>
                                <Message v-for="message in messages" :key="message.uuid" :message="message"
                                    :is-own="message.senderId === currentAccountId" @reply="handleReply"
                                    @delete="handleDeleteMessage" />
                            </div>
                        </div>
                        <!-- Input de mensaje -->
                        <div class="pa-4">
                            <div v-if="selectedFiles.length" class="px-4 pb-2 d-flex flex-wrap gap-2" style="max-height: 80px; overflow: auto;">
                                <v-chip v-for="(f, i) in selectedFiles" :key="f.name + i" variant="tonal" class="mr-2 mb-2"
                                    density="comfortable" closable @click:close="removeFile(i)">
                                    {{ f.name }} — {{ formatBytes(f.size) }}
                                </v-chip>
                            </div>
                            <div class="d-flex align-center">
                                <v-menu v-model="showEmojiPicker" :close-on-content-click="false" location="top">
                                    <template #activator="{ props }">
                                        <v-btn color="transparent" icon size="small" class="mr-2" v-bind="props">
                                            <v-icon>mdi-emoticon-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <EmojiPicker :native="true" @select="onSelectEmoji" />
                                </v-menu>

                                <v-btn icon color="transparent" size="small" class="mr-2" @click="openFileDialog">
                                    <v-icon>mdi-attachment</v-icon>
                                </v-btn>

                                <!-- input file oculto -->
                                <input ref="fileInput" type="file" multiple :accept="acceptedMimeTypes"
                                    style="display:none" @change="onFilesSelected" />

                                <!-- Añade ref para devolver el foco tras insertar emoji -->
                                <v-text-field ref="messageInput" v-model="newMessage" hide-details
                                    placeholder="Escribe un mensaje..." variant="outlined" density="compact"
                                    @keydown.enter.prevent="sendMessage" />
                                <v-btn icon size="small" class="ml-2" color="primary" :disabled="!newMessage.trim()"
                                    @click="sendMessage">
                                    <v-icon>mdi-send</v-icon>
                                </v-btn>
                            </div>
                        </div>

                    </div>
                </v-col>
            </v-row>
        </v-container>

        <!-- Dialog para nueva conversación -->
        <v-dialog v-model="showNewConversationDialog" max-width="500">
            <v-card variant="elevated">
                <v-card-title>Nueva conversación</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newConversationSearch" label="Buscar usuario (nombre o email)"
                        prepend-inner-icon="mdi-magnify" hide-details="auto" class="mb-4" @input="searchUsers"
                        :loading="searchingUsers" />

                    <v-progress-linear v-if="searchingUsers" indeterminate class="mb-2" />

                    <div v-if="searchResults.length > 0" class="mt-4">
                        <h4 class="mb-2">Resultados</h4>
                        <v-list>
                            <v-list-item v-for="user in searchResults" :key="user.id" @click="selectUser(user)"
                                :class="{ 'bg-grey-lighten-3': selectedUser?.id === user.id }">
                                <template v-slot:prepend>
                                    <v-avatar :color="getUserColor(user)">
                                        <v-img :src="user.profileImageUrl" v-if="user.profileImageUrl" />
                                        <span v-else>{{ getUserInitials(user) }}</span>
                                    </v-avatar>
                                </template>
                                <v-list-item-title>{{ user.firstName }} {{ user.lastName }}</v-list-item-title>
                                <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </div>

                    <div v-else-if="newConversationSearch && !searchingUsers" class="text-center pa-4">
                        <v-icon size="48" color="grey">mdi-account-search</v-icon>
                        <p class="text-grey mt-2">No se encontraron usuarios</p>
                    </div>

                    <div v-else class="text-center pa-4">
                        <v-icon size="48" color="grey">mdi-account-search</v-icon>
                        <p class="text-grey mt-2">Busca un usuario de tu compañía</p>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="closeNewConversationDialog">Cancelar</v-btn>
                    <v-btn color="primary" @click="createNewConversation" :disabled="!selectedUser">
                        Iniciar chat
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useSessionStore } from '@/stores/session';
import Conversation from '@/components/chat/conversation.vue';
import Message from '@/components/chat/message.vue';
import { ConversationModel } from '@/core/model/chat/conversation.model';
import { ConversationMessageModel } from '@/core/model/chat/conversationMessage.model';
import { useChatStore } from '@/stores/chat';
import AuthProvider from '@/core/providers/auth/auth';
import AccountModel from '@/core/model/account.model';
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

export default defineComponent({
    name: 'ChatView',
    components: {
        Conversation,
        Message,
        EmojiPicker
    },
    data: () => ({
        sessionStore: useSessionStore(),
        chatStore: useChatStore(),
        searchQuery: '',
        newMessage: '',
        selectedConversation: null as ConversationModel | null,
        replyingTo: null as ConversationMessageModel | null,
        showNewConversationDialog: false,
        newConversationSearch: '',
        searchResults: [] as AccountModel[],
        selectedUser: null as AccountModel | null,
        searchingUsers: false,
        searchTimeout: null as any,
        loadingConversations: false,
        loadingMessages: false,
        showEmojiPicker: false,
        selectedFiles: [] as File[],
        maxFiles: 10,
        maxSizeMB: 25,
        acceptedMimeTypes: 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain',
    }),
    computed: {
        profileImageUrl() {
            return this.sessionStore.getAccount?.profileImageUrl;
        },
        currentAccountId() {
            return this.sessionStore.getAccount?.id;
        },
        conversations() {
            return this.chatStore.getConversations;
        },
        filteredConversations() {
            if (!this.searchQuery) return this.conversations;

            const query = this.searchQuery.toLowerCase();
            return this.conversations.filter(conv => {
                const name = this.getConversationName(conv).toLowerCase();
                return name.includes(query);
            });
        },
        messages() {
            return this.chatStore.getMessages;
        },
    },
    methods: {
        getInitials() {
            const account = this.sessionStore.getAccount;
            const first = (account?.firstName ?? '').trim().split(' ')[0] || '';
            const last = (account?.lastName ?? '').trim().split(' ')[0] || '';
            const initials = (first.charAt(0) + last.charAt(0)).toUpperCase();
            return initials;
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
                return this.getInitials();
            }

            return 'CP';
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

        async sendMessage() {
            if (!this.newMessage.trim() || !this.selectedConversation) return;

            try {
                await this.chatStore.sendMessage({
                    conversationId: this.selectedConversation.id,
                    senderId: this.currentAccountId!,
                    content: this.newMessage.trim(),
                    type: 'text',
                    replyToId: this.replyingTo?.id || null,
                });

                this.newMessage = '';
                this.replyingTo = null;
                this.scrollToBottom();
            } catch (error) {
                console.error('Error sending message:', error);
            }
        },

        handleReply(message: ConversationMessageModel) {
            this.replyingTo = message;
        },

        cancelReply() {
            this.replyingTo = null;
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

        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer as HTMLElement;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },

        async searchUsers() {
            if (!this.newConversationSearch || this.newConversationSearch.trim().length < 2) {
                this.searchResults = [];
                return;
            }

            // Debounce para evitar demasiadas peticiones
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            this.searchTimeout = setTimeout(async () => {
                this.searchingUsers = true;
                console.log('Iniciando búsqueda de usuarios...');
                try {
                    const companyId = this.sessionStore.getCompany?.id;
                    console.log('Company ID:', companyId);

                    if (!companyId) {
                        console.error('No company ID found');
                        return;
                    }

                    console.log('Buscando:', this.newConversationSearch.trim());
                    const results = await AuthProvider.searchCompanyUsers(
                        companyId,
                        this.newConversationSearch.trim()
                    );

                    this.searchResults = results;
                } catch (error) {
                    console.error('Error searching users:', error);
                    this.searchResults = [];
                } finally {
                    this.searchingUsers = false;
                }
            }, 300);
        },

        selectUser(user: AccountModel) {
            this.selectedUser = user;
        },

        getUserInitials(user: AccountModel): string {
            const first = (user.firstName ?? '').trim().charAt(0);
            const last = (user.lastName ?? '').trim().charAt(0);
            return (first + last).toUpperCase();
        },

        getUserColor(user: AccountModel): string {
            const colors = ['primary', 'secondary', 'success', 'info', 'warning'];
            const index = user.id % colors.length;
            return colors[index];
        },

        async createNewConversation() {
            if (!this.selectedUser || !this.currentAccountId) return;

            this.searchingUsers = true;
            try {
                // Buscar si ya existe una conversación privada con este usuario
                const existingConversation = await this.chatStore.findOrCreatePrivateConversation(
                    this.currentAccountId,
                    this.selectedUser.id
                );

                // Seleccionar la conversación
                await this.selectConversation(existingConversation);

                // Cerrar el diálogo
                this.closeNewConversationDialog();
            } catch (error) {
                console.error('Error creating conversation:', error);
                alert('Error al crear la conversación. Por favor, intenta de nuevo.');
            } finally {
                this.searchingUsers = false;
            }
        },

        closeNewConversationDialog() {
            this.showNewConversationDialog = false;
            this.newConversationSearch = '';
            this.searchResults = [];
            this.selectedUser = null;
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
        openFileDialog() {
            (this.$refs.fileInput as HTMLInputElement)?.click();
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

        removeFile(index: number) {
            this.selectedFiles.splice(index, 1);
        },

        formatBytes(bytes: number) {
            if (bytes === 0) return '0 B';
            const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
        },
    },
    async mounted() {
        await this.loadConversations();

        // Configurar polling o WebSocket para actualizaciones en tiempo real
        // setInterval(() => {
        //     if (this.selectedConversation) {
        //         this.chatStore.loadMessages(this.selectedConversation.id);
        //     }
        // }, 5000);
    },
});
</script>

<style scoped>
.fill-height {
    height: 100%;
}

.overflow-y-auto {
    overflow-y: auto;
}

.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>