<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="elevated">
                <v-container fluid>
                    <v-row>
                        <v-col class="d-flex align-center">
                            <div>
                                <h3 class="text-h5 font-weight-bold">
                                    {{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}
                                </h3>
                                <p>
                                    {{ isEditing ? 'Actualiza la información del cliente' : 'Completa los datos del nuevo cliente' }}
                                </p>
                            </div>
                            <v-spacer></v-spacer>
                            <div>
                                <v-btn class="mr-2" @click="discardChanges">
                                    Descartar cambios
                                </v-btn>
                                <v-btn @click="saveChanges" color="primary" :loading="saving">
                                    Guardar cambios
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-col>
        <v-col cols="12">
            <v-form ref="form" v-model="formValid" class="mx-auto">
                <v-card variant="elevated" class="pa-8">
                    <v-row>
                        <v-col cols="12" class="mb-6">
                            <div class="d-flex align-center">
                                <div class="mr-5">
                                    <UserAvatar :account="null"
                                        :image-url="profileImagePreview || customerData.profileImageUrl" size="100"
                                        color="primary" />
                                </div>
                                <div>
                                    <VBtn class="mb-4" @click="triggerFileInput">Subir una foto</VBtn>
                                    <p class="text-caption">Permitido JPG, PNG y GIF. Máximo 5MB.</p>

                                    <!-- Input oculto -->
                                    <v-file-input v-show="false" label="File input" v-model="profileImageFile"
                                        ref="fileInput" @change="handleFileUpload"
                                        accept="image/png, image/jpeg, image/gif" />
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="Nombre del Cliente *" :rules="[rules.required]"
                                v-model="customerData.name"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="Correo Electrónico *" :rules="[rules.required, rules.email]"
                                v-model="customerData.email"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="Teléfono *" :rules="[rules.required]"
                                v-model="customerData.phone"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="Número de Identificación *" v-model="customerData.identificationNumber"
                                :rules="[rules.required]"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="Dirección *" :rules="[rules.required]"
                                v-model="customerData.address"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="País *" :rules="[rules.required]"
                                v-model="customerData.country"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card>
            </v-form>
        </v-col>

        <!-- Snackbar para mensajes -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
            {{ snackbarMessage }}
            <template v-slot:actions>
                <v-btn color="white" variant="text" @click="snackbar = false">
                    Cerrar
                </v-btn>
            </template>
        </v-snackbar>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { useCustomerStore } from '@/stores/customer';
import { useSessionStore } from '@/stores/session';
import CustomerModel from '@/core/model/customer.model';

export default defineComponent({
    components: {
        UserAvatar
    },
    data: () => ({
        formValid: false,
        customerData: {
            id: 0,
            uuid: '',
            name: '',
            email: '',
            phone: '',
            address: '',
            country: '',
            profileImageUrl: '',
            identificationNumber: '',
            companyId: 0,
            isDeleted: false,
        },
        rules: {
            required: (value: string) => !!value || 'Este campo es obligatorio.',
            email: (value: string) => {
                const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return pattern.test(value) || 'Correo electrónico inválido.';
            },
        },
        // Campos para imagen de perfil
        profileImageFile: null as File | null,
        profileImagePreview: null as string | null,
        saving: false,
        snackbar: false,
        snackbarMessage: '',
        snackbarColor: 'success',
    }),
    computed: {
        customerStore() {
            return useCustomerStore();
        },
        sessionStore() {
            return useSessionStore();
        },
        companyId() {
            return this.sessionStore.getCompany?.id || 0;
        },
        isEditing() {
            return !!this.$route.params.uuid;
        }
    },
    async mounted() {
        const uuid = this.$route.params.uuid as string;
        if (uuid) {
            await this.loadCustomer(uuid);
        } else {
            this.customerData.companyId = this.companyId;
        }
    },
    methods: {
        async loadCustomer(uuid: string) {
            try {
                await this.customerStore.loadCustomerByUuid(uuid);
                const customer = this.customerStore.getCurrentCustomer;
                if (customer) {
                    this.customerData = {
                        id: customer.id,
                        uuid: customer.uuid,
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        country: customer.country,
                        identificationNumber: customer.identificationNumber,
                        profileImageUrl: customer.profileImageUrl || '',
                        companyId: customer.companyId,
                        isDeleted: customer.isDeleted,
                    };
                }
            } catch (error) {
                console.error('Error loading customer:', error);
                this.showSnackbar('Error al cargar el cliente', 'error');
            }
        },
        async saveChanges() {
            const form = this.$refs.form as any;
            const { valid } = await form.validate();
            
            if (!valid) {
                this.showSnackbar('Por favor completa todos los campos requeridos', 'warning');
                return;
            }

            this.saving = true;
            try {
                const customer = new CustomerModel(
                    this.customerData.id,
                    this.customerData.uuid,
                    this.customerData.name,
                    this.customerData.email,
                    this.customerData.phone,
                    this.customerData.address,
                    this.customerData.identificationNumber,
                    this.customerData.country,
                    this.customerData.companyId,
                    this.customerData.profileImageUrl,
                    this.customerData.isDeleted,
                    undefined,
                    undefined,
                    null,
                    this.profileImageFile || undefined
                );

                if (this.isEditing) {
                    await this.customerStore.updateCustomer(customer);
                    this.showSnackbar('Cliente actualizado exitosamente', 'success');
                } else {
                    await this.customerStore.createCustomer(customer);
                    this.showSnackbar('Cliente creado exitosamente', 'success');
                }

                setTimeout(() => {
                    this.$router.push({ name: 'CustomersDashboard' });
                }, 1000);
            } catch (error: any) {
                console.error("Error saving customer:", error);
                const errorMessage = error.response?.data?.error || error.message || 'Error al guardar la información del cliente.';
                this.showSnackbar(errorMessage, 'error');
            } finally {
                this.saving = false;
            }
        },
        discardChanges() {
            this.$router.push({ name: 'CustomersDashboard' });
        },
        triggerFileInput() {
            const fileInput = this.$refs.fileInput as any;
            fileInput.$el.querySelector('input[type="file"]').click();
        },
        handleFileUpload(event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                // Validar tamaño (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    this.showSnackbar('El archivo es demasiado grande. Máximo 5MB.', 'warning');
                    this.profileImageFile = null;
                    return;
                }
                
                this.profileImageFile = file;
                this.profileImagePreview = URL.createObjectURL(file);
            }
        },
        showSnackbar(message: string, color = 'success') {
            this.snackbarMessage = message;
            this.snackbarColor = color;
            this.snackbar = true;
        }
    },
    beforeUnmount() {
        // Limpiar la URL del preview cuando el componente se desmonte
        if (this.profileImagePreview) {
            URL.revokeObjectURL(this.profileImagePreview);
        }
        this.customerStore.clearCurrentCustomer();
    }
});
</script>
