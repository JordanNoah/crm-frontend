<template>
    <v-row>
        <v-col cols="12">
            Panel de control de usuarios
        </v-col>
        <v-col>
            <v-card variant="elevated">
                <v-container fluid>
                    <v-row>
                        <v-col cols="12">
                            <h2 class="text-h5 font-weight-bold">Filtros</h2>
                        </v-col>
                        <v-col class="d-flex">
                            <v-select label="Role" class="mr-2"></v-select>
                            <v-select label="Estado"></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                        <v-col cols="12" class="d-flex">
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" size="small" variant="outlined" color="primary"
                                        prepend-icon="mdi-download">
                                        Exportar
                                    </v-btn>
                                </template>
                                <v-list density="compact">
                                    <v-list-item v-for="(item, index) in allowedFormatsDownload" :key="index"
                                        :value="index" @click="handleDownload(item.value)">
                                        <v-list-item-title>
                                            <v-icon size="small">{{ item.icon }}</v-icon>
                                            {{ item.text }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                            <v-spacer></v-spacer>
                            <div class="d-flex align-center">
                                <v-text-field label="Buscar" min-width="200" hide-details v-model="search"
                                    prepend-inner-icon="mdi-magnify" clearable @input="debouncedSearch"></v-text-field>
                                <v-btn color="primary" class="ml-2" :to="createUser()">
                                    Crear nuevo usuario
                                </v-btn>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                        <!-- Tabla de usuarios -->
                        <v-col cols="12">
                            <v-card variant="elevated">
                                <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers"
                                    :items="serverItems" :items-length="totalItems" :loading="loading" :search="search"
                                    @update:options="loadItems" item-value="id" show-select v-model="selected">
                                    <!-- Avatar y nombre del usuario -->
                                    <template v-slot:[`item.user`]="{ item }">
                                        <div class="d-flex align-center py-2">
                                            <UserAvatar :account="item" size="32" class="mr-3" />
                                            <div>
                                                <div class="font-weight-medium">
                                                    {{ item.firstName }} {{ item.lastName }}
                                                </div>
                                                <div class="text-caption text-medium-emphasis">
                                                    {{ item.email }}
                                                </div>
                                            </div>
                                        </div>
                                    </template>

                                    <!-- País -->
                                    <template v-slot:[`item.country`]="{ item }">
                                        <div v-if="item.country">
                                            {{ item.country.name || item.country.code }}
                                        </div>
                                        <div v-else class="text-medium-emphasis">
                                            No especificado
                                        </div>
                                    </template>

                                    <!-- Dirección -->
                                    <template v-slot:[`item.address`]="{ item }">
                                        <div v-if="item.address">
                                            {{ item.address }}
                                        </div>
                                        <div v-else class="text-medium-emphasis">
                                            No especificada
                                        </div>
                                    </template>

                                    <!-- Fecha de creación -->
                                    <template v-slot:[`item.createdAt`]="{ item }">
                                        {{ item.createdAt || '' }}
                                    </template>

                                    <!-- Acciones -->
                                    <template v-slot:[`item.actions`]="{ item }">
                                        <div class="d-flex gap-2">
                                            <v-btn icon="mdi-eye" size="small" variant="text"
                                                :to="viewUser(item.uuid)"></v-btn>
                                            <v-btn icon="mdi-pencil" size="small" variant="text"
                                                :to="editUser(item.uuid)"></v-btn>
                                            <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                                                @click="confirmDelete(item)"></v-btn>
                                        </div>
                                    </template>

                                    <!-- Slot para cuando no hay datos -->
                                    <template #no-data>
                                        <div class="text-center pa-4">
                                            <v-icon size="64" color="grey-lighten-1" class="mb-4">
                                                mdi-account-group-outline
                                            </v-icon>
                                            <div class="text-h6 text-medium-emphasis mb-2">
                                                No hay usuarios
                                            </div>
                                            <div class="text-body-2 text-medium-emphasis">
                                                Crea el primer usuario para comenzar
                                            </div>
                                        </div>
                                    </template>
                                </v-data-table-server>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { v4 as uuidv4 } from 'uuid';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import AccountModel from '@/core/model/account.model';
import UserAvatar from '@/components/UserAvatar.vue';
// Implementación nativa de debounce
const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: number;
    return function executedFunction(this: any, ...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export default defineComponent({
    components: {
        UserAvatar,
    },
    data() {
        return {
            // Datos de la tabla
            serverItems: [] as AccountModel[],
            totalItems: 0,
            loading: false,
            itemsPerPage: 10,
            search: '',
            selected: [] as AccountModel[],

            // Headers de la tabla
            headers: [
                { title: 'Usuario', key: 'user', sortable: true },
                { title: 'Teléfono', key: 'phoneNumber', sortable: true },
                { title: 'País', key: 'country', sortable: true },
                { title: 'Dirección', key: 'address', sortable: true },
                { title: 'Fecha de creación', key: 'createdAt', sortable: true },
                { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const },
            ],

            // Opciones de exportación
            allowedFormatsDownload: [
                { text: "CSV", value: "csv", icon: "mdi-file-delimited" },
                { text: "Excel", value: "xlsx", icon: "mdi-file-excel" },
                { text: "PDF", value: "pdf", icon: "mdi-file-pdf" },
            ],
        };
    },
    computed: {
        company() {
            return useSessionStore().getCompany;
        },
    },

    created() {
        // Configurar debounce para búsqueda
        this.debouncedSearch = debounce(this.handleSearch.bind(this), 500);
    },

    methods: {
        async loadItems({ page, itemsPerPage, sortBy }: any) {
            this.loading = true;

            try {
                if (!this.company?.id) {
                    this.serverItems = [];
                    this.totalItems = 0;
                    return;
                }

                // Preparar parámetros de ordenamiento
                let sortParams = {};
                if (sortBy && sortBy.length > 0) {
                    const sort = sortBy[0];
                    sortParams = {
                        sortBy: sort.key === 'user' ? 'firstName' : sort.key,
                        sortOrder: sort.order
                    };
                }

                // Llamada al servidor con paginación real
                const result = await AuthProvider.getUsersPaginated({
                    companyId: this.company.id,
                    page,
                    itemsPerPage,
                    search: this.search,
                    ...sortParams
                });

                this.serverItems = result.items;
                this.totalItems = result.total;

            } catch (error) {
                console.error('Error loading users:', error);
                // Fallback al método anterior si el nuevo endpoint no existe
                try {
                    if (!this.company?.id) return;
                    const result = await AuthProvider.getUsers(this.company.id);

                    // Filtrado local como fallback
                    let filteredItems = result.items;
                    if (this.search) {
                        const searchLower = this.search.toLowerCase();
                        filteredItems = result.items.filter(item =>
                            item.firstName.toLowerCase().includes(searchLower) ||
                            item.lastName.toLowerCase().includes(searchLower) ||
                            item.email.toLowerCase().includes(searchLower)
                        );
                    }

                    // Paginación local
                    const start = (page - 1) * itemsPerPage;
                    const end = start + itemsPerPage;

                    this.serverItems = filteredItems.slice(start, end);
                    this.totalItems = filteredItems.length;
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    this.serverItems = [];
                    this.totalItems = 0;
                }
            } finally {
                this.loading = false;
            }
        },

        handleSearch() {
            // Recargar datos cuando cambie la búsqueda
            this.loadItems({
                page: 1,
                itemsPerPage: this.itemsPerPage,
                sortBy: [],
                search: this.search
            });
        },

        formatDate(date: string | Date) {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },

        handleDownload(format: string) {
            console.log(`Descargando ${this.selected.length} usuarios en formato: ${format}`);
            // Implementar lógica de descarga
        },

        createUser() {
            return { name: "UsersForm", params: { uuid: uuidv4() } };
        },

        viewUser(uuid: string) {
            return { name: "UsersForm", params: { uuid } };
        },

        editUser(uuid: string) {
            return { name: "UsersForm", params: { uuid } };
        },

        confirmDelete(user: AccountModel) {
            if (confirm(`¿Estás seguro de que deseas eliminar a ${user.firstName} ${user.lastName}?`)) {
                this.deleteUser(user);
            }
        },

        async deleteUser(user: AccountModel) {
            try {
                // Implementar eliminación
                console.log('Eliminando usuario:', user);
                // await AuthProvider.deleteUser(user.id);
                // Recargar datos
                this.loadItems({ page: 1, itemsPerPage: this.itemsPerPage });
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        },

        debouncedSearch: null as any, // Se inicializa en created()
    },
});
</script>