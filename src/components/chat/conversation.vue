<template>
    <div 
        class="conversation-item py-2 px-3 d-flex align-center"
        :class="{ 'active': isActive }"
        @click="$emit('click')"
    >
        <v-badge
            :content="conversation.unreadCount"
            :model-value="conversation.hasUnreadMessages"
            color="primary"
            overlap
        >
            <UserAvatar 
                :image-url="avatar"
                :initials="initials"
                :color="avatarColor"
                size="40"
            />
        </v-badge>
        
        <div class="flex-grow-1 ml-3 overflow-hidden">
            <div class="d-flex align-center justify-space-between">
                <h5 class="text-truncate mb-0">{{ name }}</h5>
                <span class="text-caption text-grey">{{ formattedTime }}</span>
            </div>
            <div class="d-flex align-center">
                <p class="text-caption text-grey text-truncate mb-0 flex-grow-1">
                    {{ lastMessagePreview }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ConversationModel } from '@/core/model/chat/conversation.model';
import UserAvatar from '@/components/UserAvatar.vue';

export default defineComponent({
    name: 'ConversationItem',
    components: {
        UserAvatar,
    },
    props: {
        conversation: {
            type: Object as PropType<ConversationModel>,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
            default: 'Sin nombre',
        },
        avatar: {
            type: String,
            default: null,
        },
        avatarColor: {
            type: String,
            default: 'primary',
        },
        initials: {
            type: String,
            default: 'NN',
        },
    },
    computed: {
        lastMessagePreview(): string {
            const lastMsg = this.conversation.lastMessage;
            if (!lastMsg) return 'No hay mensajes';
            
            if (lastMsg.type !== 'text') {
                const types: Record<string, string> = {
                    image: '📷 Imagen',
                    file: '📎 Archivo',
                    audio: '🎤 Audio',
                    video: '🎥 Video',
                };
                return types[lastMsg.type] || 'Mensaje';
            }
            
            return lastMsg.content;
        },
        formattedTime(): string {
            const lastMsg = this.conversation.lastMessage;
            if (!lastMsg) return '';
            return lastMsg.formattedTime;
        },
    },
});
</script>

<style scoped>
.conversation-item {
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.conversation-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.conversation-item.active {
    background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>