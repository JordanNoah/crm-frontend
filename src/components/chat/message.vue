<template>
    <v-container class="d-flex fluid pa-0 mb-1" :class="isOwn ? 'justify-end' : 'justify-start'">
        <div class="d-flex flex-column" style="max-width:60%">
            <div class="d-none align-center mb-2" s>
                <span class="text-caption font-weight-light mr-2">
                    {{ isOwn ? 'Tú' : 'message.senderName' }}
                </span>
            </div>
            <div>
                <v-card 
                    :class="[
                        isOwn ? 'bg-primary message-bubble-own' : 'bg-grey-lighten-4 message-bubble-other'
                    ]" 
                    min-width="200px" 
                    max-width="400px"
                    class="px-4 py-1"
                >
                    <!-- Mensaje de texto -->
                    <p v-if="message.isText" class="mb-1" :class="isOwn ? 'text-white' : 'text-black'">{{ message.content }}</p>
                    
                    <!-- Archivo (imagen, video, audio, file) -->
                    <div v-else class="file-message" @click="downloadFile">
                        <div class="d-flex align-center py-4 px-2 cursor-pointer">
                            <div 
                                class="file-icon-container mr-3" 
                                :class="isOwn ? 'file-icon-own' : 'file-icon-other'"
                            >
                                <v-icon :color="isOwn ? 'white' : 'white'" size="28">
                                    {{ getFileIcon() }}
                                </v-icon>
                            </div>
                            <div class="flex-grow-1">
                                <p class="mb-0 text-body-2 font-weight-medium" :class="isOwn ? 'text-white' : 'text-black'">
                                    {{ fileMetadata?.fileName || getDefaultFileName() }}
                                </p>
                                <p class="mb-0 text-caption" :class="isOwn ? 'text-white' : 'text-grey'">
                                    {{ formatFileSize(fileMetadata?.fileSize) }}
                                </p>
                            </div>
                            <v-icon :color="isOwn ? 'white' : 'primary'">
                                mdi-download
                            </v-icon>
                        </div>
                    </div>
                </v-card>
            </div>
            <div v-if="showTimestamp" class="d-flex justify-end">
                <div v-if="isOwn && messageStatus" class="mt-2">
                    <v-icon small :color="messageStatus.isRead ? 'green' : 'grey'">
                        {{ messageStatus.isRead ? 'mdi-check-all' : 'mdi-check' }}
                    </v-icon>
                </div>
                <span class="text-caption font-weight-light">
                    {{ new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </span>
            </div>
        </div>
    </v-container>
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
        showTimestamp: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        messageStatus() {
            if (!this.isOwn || !this.message.statuses) return null;
            // Retornar el estado más reciente o el de lectura si existe
            const readStatus = this.message.statuses.find(s => s.isRead);
            return readStatus || this.message.statuses[0];
        },
        fileMetadata() {
            return this.message.parsedMetadata;
        },
    },
    methods: {
        getFileIcon(): string {
            // Primero verificar el tipo de mensaje
            if (this.message.isImage) return 'mdi-image';
            if (this.message.isVideo) return 'mdi-video';
            if (this.message.isAudio) return 'mdi-music';
            
            // Si es archivo, usar el fileType del metadata
            const fileType = this.fileMetadata?.fileType;
            if (!fileType) return 'mdi-file';
            
            const type = fileType.toLowerCase();
            
            // Documentos
            if (type.includes('pdf')) return 'mdi-file-pdf-box';
            if (type.includes('word') || type.includes('doc')) return 'mdi-file-word';
            if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return 'mdi-file-excel';
            if (type.includes('powerpoint') || type.includes('presentation') || type.includes('ppt')) return 'mdi-file-powerpoint';
            
            // Archivos comprimidos
            if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'mdi-folder-zip';
            
            // Código
            if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return 'mdi-code-braces';
            if (type.includes('html') || type.includes('css')) return 'mdi-language-html5';
            if (type.includes('python')) return 'mdi-language-python';
            
            // Texto
            if (type.includes('text') || type.includes('txt')) return 'mdi-text-box';
            
            return 'mdi-file';
        },
        getDefaultFileName(): string {
            if (this.message.isImage) return 'Imagen';
            if (this.message.isVideo) return 'Video';
            if (this.message.isAudio) return 'Audio';
            return 'Archivo';
        },
        formatFileSize(bytes?: number): string {
            if (!bytes) return 'Tamaño desconocido';
            
            if (bytes < 1024) return `${bytes} B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
            if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
            return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        },
        async downloadFile() {
            try {
                const url = this.message.content;
                const fileName = this.fileMetadata?.fileName || `archivo_${this.message.id}`;
                
                // Crear un enlace temporal para descargar
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.target = '_blank';
                
                // Simular click
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error al descargar archivo:', error);
            }
        },
    },
});
</script>

<style scoped>
.message-bubble-own {
    border-radius: 12px 4px 12px 12px !important;
}

.message-bubble-other {
    border-radius: 4px 12px 12px 12px !important;
}

.cursor-pointer {
    cursor: pointer;
}

.cursor-pointer:hover {
    opacity: 0.9;
    transition: opacity 0.2s;
}

.file-message {
    margin: -8px;
}

.file-message:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s;
}

.file-icon-container {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    flex-shrink: 0;
}

.file-icon-container .v-icon {
    background: none !important;
    background-color: transparent !important;
}

.file-icon-own {
    background-color: rgba(0, 0, 0, 0.3);
}

.file-icon-other {
    background-color: rgba(0, 0, 0, 0.4);
}
</style>