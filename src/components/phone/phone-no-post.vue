<template>
    <v-container>
        <v-img :src="imageUrl" alt="No Posts" height="200px"/>
        <div class="text-center mt-5">
            <h3>No hay publicaciones</h3>
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'PhoneNoPost',
    computed: {
        imageUrl(): string {
            return new URL('@/assets/no-post.svg', import.meta.url).href
        }
    }
})
</script>