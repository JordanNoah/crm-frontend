<template>
    <div>
        <v-row>
            <v-col cols="3" v-for="plugin in plugins" :key="plugin.uuid">
                <ComponentPlugin :plugin="plugin" @click="openPlugin(plugin)" />
            </v-col>

        </v-row>
        <v-dialog v-model="dialog" max-width="600px">
            <v-card variant="elevated">
                <v-img :src="selectedPlugin?.image" height="200px" cover></v-img>
                <v-card-text>
                    <div v-if="selectedPlugin">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <h3>{{ selectedPlugin.name }}</h3> <p>{{ selectedPlugin.version }}</p>
                        </div>
                        <p>{{ selectedPlugin.description }}</p>
                        <p v-html="selectedPlugin.extra"></p> 
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="addPlugin()" v-if="!selectedPlugin?.isAdded" color="success">Añadir</v-btn>
                    <v-btn text @click="removePlugin()" v-if="selectedPlugin?.isAdded" color="error">Eliminar</v-btn>
                    <v-btn text @click="dialog = false">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import ComponentPlugin from '@/components/component-plugin.vue';
import PluginModel from '@/core/model/plugin.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'PluginView',
    components: {
        ComponentPlugin
    },
    data: () => ({
        plugins: [] as PluginModel[],
        dialog: false,
        selectedPlugin: null as PluginModel | null,
        sessionStore: useSessionStore()
    }),
    watch: {
        'sessionStore.company': {
            immediate: true,
            handler(newCompany) {
                if (newCompany) {
                    this.getPlugins();
                }
            }
        }
    },
    methods: {
        async getPlugins() {
            const companyId = this.sessionStore.company!.id;
            const plugins = await AuthProvider.getPlugins(companyId!);
            this.plugins = plugins;
        },
        openPlugin(plugin: PluginModel) {
            this.selectedPlugin = plugin;
            this.dialog = true;
        },
        async addPlugin() {
            if (this.selectedPlugin) {
                const sessionStore = useSessionStore();
                const companyId = sessionStore.company!.id;
                await AuthProvider.addPlugin(this.selectedPlugin.uuid, companyId!);
                // Aquí iría la lógica para añadir el plugin a la aplicación
                this.dialog = false;
                await this.getPlugins();
            }
        },
        async removePlugin() {
            if (this.selectedPlugin) {
                const sessionStore = useSessionStore();
                const companyId = sessionStore.company!.id;
                await AuthProvider.removePlugin(this.selectedPlugin.uuid, companyId!);
                // Aquí iría la lógica para eliminar el plugin de la aplicación
                this.dialog = false;
                await this.getPlugins();
            }
        }
    }
});
</script>