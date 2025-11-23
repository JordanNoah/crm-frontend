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
                :size="40"
                :show-status="showPresenceIndicator"
                :status-color="presenceColor"
                :status-icon="presenceIcon"
                status-icon-color="white"
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
import { usePresenceStore } from '@/stores/presence';
import { useSessionStore } from '@/stores/session';

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
        // Tipo de conversación para determinar el ícono
        conversationType: {
            type: String as PropType<'default' | 'phone' | 'video'>,
            default: 'default',
        },
    },
    setup() {
        const presenceStore = usePresenceStore();
        const sessionStore = useSessionStore();
        
        return {
            presenceStore,
            sessionStore,
        };
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
        // Obtener el ID del otro participante en conversaciones privadas
        otherParticipantId(): number | null {
            if (!this.conversation.isPrivate || !this.conversation.participants) {
                return null;
            }

            const currentUserId = this.sessionStore.getAccount?.id;
            const otherParticipant = this.conversation.participants.find(
                p => p.accountId !== currentUserId
            );

            return otherParticipant?.accountId || null;
        },
        // Verificar si el otro usuario está online
        isOtherUserOnline(): boolean {
            if (!this.otherParticipantId) return false;
            return this.presenceStore.isUserOnline(this.otherParticipantId);
        },
        // Mostrar indicador de presencia/tipo
        showPresenceIndicator(): boolean {
            // Para mobile (phone): SIEMPRE mostrar el ícono de teléfono
            if (this.conversation.isMobile) {
                return true;
            }
            
            // Para conversaciones empresa-empresa (private/group): mostrar solo si hay otro participante Y está online
            const isOneToOne = this.conversation.isPrivate && this.otherParticipantId !== null;
            return isOneToOne && this.isOtherUserOnline;
        },
        
        // Color del indicador
        presenceColor(): string {
            // Para mobile: siempre verde
            if (this.conversation.isMobile) {
                return 'success';
            }
            // Para empresa-empresa: verde si online, gris si offline
            return this.isOtherUserOnline ? 'success' : 'grey';
        },
        
        // Ícono según el tipo de conversación
        presenceIcon(): string | null {
            // Para mobile (phone): SIEMPRE mostrar ícono de teléfono verde
            if (this.conversationType === 'phone') {
                return 'mdi-cellphone';
            }
            
            // Para video: mostrar ícono de video
            if (this.conversationType === 'video') {
                return 'mdi-video';
            }
            
            // Para conversaciones normales (empresa-empresa): no mostrar ícono, solo el punto circular
            return null;
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
