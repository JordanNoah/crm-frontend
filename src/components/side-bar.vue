<template>
    <v-navigation-drawer  :rail="expandOnHover" :expand-on-hover="expandOnHover" permanent :width="260">
        <div class="d-flex align-center px-2 py-2">
            <v-avatar size="40">
                <v-img :src="logoUrl" alt="Logo" />
            </v-avatar>
            <h4 class="ml-4 mb-0">Aplicación</h4>
            <v-spacer></v-spacer>
            <div @click="changeRail()" class="cursor-pointer">
                <VIcon v-if="expandOnHover">
                    mdi-chevron-right
                </VIcon>
                <VIcon v-else>
                    mdi-chevron-left
                </VIcon>
            </div>
        </div>
        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-home-outline" title="Dashboard" value="dashboard"></v-list-item>
            <v-list-item prepend-icon="mdi-account-outline" title="Usuarios" value="users" :to="{ name: 'Users' }"></v-list-item>
            <v-list-item prepend-icon="mdi-domain" title="Empresas" value="companies" :to="{ name: 'HeadquarterDashboard' }"></v-list-item>
            <v-list-item prepend-icon="mdi-cart-outline" title="Productos" value="products" :to="{ name: 'ProductDashboard' }"></v-list-item>
            <v-list-item prepend-icon="mdi-puzzle-outline" title="Plugins" value="plugins" :to="{ name: 'Plugins' }"></v-list-item>
        </v-list>
        <v-divider />
        <v-list density="compact" nav>
            <v-list-item v-for="plugin in activatedPlugins" :key="plugin.id" :prepend-icon="plugin.icon" :title="plugin.name" :value="plugin.id" :to="{ name: plugin.toName}"></v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAppStore } from '@/stores/app'
import AuthProvider from '@/core/providers/auth/auth'
import { useSessionStore } from '@/stores/session'
import PluginModel from '@/core/model/plugin.model'

export default defineComponent({
    name: 'SideBar',
    data: () => ({
        sessionStorage: useSessionStore(),
        activatedPlugins: [] as PluginModel[],
    }),
    computed: {
        expandOnHover(): boolean {
            return useAppStore().isExpandOnHover
        },
        logoUrl(): string {
            return new URL('@/assets/c.svg', import.meta.url).href
        },
    },
    watch: {
        'sessionStorage.company': {
            immediate: true,
            handler(newCompany) {
                if (newCompany) {
                    this.getActivatedPlugins();
                }
            }
        }
    },
    methods: {
        changeRail() {
            useAppStore().toggleExpandOnHover()
        },
        async getActivatedPlugins() {
            const activated = await AuthProvider.getActivatedPlugins(this.sessionStorage.company!.id!);
            this.activatedPlugins = activated;
            useSessionStore().setInstalledPlugins(activated);
        }
    },
})
</script>
