<template>
    <v-container fluid class="pa-6">
        <!-- Alert de sucursales -->
        <v-alert type="info" color="blue-lighten-5" border="start" colored-border class="mb-8">
            <v-row align="center">
                <v-col>
                    <div class="d-flex align-center">
                        <v-icon color="blue-darken-2" size="small" class="mr-2">
                            mdi-cellphone
                        </v-icon>
                        <span class="text-blue-darken-2">
                            Tienes <strong>{{ enabledBranches }}</strong> {{ branchText() }} con acceso móvil
                            habilitado.
                        </span>
                    </div>
                </v-col>
                <v-col cols="auto">
                    <v-btn color="primary" variant="flat" size="small" @click="branchesDialog = true">
                        Configurar desde aquí
                    </v-btn>
                </v-col>
            </v-row>
        </v-alert>

        <!-- Grid principal -->
        <v-row>
            <!-- Sección Chef -->
            <v-col cols="12" md="6">
                <div class="mb-8">
                    <div class="text-caption text-uppercase font-weight-bold grey--text text--darken-1 mb-4">
                        Foto del Chef
                    </div>

                    <div class="d-flex align-start">
                        <v-card width="200" height="200" class="mr-6 overflow-hidden" rounded="lg">
                            <v-img :src="represent.profileImageUrl" cover height="100%">
                                <template v-slot:placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular indeterminate color="grey-lighten-2" />
                                    </div>
                                </template>
                            </v-img>
                        </v-card>
                    </div>
                </div>

                <div>
                    <div class="text-caption text-uppercase font-weight-bold grey--text text--darken-1 mb-4">
                        Información del Chef
                    </div>

                    <h2 class="text-h6 font-weight-bold mb-2">
                        {{ represent.name || 'Sin nombre asignado' }}
                    </h2>
                    <p class="text-body-2 text-grey-darken-1 mb-4">
                        {{ represent.description || 'Sin biografía asignada' }}
                    </p>

                    <v-btn variant="outlined" color="grey-darken-1" size="small" @click="editChefInfo">
                        <v-icon start size="small">mdi-pencil</v-icon>
                        Editar información
                    </v-btn>
                </div>
            </v-col>

            <!-- Sección Imagen de Perfil -->
            <v-col cols="12" md="6">
                <div class="text-caption text-uppercase font-weight-bold grey--text text--darken-1 mb-4">
                    Imagen de perfil
                </div>

                <div class="d-flex align-start">
                    <v-card width="300" height="200" variant="tonal" color="grey-lighten-3" rounded="lg" class="mr-6">
                        <v-img v-if="preview || profileImageUrl" :src="preview || profileImageUrl || ''" cover
                            height="100%">
                            <template v-slot:placeholder>
                                <div class="d-flex align-center justify-center fill-height">
                                    <v-progress-circular indeterminate color="grey-lighten-2" />
                                </div>
                            </template>
                        </v-img>

                        <div v-else class="d-flex align-center justify-center fill-height">
                            <v-icon icon="mdi-image-outline" size="64" color="grey-lighten-1" />
                        </div>
                    </v-card>

                    <div>
                        <v-btn color="primary" variant="flat" size="small" class="mb-2" :loading="loadingProfileImage"
                            @click="triggerFileInput">
                            <v-icon start size="small">mdi-upload</v-icon>
                            Subir foto
                        </v-btn>
                        <div class="text-caption text-grey">
                            Permitido JPG, PNG y GIF.
                        </div>

                        <!-- Input oculto -->
                        <v-file-input v-show="false" v-model="file" ref="fileInput"
                            accept="image/png, image/jpeg, image/gif" @change="handleFileUpload" />
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- Dialog de sucursales -->
        <v-dialog v-model="branchesDialog" max-width="1200" :retain-focus="false">
            <v-card variant="elevated">
                <headquart-adder @close="onClose" @updated="onUpdated" />
            </v-card>
        </v-dialog>

        <chef-edit-dialog v-model="editChefDialog" />
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CompanyModel from '@/core/model/company.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import HeadquartAdder from '@/components/headquart-adder.vue';
import ChefEditDialog from '@/components/phone/main-represent.vue';
import RepresentModel from '@/core/model/represent.model';
import { useAppStore } from '@/stores/app';

export default defineComponent({
    name: 'PhoneConfiguration',
    components: { HeadquartAdder, ChefEditDialog },
    data: () => ({
        enabledBranches: 0,
        branchesDialog: false,
        preview: null as string | null,
        profileImageUrl: null as string | null,
        file: null as File[] | null,
        loadingProfileImage: false,
        editChefDialog: false,
    }),
    computed: {
        company(): CompanyModel | null {
            return useSessionStore().getCompany;
        },
        represent(): RepresentModel {
            return useAppStore().getRepresent!;
        }
    },
    mounted() {
        this.fetchEnabledBranches();
        this.getPhoneProfileImageUrl();
    },
    methods: {
        async getPhoneProfileImageUrl(): Promise<void> {
            if (!this.company?.id) return;
            try {
                this.profileImageUrl = await AuthProvider.getProfilePhoneImageUrl(this.company.id);
            } catch (error) {
                console.error('Error loading profile image:', error);
            }
        },

        async handleFileUpload(event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) return;
            if (!this.company?.id) {
                console.error('Company ID not found');
                return;
            }

            try {
                this.loadingProfileImage = true;
                await AuthProvider.uploadProfilePhoneImage(file, this.company.id);
                this.preview = URL.createObjectURL(file);
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                this.loadingProfileImage = false;
            }
        },

        triggerFileInput() {
            const input = this.$refs.fileInput as any;
            input?.$el?.querySelector('input')?.click();
        },

        async fetchEnabledBranches() {
            if (!this.company?.id) return;
            try {
                const response = await AuthProvider.getActiveHeadquarter(this.company.id);
                this.enabledBranches = response.length;
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        },

        branchText(): string {
            return this.enabledBranches === 1 ? 'sucursal' : 'sucursales';
        },

        editChefInfo() {
            this.editChefDialog = true;
        },

        onClose() {
            this.branchesDialog = false;
        },

        async onUpdated() {
            await this.fetchEnabledBranches();
        }
    },
    beforeUnmount() {
        // Limpiar URL temporal si existe
        if (this.preview) {
            URL.revokeObjectURL(this.preview);
        }
    }
});
</script>

<style scoped>
.v-card {
    transition: all 0.2s ease-in-out;
}

.v-card:hover {
    transform: translateY(-2px);
}
</style>