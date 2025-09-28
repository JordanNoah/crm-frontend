<template>
    <v-row no-gutters>
        <v-col lg="7" xl="8" class="d-none d-lg-flex bg-background" style="height: 100vh;">

        </v-col>
        <v-col cols="12" lg="5" xl="4" class="d-flex align-center position-relative py-sm-12 px-12 py-6 bg-white"
            style="height: 100vh;">
            <div style="max-width: 400px;" class="mx-auto pt-12 pt-lg-0">
                <h4 class="mb-1">¡Crea una cuenta en <strong>Mi Aplicación</strong>!</h4>
                <p class="mb-5">Vuelve el manejo de tu empresa más fácil y divertida.</p>
                <v-form class="mb-5" ref="form" @submit.prevent="register">
                    <VTextField v-model="identificationNumber" class="mb-4" label="Número de Identificación" required
                        hide-details="auto"
                        :rules="[identificationNumberRules.required, identificationNumberRules.min, identificationNumberRules.numeric]"
                        @keypress="onlyNumbers" maxlength="13" />
                    <VTextField v-model="socialReason" class="mb-4" label="Razón Social" required hide-details="auto"
                        :rules="[socialReasonRules.required]" />
                    <VTextField v-model="commercialName" class="mb-4" label="Nombre Comercial" required
                        hide-details="auto" :rules="[commercialNameRules.required]" />
                    <VTextField v-model="mobilePhone" class="mb-4" label="Teléfono Móvil" required hide-details="auto"
                        :rules="[mobilePhoneRules.required, mobilePhoneRules.min, mobilePhoneRules.numeric]"
                        maxlength="10"  @keypress="onlyNumbers"/>
                    <EmailTextField v-model="email" class="mb-4" hide-details="auto" />
                    <PasswordTextField v-model="password" hide-details="auto" />
                    <VCheckbox v-model="acceptPolicy" class="mb-4" label="Aceptar políticas" hide-details="auto" />
                    <VBtn type="submit" block :disabled="loading">Crear cuenta</VBtn>
                </v-form>
                <p class="text-center">¿Ya tienes una cuenta?
                    <RouterLink :to="{ name: 'Login' }">
                        <span> Inicia sesión </span>
                    </RouterLink>
                </p>
                <div class="divider my-5">
                    <v-divider> or </v-divider>
                </div>

                <div class="d-flex justify-center">
                    <a href="javascript:;" class="mx-3">
                        <v-icon icon="mdi-facebook"></v-icon>
                    </a>

                    <a href="javascript:;" class="mx-3">
                        <v-icon icon="mdi-twitter"></v-icon>
                    </a>

                    <a href="javascript:;" class="mx-3">
                        <v-icon icon="mdi-github"></v-icon>
                    </a>

                    <a href="javascript:;" class="mx-3">
                        <v-icon icon="mdi-google"></v-icon>
                    </a>
                </div>
            </div>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import EmailTextField from '@/components/email-text-field.vue';
import PasswordTextField from '@/components/password-text-field.vue';
import CompanyModel from '@/core/model/company.model';
import SignUpModel from '@/core/model/signUp.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { register } from 'register-service-worker';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Register',
    components: {
        PasswordTextField,
        EmailTextField,
    },
    data: () => ({
        mobilePhone: undefined as string | undefined,
        email: undefined as string | undefined,
        password: undefined as string | undefined,
        identificationNumber: undefined as string | undefined,
        socialReason: undefined as string | undefined,
        commercialName: undefined as string | undefined,
        acceptPolicy: false,
        loading: false,
        mobilePhoneRules: {
            required: (v: string) => !!v || 'El teléfono móvil es obligatorio',
            min: (v: string) => (v && v.length >= 10) || 'El teléfono móvil debe tener al menos 10 caracteres',
            numeric: (v: string) => (/^[0-9]+$/.test(v)) || 'El teléfono móvil debe contener solo números',
        },
        identificationNumberRules: {
            required: (v: string) => !!v || 'El número de identificación es obligatorio',
            min: (v: string) => (v && v.length >= 13) || 'El número de identificación debe tener al menos 13 caracteres',
            numeric: (v: string) => (/^[0-9]+$/.test(v)) || 'El número de identificación debe contener solo números',
        },
        socialReasonRules: {
            required: (v: string) => !!v || 'La razón social es obligatoria',
        },
        commercialNameRules: {
            required: (v: string) => !!v || 'El nombre comercial es obligatorio'
        },
    }),
    methods: {
        async register() {
            // 1) Validar formulario Vuetify
            const result = await (this.$refs.form as any)?.validate?.();
            const valid = typeof result === 'object' ? !!result.valid : !!result;

            // 2) Validar aceptación de políticas
            if (!this.acceptPolicy) {
                return;
            }

            if (!valid) return;


            const signUp = new SignUpModel(
                new CompanyModel(
                    this.identificationNumber!,
                    this.socialReason!,
                    this.commercialName!,
                    this.mobilePhone!
                ),
                this.email!,
                this.password!
            )
            
            const response = await AuthProvider.SignUp(signUp);
            AuthProvider.setToken(response.token);
            useSessionStore().setAccessToken(response.token);
            this.$router.push({ name: 'App' });
        },
        onlyNumbers(e: KeyboardEvent) {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault()
            }
        },
    }
});
</script>