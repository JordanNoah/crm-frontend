<template>
  <v-card class="chat-container">
    <!-- Header -->
    <v-card-title class="d-flex align-center justify-space-between">
      <div>
        <h3>{{ conversation?.name || 'Chat' }}</h3>
        <span class="text-caption">
          <v-icon :color="isConnected ? 'success' : 'error'" size="small">
            mdi-circle
          </v-icon>
          {{ isConnected ? 'Conectado' : 'Desconectado' }}
        </span>
      </div>
      
      <!-- Indicador de usuarios escribiendo -->
      <div v-if="typingUsers.size > 0" class="text-caption">
        {{ typingUsers.size }} persona(s) escribiendo...
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Lista de mensajes -->
    <v-card-text class="messages-container" ref="messagesContainer">
      <div v-if="chatStore.isLoading" class="text-center py-4">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>

      <div v-else>
        <div
          v-for="message in messages"
          :key="message.uuid"
          class="message-item"
          :class="{ 'own-message': message.senderId === currentAccountId }"
        >
          <v-card
            :class="message.senderId === currentAccountId ? 'bg-primary' : 'bg-grey-lighten-4'"
            elevation="1"
          >
            <v-card-text>
              <!-- Sender info -->
              <div v-if="message.senderId !== currentAccountId" class="text-caption mb-2">
                {{ message.sender?.firstName }} {{ message.sender?.lastName }}
              </div>

              <!-- Message content -->
              <div class="message-content">
                {{ message.content }}
              </div>

              <!-- Message time -->
              <div class="text-caption text-right mt-2">
                {{ formatTime(message.createdAt) }}
                
                <!-- Read receipts for own messages -->
                <v-icon
                  v-if="message.senderId === currentAccountId"
                  size="small"
                  :color="isMessageReadByAll(message) ? 'blue' : 'grey'"
                >
                  {{ isMessageReadByAll(message) ? 'mdi-check-all' : 'mdi-check' }}
                </v-icon>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <!-- Input de mensaje -->
    <v-card-actions class="pa-4">
      <v-text-field
        v-model="newMessage"
        placeholder="Escribe un mensaje..."
        variant="outlined"
        density="compact"
        hide-details
        @keyup.enter="sendMessage"
        @input="onTyping"
        :disabled="!isConnected"
      >
        <template v-slot:append>
          <v-btn
            icon="mdi-send"
            color="primary"
            @click="sendMessage"
            :disabled="!newMessage.trim() || !isConnected"
          ></v-btn>
        </template>
      </v-text-field>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useSessionStore } from '@/stores/session';
import { useWebSocket, useChatEvents, useTypingIndicator } from '@/composables/useWebSocket';
import { ConversationMessageModel } from '@/core/model/chat/conversationMessage.model';

// Props
const props = defineProps<{
  conversationId: number;
}>();

// Stores
const chatStore = useChatStore();
const sessionStore = useSessionStore();

// WebSocket
const { isConnected } = useWebSocket();
const chatEvents = useChatEvents();

// Refs
const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

// Computed
const conversation = computed(() => chatStore.getCurrentConversation);
const messages = computed(() => chatStore.getMessages);
const currentAccountId = computed(() => sessionStore.account?.id || null);

// Typing indicator
const { typingUsers, notifyTyping, notifyStoppedTyping } = useTypingIndicator(
  computed(() => props.conversationId),
  currentAccountId
);

// Methods
const loadMessages = async () => {
  try {
    await chatStore.loadMessages(props.conversationId);
    scrollToBottom();
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentAccountId.value) return;

  try {
    await chatStore.sendMessage({
      conversationId: props.conversationId,
      senderId: currentAccountId.value,
      content: newMessage.value,
      type: 'text',
    });

    newMessage.value = '';
    notifyStoppedTyping();
    scrollToBottom();
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
  }
};

const onTyping = () => {
  notifyTyping();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const isMessageReadByAll = (message: ConversationMessageModel): boolean => {
  if (!message.statuses || message.statuses.length === 0) return false;
  return message.statuses.every(s => s.status === 'read');
};

// Lifecycle
onMounted(async () => {
  await loadMessages();

  // Escuchar nuevos mensajes (opcional, el store ya lo maneja)
  chatEvents.onNewMessage((data) => {
    if (data.conversationId === props.conversationId) {
      scrollToBottom();
    }
  });
});

onUnmounted(() => {
  // Limpiar conversación actual y salir de la sala
  chatStore.clearCurrentConversation();
});

// Watch para scroll automático
watch(messages, () => {
  scrollToBottom();
}, { deep: true });
</script>

<style scoped>
.chat-container {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message-item {
  margin-bottom: 12px;
  max-width: 70%;
}

.message-item.own-message {
  margin-left: auto;
}

.message-content {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
