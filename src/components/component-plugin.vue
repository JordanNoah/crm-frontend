<template>
    <v-card  style="cursor: pointer;">
        <v-hover v-slot="{ isHovering, props }">
            <v-img height="200px" :src="plugin.image" cover :class="{ 'on-hover': isHovering }" v-bind="props">
                <div class="w-100 h-100 d-flex justify-end pa-4" v-if="!plugin.isAdded">
                    <VBtn v-if="isHovering" color="primary" dark size="small">
                        <VIcon>
                            mdi-plus
                        </VIcon>
                        Añadir
                    </VBtn>
                </div>
            </v-img>
        </v-hover>
        <v-card-title>
            {{ plugin.name }}
        </v-card-title>
        <v-card-text>
            <div class="clamp-3">
                {{ plugin.description }}
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PluginModel from '@/core/model/plugin.model';

export default defineComponent({
    name: 'ComponentPlugin',
    props: {
        plugin: {
            type: Object as () => PluginModel,
            required: true
        }
    },
});
</script>

<style scoped>
.v-btn .v-icon {
    color: rgb(var(--v-theme-on-primary)) !important;
}

.clamp-3 {
    /* ajusta si usas otro tamaño de tipografía */
    --lines: 3;
    --lh: 1.25rem;
    /* line-height efectivo del texto */

    line-height: var(--lh);
    max-height: calc(var(--lines) * var(--lh));

    display: -webkit-box;
    -webkit-line-clamp: var(--lines);
    -webkit-box-orient: vertical;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    /* evita respetar \n como saltos reales */
    word-break: break-word;
    /* por si vienen palabras largas */
}
</style>