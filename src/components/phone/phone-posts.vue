<template>
    <v-container>
        <div class="d-flex justify-end">
            <VBtn @click="dialog = true">Nuevo Post</VBtn>
        </div>

        <v-dialog v-model="dialog" max-width="600px">
            <v-card variant="elevated">
                <v-card-title>Crear Nuevo Post</v-card-title>
                <v-card-text>
                    <v-form>
                        <v-text-field label="Título" required></v-text-field>
                        <v-textarea label="Contenido" required></v-textarea>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="dialog = false">Cancelar</v-btn>
                    <v-btn text color="primary">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'PhonePosts',
    data: () => ({
        dialog: false
    })
})
</script>