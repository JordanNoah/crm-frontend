<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="elevated">
                <v-container fluid>
                    <v-row>
                        <v-col class="d-flex align-center">
                            <div>
                                <h3 class="text-h5 font-weight-bold">Formulario de Usuario</h3>
                                <p>
                                    Completa los datos del usuario
                                </p>
                            </div>
                            <v-spacer></v-spacer>
                            <div>
                                <v-btn class="mr-2" @click="$router.push('/app/roles')">
                                    Descartar cambios
                                </v-btn>
                                <v-btn @click="saveChanges" color="primary">
                                    Guardar cambios
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-col>
        <v-col cols="12">
            <v-form ref="form" class="mx-auto">
                <v-card variant="elevated" class="pa-8">
                    <!-- Form Fields -->
                    <v-row>
                        <!-- Profile Picture -->
                        <v-col cols="12" class="mb-6">
                            <div class="d-flex align-center">
                                <div class="mr-5">
                                    <UserAvatar :account="null"
                                        :image-url="profileImagePreview || editingData.profileImageUrl" size="100"
                                        color="primary" />
                                </div>
                                <div>
                                    <VBtn class="mb-4" @click="triggerFileInput">Subir una foto</VBtn>
                                    <p>Permitido JPG, PNG y GIF.</p>

                                    <!-- Input oculto -->
                                    <v-file-input v-show="false" label="File input" v-model="profileImageFile"
                                        ref="fileInput" @change="handleFileUpload"
                                        accept="image/png, image/jpeg, image/gif" />
                                </div>
                            </div>
                        </v-col>

                        <!-- First Name -->
                        <v-col cols="12" md="6">
                            <v-text-field label="First Name" v-model="editingData.firstName" variant="outlined"
                                :rules="[rules.required]" hide-details="auto"></v-text-field>
                        </v-col>

                        <!-- Last Name -->
                        <v-col cols="12" md="6">
                            <v-text-field label="Last Name" v-model="editingData.lastName" variant="outlined"
                                :rules="[rules.required]" hide-details="auto"></v-text-field>
                        </v-col>



                        <!-- Email -->
                        <v-col cols="12" md="6">
                            <v-text-field label="Email" v-model="editingData.email" variant="outlined" type="email"
                                :rules="[rules.required, rules.email]" hide-details="auto"></v-text-field>
                        </v-col>

                        <!-- Status -->
                        <v-col cols="12" md="6">
                            <v-select label="Status" v-model="uiFields.status" :items="statusOptions" variant="outlined"
                                hide-details="auto"></v-select>
                        </v-col>

                        <!-- Phone Number -->
                        <v-col cols="12" md="6">
                            <v-text-field label="Phone Number" v-model="editingData.phoneNumber" variant="outlined"
                                type="tel" prepend-inner-icon="mdi-phone" hide-details="auto">
                            </v-text-field>
                        </v-col>

                        <!-- Languages -->
                        <v-col cols="12" md="6">
                            <v-select label="Languages" v-model="editingData.languages" item-title="name"
                                item-value="id" return-object :items="languageOptions" variant="outlined" multiple
                                closable-chips chips hide-details="auto"></v-select>
                        </v-col>

                        <!-- Country -->
                        <v-col cols="12" md="6">
                            <v-select label="Country" v-model="selectedCountryId" :items="countryOptions"
                                item-title="name" item-value="id" variant="outlined" hide-details="auto"></v-select>
                        </v-col>

                        <!-- Address -->
                        <v-col cols="12" md="6">
                            <v-text-field label="Address" v-model="editingData.address" variant="outlined"
                                hide-details="auto"></v-text-field>
                        </v-col>

                        <!-- Roles -->
                        <v-col cols="12" md="6">
                            <v-autocomplete label="Roles" v-model="editingData.roles" :items="roleOptions"
                                item-title="name" item-value="id" multiple closable-chips chips variant="outlined"
                                hide-details="auto"></v-autocomplete>
                        </v-col>

                        <!-- Password Section -->
                        <v-col cols="12">
                            <v-divider class="mb-4"></v-divider>
                            <h4 class="mb-4">Contraseña</h4>

                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-select label="Configuración de contraseña" v-model="uiFields.generatePassword"
                                        :items="passwordOptions" item-title="label" item-value="value"
                                        variant="outlined" hide-details="auto"></v-select>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field label="Contraseña" v-model="editingData.password" variant="outlined"
                                        :type="uiFields.showPassword ? 'text' : 'password'"
                                        :readonly="uiFields.generatePassword"
                                        :placeholder="uiFields.generatePassword ? 'Se generará automáticamente' : 'Ingrese la contraseña'"
                                        :rules="!uiFields.generatePassword ? [rules.required] : []"
                                        :append-inner-icon="uiFields.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append-inner="togglePasswordVisibility"
                                        hide-details="auto"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card>
            </v-form>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AccountModel from "@/core/model/account.model";
import CountryModel from "@/core/model/country.model";
import { LanguageModel } from "@/core/model/languages.model";
import RoleModel from "@/core/model/role.model";

import AuthProvider from "@/core/providers/auth/auth";
import { useSessionStore } from "@/stores/session";
import UserAvatar from '@/components/UserAvatar.vue';

export default defineComponent({
    name: "UserForm",
    components: {
        UserAvatar,
    },
    data: () => ({
        editingData: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            address: '',
            state: '',
            zipCode: '',
            countryId: null as number | null,
            timezone: 1,
            companyId: null as number | null,
            languages: [] as LanguageModel[],
            password: '',
            roles: [] as RoleModel[],
        } as Partial<AccountModel>,

        // Campos adicionales para UI
        uiFields: {
            status: 'Active',
            generatePassword: true, // Por defecto generar contraseña
            showPassword: false, // Por defecto ocultar contraseña
        },

        // Campos temporales para selección
        selectedCountryId: null as number | null,
        selectedRoleIds: [] as number[],

        // Campos para imagen de perfil
        profileImageFile: null as File | null,
        profileImagePreview: null as string | null,

        // Opciones para configuración de contraseña
        passwordOptions: [
            { label: 'Generar contraseña automáticamente', value: true },
            { label: 'Establecer contraseña manualmente', value: false },
        ],

        rules: {
            required: (value: any) => !!value || 'This field is required.',
            email: (value: string) => {
                const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return pattern.test(value) || 'Invalid e-mail format.';
            },
        },

        statusOptions: [
            { title: 'Active', value: 'Active' },
            { title: 'Inactive', value: 'Inactive' },
            { title: 'Pending', value: 'Pending' },
            { title: 'Suspended', value: 'Suspended' },
        ],

        languageOptions: [] as LanguageModel[],
        countryOptions: [] as CountryModel[],
        roleOptions: [] as RoleModel[],
    }),

    computed: {
        uuid(): string {
            return this.$route.params.uuid as string;
        },
        company() {
            return useSessionStore().getCompany;
        },
        isEditMode(): boolean {
            return !!this.uuid;
        }
    },

    watch: {
        'uiFields.generatePassword'(newValue: boolean) {
            console.log(newValue);

            // Si se activa la generación automática, limpiar la contraseña manual
            if (newValue) {
                this.editingData.password = this.generateRandomPassword();
            } else {
                this.editingData.password = this.editingData.password || '';
            }
        }
    },

    methods: {
        async fetchAvailableLanguages() {
            const languages = await AuthProvider.getLanguages()
            this.languageOptions = languages
        },
        async fetchUser() {
            if (this.uuid) {
                const user = await AuthProvider.getUserByUuid(this.uuid);
                if (user) {
                    console.log(user);
                    
                    this.editingData = {
                        id: user.id,
                        uuid: user.uuid,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phoneNumber: user.phoneNumber || '',
                        address: user.address || '',
                        state: user.state || '',
                        zipCode: user.zipCode || '',
                        timezone: user.timezone || 1,
                        companyId: user.companyId,
                        languages: user.languages || [],
                        password: user.password || '',
                        roles: user.roles || [],
                    };

                    // Campos de selección separados
                    this.selectedCountryId = user.country?.id || null;

                    // Cargar imagen de perfil si existe
                    if (user.profileImageUrl) {
                        this.profileImagePreview = user.profileImageUrl;
                    }

                    this.uiFields = {
                        status: 'Active', // El status vendría del user si existe en el modelo
                        generatePassword: false, // Por defecto generar contraseña
                        showPassword: false,
                    };
                }else{
                    this.editingData.password = this.generateRandomPassword();
                    this.editingData.uuid = this.uuid;
                }
            }
        },

        async loadCountries() {
            try {
                const countries = await AuthProvider.getCountries();
                this.countryOptions = countries;

                // Si no hay países, agregar algunos por defecto
                if (countries.length === 0) {
                    this.countryOptions = [
                        { id: 1, name: 'United States', code: 'US' } as CountryModel,
                        { id: 2, name: 'Canada', code: 'CA' } as CountryModel,
                        { id: 3, name: 'India', code: 'IN' } as CountryModel,
                        { id: 4, name: 'United Kingdom', code: 'UK' } as CountryModel,
                    ];
                }
            } catch (error) {
                console.error('Error loading countries:', error);
                // Países por defecto en caso de error
                this.countryOptions = [
                    { id: 1, name: 'United States', code: 'US' } as CountryModel,
                    { id: 2, name: 'Canada', code: 'CA' } as CountryModel,
                    { id: 3, name: 'India', code: 'IN' } as CountryModel,
                    { id: 4, name: 'United Kingdom', code: 'UK' } as CountryModel,
                ];
            }
        },

        async loadRoles() {
            try {
                if (this.company?.id) {
                    const rolesResponse = await AuthProvider.getRolesAndPermissions(this.company.id);
                    this.roleOptions = rolesResponse.items;
                }
            } catch (error) {
                console.error('Error loading roles:', error);
                // Roles por defecto en caso de error
                this.roleOptions = [
                    { id: 1, name: 'Super Admin', code: 'SUPER_ADMIN' } as RoleModel,
                    { id: 2, name: 'Admin', code: 'ADMIN' } as RoleModel,
                    { id: 3, name: 'Manager', code: 'MANAGER' } as RoleModel,
                    { id: 4, name: 'Employee', code: 'EMPLOYEE' } as RoleModel,
                ];
            }
        },

        triggerFileInput() {
            (this.$refs.fileInput as HTMLInputElement).click();
        },

        handleFileUpload(event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                this.profileImageFile = file;
                this.profileImagePreview = URL.createObjectURL(file);
            }
        },

        togglePasswordVisibility() {
            this.uiFields.showPassword = !this.uiFields.showPassword;
        },

        removeImage() {
            this.profileImageFile = null;
            this.profileImagePreview = null;
            this.editingData.profileImageUrl = '';
        },

        generateRandomPassword(length = 12): string {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
            let password = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset[randomIndex];
            }
            return password;
        },

        async saveChanges() {
            const isValid = (this.$refs.form as any).validate();
            if (!isValid) {
                alert('Por favor completa todos los campos requeridos.');
                return;
            }

            try {
                // Generar contraseña automáticamente si está activada esa opción
                if (this.uiFields.generatePassword && !this.isEditMode) {
                    this.editingData.password = this.generateRandomPassword();
                    console.log('Contraseña generada:', this.editingData.password);
                }

                // Validar que haya contraseña para nuevos usuarios
                if (!this.isEditMode && !this.editingData.password) {
                    alert('La contraseña es requerida para nuevos usuarios.');
                    return;
                }

                // Preparar datos para enviar
                const userData: Partial<AccountModel> = {
                    ...this.editingData,
                    companyId: this.company?.id,
                    timezone: this.editingData.timezone || 1,
                };

                // Asignar país si se seleccionó (como ID)
                if (this.selectedCountryId) {
                    userData.country = this.selectedCountryId as any;
                }

                // Asignar languages correctamente
                if (this.editingData.languages && this.editingData.languages.length > 0) {
                    userData.languages = this.editingData.languages as any;
                }

                // Asignar archivo de imagen si hay uno nuevo
                if (this.profileImageFile) {
                    (userData as any).file = this.profileImageFile;
                }

                // Si estamos en modo edición, agregar uuid
                if (this.isEditMode) {
                    userData.uuid = this.uuid;
                }

                console.log("Guardando usuario:", userData);

                const savedUser = await AuthProvider.saveUser(userData);
                console.log("Usuario guardado exitosamente:", savedUser);

                // Mostrar mensaje de éxito y redireccionar
                this.$router.push({ name: 'UsersDashboard' });
            } catch (error: any) {
                console.error("Error saving user:", error);
                const errorMessage = error.response?.data?.message || 'Error al guardar la información del usuario. Por favor intenta de nuevo.';
                alert(errorMessage);
            }
        },

        cancel() {
            this.$router.push('/app/users');
        }
    },

    async mounted() {
        await this.fetchAvailableLanguages();
        await this.loadCountries();
        await this.loadRoles();
        await this.fetchUser();
    }
});
</script>