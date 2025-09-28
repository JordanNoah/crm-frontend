<template>
    <v-row no-gutters>
        <v-col lg="7" xl="8" class="d-none d-lg-flex bg-background" style="height: 100vh;">

        </v-col>
        <v-col cols="12" lg="5" xl="4" class="d-flex align-center position-relative py-sm-12 px-12 py-6 bg-white"
            style="height: 100vh;">
            <div style="max-width: 400px;" class="mx-auto pt-12 pt-lg-0">
                <h4 class="mb-1">¡Bienvenido a <strong>Mi Aplicación</strong>!</h4>
                <p class="mb-5">Inicia sesión en tu cuenta para acceder a todas las funcionalidades.</p>
                <v-form class="mb-5" ref="form" @submit.prevent="login">
                    <EmailTextField v-model="email" class="mb-4" hide-details="auto"/>
                    <PasswordTextField v-model="password" class="mb-4" hide-details="auto"/>
                    <div class="d-flex justify-space-between align-center mb-4">
                        <VCheckbox v-model="rememberMe" label="Recordar sesión" hide-details />
                        <RouterLink :to="{ name: 'ForgotPassword' }">¿Olvidaste tu contraseña?</RouterLink>
                    </div>
                    <VBtn type="submit" block :disabled="loading">Iniciar Sesión</VBtn>
                </v-form>

                <p class="text-center">
                    <span>¿Nuevo en nuestra plataforma?</span>
                    <RouterLink :to="{ name: 'Register' }">
                        <span> Crear una cuenta </span>
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
import { defineComponent } from 'vue';
import PasswordTextField from "@/components/password-text-field.vue";
import EmailTextField from '@/components/email-text-field.vue';
import SessionEntity from '@/core/entities/session.entity';
import { useSessionStore } from '@/stores/session';
import AuthProvider from '@/core/providers/auth/auth';

export default defineComponent({
    name: 'LoginView',
    components: {
        PasswordTextField: PasswordTextField,
        EmailTextField: EmailTextField,
    },
    data: () => ({
        email: undefined as string | undefined,
        password: undefined as string | undefined,
        rememberMe: false,
        loading: false,
    }),
    methods: {
        async login() {
            // 1) Validar formulario Vuetify
            const result = await (this.$refs.form as any)?.validate?.();
            const valid = typeof result === 'object' ? !!result.valid : !!result;

            if (!valid) return;

            const session = new SessionEntity(
                this.email!,
                this.password!,
                this.rememberMe,
            );
            const response = await AuthProvider.login(session);
            useSessionStore().setAccessToken(response.token);
            useSessionStore().setCompany(response.company);
            useSessionStore().setAccount(response.account);
            this.$router.push({ name: 'App' });            
        },
    },

});
</script>