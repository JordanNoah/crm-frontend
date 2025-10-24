<template>
    <v-container>
        <v-row>
            <v-col cols="6">
                Tienes <strong>{{ enabledBranches }}</strong> {{ branchText() }} con acceso móvil habilitado.
                <v-btn variant="flat" @click="branchesDialog = true">Configúralas desde aquí.</v-btn>
                <v-icon icon="mdi-domain" size="small" class="ml-2" />
            </v-col>
            <v-col cols="6">
                <div>
                    <p>Imagen de perfil</p>
                    <div class="d-flex align-center mt-5">
                        <v-card height="300" width="500" variant="tonal" elevation="0"
                            class="mr-5 d-flex align-center justify-center">
                            <v-img :src="preview ?? profileImageUrl ?? undefined" v-if="preview || profileImageUrl" />
                            <div v-else>
                                <v-icon icon="mdi-camera-plus" size="48" class="text-medium-emphasis" />
                            </div>
                        </v-card>
                        <div>
                            <VBtn class="mb-4" @click="triggerFileInput">Subir una foto</VBtn>
                            <p>Permitido JPG, PNG y GIF.</p>

                            <!-- Input oculto -->
                            <v-file-input v-show="false" label="File input" v-model="file" ref="fileInput"
                                @change="handleFileUpload" accept="image/png, image/jpeg, image/gif"></v-file-input>
                        </div>
                    </div>
                </div>
            </v-col>
        </v-row>

        <v-dialog v-model="branchesDialog" max-width="1200px" :retain-focus="false"
            @keydown.esc="branchesDialog = false" @click:outside="branchesDialog = false">
            <v-card variant="elevated">
                <headquart-adder @close="onClose" @updated="onUpdated" />
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CompanyModel from '@/core/model/company.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import HeadquartAdder from '@/components/headquart-adder.vue';

export default defineComponent({
    name: 'PhoneConfiguration',
    components: { HeadquartAdder },
    data: () => ({
        enabledBranches: 0,
        branchesDialog: false,
        preview: null as string | null,
        profileImageUrl: null as string | null,
        file: null,
        loadingProfileImage: false
    }),
    computed: {
        company(): CompanyModel | null {
            return useSessionStore().getCompany;
        }
    },
    mounted() {
        this.fetchEnabledBranches();
        this.getPhoneProfileImageUrl();
    },
    methods: {
        async getPhoneProfileImageUrl(): Promise<void> {
            if (!this.company || !this.company.id) return;
            this.profileImageUrl = await AuthProvider.getProfilePhoneImageUrl(this.company.id);
        },
        async handleFileUpload(event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                this.loadingProfileImage = true;
                await AuthProvider.uploadProfilePhoneImage(file, this.company!.id!);
                this.preview = URL.createObjectURL(file);
            }
        },
        triggerFileInput() {
            (this.$refs.fileInput as any).click();
        },
        async fetchEnabledBranches() {
            if (!this.company?.id) return;
            const response = await AuthProvider.getActiveHeadquarter(this.company.id);
            this.enabledBranches = response.length;
        },
        branchText(): string {
            return this.enabledBranches === 1 ? 'sucursal' : 'sucursales';
        },
        onClose() {
            this.branchesDialog = false;
        },
        async onUpdated() {
            await this.fetchEnabledBranches();
        }
    }
});
</script>
