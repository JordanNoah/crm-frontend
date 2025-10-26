<template>
    <v-dialog v-model="dialogReperesent" max-width="700" :retain-focus="false">
        <v-card variant="elevated">
            <!-- Header -->
            <v-card-title class="d-flex align-center justify-space-between pa-6 border-b">
                <span class="text-h6 font-weight-bold">Editar Chef</span>
                <v-btn icon variant="text" size="small" @click="close">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <!-- Body -->
            <v-card-text class="pa-6">
                <v-row>
                    <!-- Imagen del Chef -->
                    <v-col cols="12" class="text-center">
                        <div class="text-caption text-uppercase font-weight-bold grey--text text--darken-1 mb-4">
                            Foto del Chef
                        </div>

                        <v-avatar size="150" class="mb-4" color="grey-lighten-3">
                            <v-img v-if="imagePreview"
                                :src="imagePreview" cover>
                                <template v-slot:placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular indeterminate color="grey" />
                                    </div>
                                </template>
                            </v-img>
                            <v-icon v-else size="64" color="grey">mdi-account</v-icon>
                        </v-avatar>

                        <div>
                            <v-btn variant="outlined" color="primary" size="small" @click="triggerFileInput">
                                <v-icon start size="small">mdi-camera</v-icon>
                                Cambiar foto
                            </v-btn>
                            <div class="text-caption text-grey mt-2">
                                JPG, PNG o GIF. Máx 5MB
                            </div>

                            <!-- Input oculto -->
                            <v-file-input v-show="false" v-model="selectedFile" ref="fileInput"
                                accept="image/png, image/jpeg, image/gif" @update:modelValue="handleImageUpload" />
                        </div>
                    </v-col>

                    <!-- Nombre -->
                    <v-col cols="12">
                        <v-text-field v-model="localChefData.name" label="Nombre del chef" variant="outlined"
                            density="comfortable" :rules="[rules.required]" placeholder="Ej: Juan Pérez" />
                    </v-col>

                    <!-- Biografía -->
                    <v-col cols="12">
                        <v-textarea v-model="localChefData.description" label="Biografía" variant="outlined" density="comfortable"
                            rows="4" :rules="[rules.required]"
                            placeholder="Escribe una breve biografía que aparecerá en la app móvil..." counter="300"
                            :maxlength="300" />
                    </v-col>
                </v-row>
            </v-card-text>

            <!-- Footer -->
            <v-card-actions class="pa-6 pt-0">
                <v-spacer />
                <v-btn variant="text" @click="close">
                    Cancelar
                </v-btn>
                <v-btn color="primary" variant="flat" :loading="loading" :disabled="!isValid" @click="save">
                    Guardar cambios
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import CompanyModel from '@/core/model/company.model';
import RepresentModel from '@/core/model/represent.model';
import AuthProvider from '@/core/providers/auth/auth';
import Provider from '@/plugins/provider';
import { useAppStore } from '@/stores/app';
import { useSessionStore } from '@/stores/session';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ChefEditDialog',
    props: {
        modelValue: {
            type: Boolean,
            required: true
        },
    },
    emits: ['update:modelValue', 'save'],
    data: () => ({
        loading: false,
        selectedFile: null as File[] | null,
        imagePreview: null as string | null,
        localChefData: RepresentModel.empty(),
        rules: {
            required: (v: string) => !!v || 'Este campo es requerido'
        }
    }),
    computed: {
        dialogReperesent: {
            get(): boolean {
                return this.modelValue;
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value);
            }
        },
        isValid(): boolean {
            return !!this.localChefData.name && !!this.localChefData.description;
        },
        company(): CompanyModel {
            return useSessionStore().company!;
        }
    },
    watch: {
        modelValue(newVal) {
            if (newVal) {
                // Cuando se abre el diálogo, cargar los datos del chef
                this.loadChefData();
            }
        }
    },
    methods: {
        loadChefData() {
            const appStore = useAppStore();
            const represent = appStore.getRepresent;
            
            if (represent) {
                this.localChefData = { ...represent };
                this.imagePreview = represent.profileImageUrl || null;
            } else {
                this.localChefData = RepresentModel.empty();
                this.imagePreview = null;
            }
            
            this.selectedFile = null;
        },

        handleImageUpload(files: File | File[] | null) {
            // Si no hay archivos, salir
            if (!files) {
                console.log('No se seleccionó ningún archivo');
                return;
            }
            
            // Normalizar a array
            const fileArray = Array.isArray(files) ? files : [files];
            
            // Verificar si hay archivos
            if (fileArray.length === 0) {
                console.log('Array de archivos vacío');
                return;
            }
            
            const file = fileArray[0];
            
            // Verificar que file existe
            if (!file) {
                console.log('Archivo inválido');
                return;
            }

            // Validar tamaño (5MB máx)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es muy grande. Máximo 5MB.');
                this.selectedFile = null;
                return;
            }

            console.log('Archivo seleccionado:', file);

            // Limpiar preview anterior si existe
            if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(this.imagePreview);
            }

            // Crear preview
            this.imagePreview = URL.createObjectURL(file);
            this.localChefData.file = file;
            
            console.log('Vista previa creada:', this.imagePreview);
        },

        triggerFileInput() {
            const input = this.$refs.fileInput as any;
            input?.$el?.querySelector('input')?.click();
        },

        async save() {
            if (!this.isValid) return;

            this.loading = true;

            try {
                this.localChefData.companyId = this.company.id!;
                const response = await AuthProvider.upsertRepresent(this.localChefData);
                const appStore = useAppStore();
                appStore.setRepresent(response);
                this.$emit('save', this.localChefData);
                this.close();
            } catch (error) {
                console.error('Error saving chef data:', error);
            } finally {
                this.loading = false;
            }
        },

        close() {
            // Limpiar preview si existe
            if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(this.imagePreview);
            }
            
            this.imagePreview = null;
            this.selectedFile = null;
            this.dialogReperesent = false;
        }
    },
    beforeUnmount() {
        if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(this.imagePreview);
        }
    }
});
</script>

<style scoped>
.border-b {
    border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.v-avatar {
    border: 3px solid rgb(var(--v-theme-surface-variant));
}
</style>