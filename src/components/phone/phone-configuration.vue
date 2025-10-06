<template>
    <v-container>
        Tienes <strong>{{ enabledBranches }}</strong> {{ branchText() }} con acceso móvil habilitado.
        <RouterLink :to="{ name: 'Headquart' }">Configuralas desde aquí.</RouterLink>
        <v-icon icon="mdi-domain" size="small" class="ml-2"></v-icon>
    </v-container>
</template>

<script lang="ts">
import CompanyModel from '@/core/model/company.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'PhoneConfiguration',
    data: () => ({
        enabledBranches: 0
    }),
    computed: {
        company(): CompanyModel | null {
            return useSessionStore().getCompany
        }
    },
    mounted() {
        this.fetchEnabledBranches();
    },
    methods: {
        async fetchEnabledBranches() {
            const response = await AuthProvider.getActiveHeadquarter(this.company!.id!);
            this.enabledBranches = response.length;
        },
        branchText(): string {
            return this.enabledBranches === 1 ? 'sucursal' : 'sucursales';
        }
    },
});
</script>