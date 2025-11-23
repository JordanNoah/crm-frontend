<template>
    <v-container>
        <v-card variant="elevated">
            <v-container>
                <v-row align="center" class="mb-4">
                    <v-col cols="12">
                        <h2 class="text-h5 font-weight-bold">Roles</h2>
                    </v-col>
                    <v-divider></v-divider>
                    <v-col cols="12" class="d-flex align-center">
                        <v-menu>
                            <template v-slot:activator="{ props }">
                                <v-btn 
                                    v-bind="props" 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary"
                                    prepend-icon="mdi-download"
                                >
                                    Exportar
                                </v-btn>
                            </template>
                            <v-list density="compact">
                                <v-list-item 
                                    v-for="(item, index) in allowedFormatsDownload" 
                                    :key="index" 
                                    :value="index"
                                    @click="handleDownload(item.value)"
                                >
                                    <v-list-item-title>
                                        <v-icon size="small">{{ item.icon }}</v-icon>
                                        {{ item.text }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-spacer></v-spacer>
                        <div class="d-flex align-center">
                            <v-text-field label="Buscar" hide-details="auto" min-width="200" class="mr-2"></v-text-field>
                            <v-btn @click="goTo()">
                                Crear nuevo rol
                            </v-btn>
                        </div>
                    </v-col>
                    <v-divider class="mb-4"></v-divider>
                    <v-col>
                        <v-data-table-server :headers="header" :items="items" :loading="false"
                            :items-length="totalItems">
                            <template v-slot:[`item.users`]="{ item }">
                                <LateralUsers :accounts="item.accounts" v-if="item.accounts.length > 0" />
                                <span v-else>
                                    Sin usuarios
                                </span>
                            </template>
                            <template v-slot:[`item.actions`]="{ item }">
                                <v-btn icon @click="editRole(item)" color="transparent">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table-server>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import RoleModel from "@/core/model/role.model";
import AuthProvider from "@/core/providers/auth/auth";
import { useSessionStore } from "@/stores/session";
import { defineComponent } from "vue";
import LateralUsers from "@/components/lateral-users.vue";

export default defineComponent({
    name: "RolesPermissions",
    data: () => ({
        header: [
            { title: 'Nombre', value: 'name' },
            { title: 'Descripción', value: 'description' },
            { title: 'Usuarios', value: 'users' },
            { title: 'Acciones', value: 'actions', sortable: false },
        ],
        items: [] as RoleModel[],
        totalItems: 0,
        allowedFormatsDownload: [
            { text: 'CSV', value: 'csv', icon: 'mdi-file-delimited' },
            { text: 'XLSX', value: 'xlsx', icon: 'mdi-file-excel' },
            { text: 'PDF', value: 'pdf', icon: 'mdi-file-pdf-box' },
        ],
    }),
    computed: {
        company: function () {
            return useSessionStore().getCompany;
        }
    },
    components: {
        LateralUsers
    },
    async mounted() {
        const response = await AuthProvider.getRolesAndPermissions(this.company!.id!);
        this.items = response.items;
        this.totalItems = response.total;
    },
    methods: {
        editRole(role: RoleModel) {
            this.$router.push({ name: 'RolesPermissionsForm', params: { uuid: role.uuid } });
        },
        handleDownload(format: string) {
            console.log("Download in format:", format);
            // Aquí implementarías la lógica de descarga
        },
        goTo() {
            this.$router.push({ name: 'RolesPermissionsForm', params: { uuid: '' } });
        }
    }
})
</script>