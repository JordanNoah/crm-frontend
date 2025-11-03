<template>
    <div 
        class="message-wrapper mb-3"
        :class="{ 'own-message': isOwn }"
    >
        <div class="message-bubble pa-3 rounded-lg" :class="{ 'own': isOwn }">
            <!-- Mensaje al que responde -->
            <div v-if="message.replyTo" class="reply-preview pa-2 mb-2 rounded">
                <p class="text-caption text-primary mb-0">{{ message.replyTo.sender?.firstName }}</p>
                <p class="text-caption mb-0">{{ message.replyTo.content.substring(0, 50) }}...</p>
            </div>
            
            <!-- Contenido del mensaje -->
            <div v-if="message.isText">
                <p class="mb-0">{{ message.content }}</p>
            </div>
            
            <div v-else-if="message.isImage" class="message-image">
                <v-img :src="message.parsedMetadata?.url" max-width="300" />
            </div>
            
            <div v-else-if="message.isFile" class="d-flex align-center">
                <v-icon class="mr-2">mdi-file-document</v-icon>
                <span>{{ message.parsedMetadata?.fileName || 'Archivo' }}</span>
            </div>
            
            <!-- Hora y estado -->
            <div class="d-flex align-center justify-end mt-1">
                <span class="text-caption mr-1" :class="isOwn ? 'text-grey-lighten-1' : 'text-grey'">
                    {{ message.formattedTime }}
                </span>
                <v-icon v-if="isOwn && messageStatus" size="16" :color="messageStatus.statusColor">
                    {{ messageStatus.statusIcon }}
                </v-icon>
            </div>
        </div>
        
        <!-- Menú de acciones -->
        <v-menu v-if="isOwn" location="start">
            <template v-slot:activator="{ props }">
                <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    class="message-menu"
                    v-bind="props"
                >
                    <v-icon size="16">mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <v-list density="compact">
                <v-list-item @click="$emit('reply', message)">
                    <template v-slot:prepend>
                        <v-icon size="small">mdi-reply</v-icon>
                    </template>
                    <v-list-item-title>Responder</v-list-item-title>
                </v-list-item>
                <v-list-item @click="$emit('delete', message)">
                    <template v-slot:prepend>
                        <v-icon size="small" color="error">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title class="text-error">Eliminar</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ConversationMessageModel } from '@/core/model/chat/conversationMessage.model';

export default defineComponent({
    name: 'MessageItem',
    props: {
        message: {
            type: Object as PropType<ConversationMessageModel>,
            required: true,
        },
        isOwn: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        messageStatus() {
            if (!this.isOwn || !this.message.statuses) return null;
            // Retornar el estado más reciente o el de lectura si existe
            const readStatus = this.message.statuses.find(s => s.isRead);
            return readStatus || this.message.statuses[0];
        },
    },
});
</script>

<style scoped>
.message-wrapper {
    display: flex;
    align-items: flex-start;
}

.message-wrapper.own-message {
    flex-direction: row-reverse;
}

.message-bubble {
    max-width: 70%;
    position: relative;
}

.message-bubble:not(.own) {
    background-color: white;
}

.message-bubble.own {
    background-color: rgb(var(--v-theme-primary));
    color: white;
}

.reply-preview {
    background-color: rgba(0, 0, 0, 0.1);
    border-left: 3px solid rgba(var(--v-theme-primary));
}

.message-menu {
    opacity: 0;
    transition: opacity 0.2s;
}

.message-wrapper:hover .message-menu {
    opacity: 1;
}

.message-image {
    border-radius: 8px;
    overflow: hidden;
}
</style>