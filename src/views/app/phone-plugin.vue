<template>
    <v-container>
        <v-slide-group v-model="selectedView" class="mb-4" show-arrows>
            <v-slide-group-item value="1">
                <v-btn text class="mr-4" :class="selectedView === 1 ? 'primary--text' : ''" @click="selectedView = 1">Posts</v-btn>
            </v-slide-group-item>
            <v-slide-group-item value="2">
                <v-btn text class="mr-4" :class="selectedView === 2 ? 'primary--text' : ''" @click="selectedView = 2">Estadisticas</v-btn>
            </v-slide-group-item>
            <v-slide-group-item value="3">
                <v-btn text class="mr-4" :class="selectedView === 3 ? 'primary--text' : ''" @click="selectedView = 3">Mensajes</v-btn>
            </v-slide-group-item>
            <v-slide-group-item value="4">
                <v-btn text class="mr-4" :class="selectedView === 4 ? 'primary--text' : ''" @click="selectedView = 4">Configuraciones</v-btn>
            </v-slide-group-item>
        </v-slide-group>
        
        <v-card>
            <v-container v-if="selectedView === 1">
                <PhonePosts />
            </v-container>
            <v-container v-if="selectedView === 2">
                <p>Contenido de la Otra Vista</p>
            </v-container>
            <v-container v-if="selectedView === 3">
                <p>Contenido de la Tercera Vista</p>
            </v-container>
            <v-container v-if="selectedView === 4">
                <PhoneConfiguration />
            </v-container>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import PhonePosts from '@/components/phone/phone-posts.vue';
import PhoneConfiguration from '@/components/phone/phone-configuration.vue';
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'PhonePluginView',
    data: () => ({
        selectedView: 1
    }),
    components: {
        PhonePosts,
        PhoneConfiguration
    }
})
</script>