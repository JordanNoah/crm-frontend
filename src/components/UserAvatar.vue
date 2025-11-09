<template>
    <v-badge
        v-if="showStatus"
        dot
        :color="statusColor"
        location="bottom end"
        overlap
        bordered
        :offset-x="badgeOffset"
        :offset-y="badgeOffset"
    >
        <v-avatar 
            :size="size" 
            :color="avatarColor"
        >
            <v-img v-if="computedImageUrl" :src="computedImageUrl" />
            <span v-else>{{ computedInitials }}</span>
        </v-avatar>
    </v-badge>
    
    <v-avatar 
        v-else
        :size="size" 
        :color="avatarColor"
    >
        <v-img v-if="computedImageUrl" :src="computedImageUrl" />
        <span v-else>{{ computedInitials }}</span>
    </v-avatar>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AccountModel from '@/core/model/account.model';

export default defineComponent({
    name: 'UserAvatar',
    props: {
        // Account object completo
        account: {
            type: Object as PropType<AccountModel | null>,
            default: null,
        },
        // Alternativas directas
        imageUrl: {
            type: String as PropType<string | null | undefined>,
            default: null,
        },
        initials: {
            type: String as PropType<string | null>,
            default: null,
        },
        color: {
            type: String,
            default: 'primary',
        },
        // Configuración de tamaño
        size: {
            type: [Number, String],
            default: 40,
        },
        // Configuración de estado
        showStatus: {
            type: Boolean,
            default: false,
        },
        statusColor: {
            type: String,
            default: 'success',
        },
    },
    computed: {
        computedImageUrl(): string | null | undefined {
            // Prioridad: prop directa imageUrl > account.profileImageUrl
            if (this.imageUrl) return this.imageUrl;
            if (this.account?.profileImageUrl) return this.account.profileImageUrl;
            return null;
        },
        computedInitials(): string {
            // Prioridad: prop directa initials > generadas desde account
            if (this.initials) return this.initials;
            
            if (this.account) {
                const firstName = (this.account.firstName ?? '').trim();
                const lastName = (this.account.lastName ?? '').trim();
                
                const firstInitial = firstName.charAt(0).toUpperCase();
                const lastInitial = lastName.charAt(0).toUpperCase();
                
                return firstInitial + lastInitial || 'NN';
            }
            
            return 'NN';
        },
        avatarColor(): string {
            return this.color;
        },
        badgeOffset(): number {
            // Calcular offset proporcional al tamaño
            const sizeNum = typeof this.size === 'number' ? this.size : parseInt(this.size);
            return Math.max(2, Math.floor(sizeNum * 0.075));
        },
    },
});
</script>
