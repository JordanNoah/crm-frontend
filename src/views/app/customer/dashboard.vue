<template>
    <v-row>
        <v-col cols="12">
            <h3 class="text-h5 font-weight-bold mb-4">Gestión de Clientes</h3>
        </v-col>
        <v-col>
            <v-card variant="elevated">
                <v-container fluid>
                    <v-row>
                        <v-col cols="12" class="d-flex align-center">
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
                                <v-select v-model="searchType" :items="searchTypeOptions" item-title="text"
                                    item-value="value" density="compact" style="max-width: 150px;" class="mr-2"
                                    hide-details></v-select>
                                <v-text-field label="Buscar" min-width="200" hide-details v-model="search"
                                    prepend-inner-icon="mdi-magnify" clearable @click:clear="handleClearSearch"
                                    @keyup.enter="handleSearch"></v-text-field>
                                <v-btn icon="mdi-magnify" variant="text" @click="handleSearch"></v-btn>
                                <v-btn color="primary" class="ml-2" @click="createCustomer">
                                    Crear nuevo cliente
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-col>

        <!-- Tabla de clientes -->
        <v-col cols="12">
            <v-card variant="elevated">
                <v-card-text>
                    <v-data-table-server 
                        :headers="headers" 
                        :items="customers" 
                        :loading="loading"
                        :items-length="pagination.total" 
                        v-model:page="currentPage"
                        :items-per-page="pagination.limit" 
                        @update:options="loadTableData">
                        <template v-slot:[`item.profileImageUrl`]="{ item }">
                            <v-avatar size="40" class="my-2">
                                <v-img v-if="item.profileImageUrl" :src="item.profileImageUrl" />
                                <v-icon v-else>mdi-account-circle</v-icon>
                            </v-avatar>
                        </template>
                        <template v-slot:[`item.actions`]="{ item }">
                            <v-btn icon="mdi-pencil" size="small" variant="text" color="primary"
                                @click="editCustomer(item)"></v-btn>
                            <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                                @click="confirmDelete(item)"></v-btn>
                        </template>
                        <template v-slot:loading>
                            <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
                        </template>
                        <template v-slot:no-data>
                            <div class="text-center py-5">
                                <v-icon size="64" color="grey">mdi-account-off</v-icon>
                                <p class="text-h6 mt-3">No hay clientes registrados</p>
                                <v-btn color="primary" @click="createCustomer" class="mt-2">
                                    Crear primer cliente
                                </v-btn>
                            </div>
                        </template>
                    </v-data-table-server>
                </v-card-text>
            </v-card>
        </v-col>

        <!-- Diálogo de confirmación de eliminación -->
        <v-dialog v-model="deleteDialog" max-width="500">
            <v-card>
                <v-card-title class="text-h5">Confirmar eliminación</v-card-title>
                <v-card-text>
                    ¿Estás seguro de que deseas eliminar al cliente <strong>{{ customerToDelete?.name }}</strong>?
                    Esta acción no se puede deshacer.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="text" @click="deleteDialog = false">
                        Cancelar
                    </v-btn>
                    <v-btn color="error" variant="text" @click="deleteCustomer" :loading="deleteLoading">
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

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
import { useCustomerStore } from '@/stores/customer';
import { useSessionStore } from '@/stores/session';
import CustomerModel from '@/core/model/customer.model';

export default defineComponent({
    data() {
        return {
            search: '',
            searchType: 'global' as 'global' | 'name' | 'email' | 'phone' | 'identification',
            searchTypeOptions: [
                { text: 'Todos', value: 'global' },
                { text: 'Nombre', value: 'name' },
                { text: 'Email', value: 'email' },
                { text: 'Teléfono', value: 'phone' },
                { text: 'Identificación', value: 'identification' },
            ],
            allowedFormatsDownload: [
                { text: 'PDF', value: 'pdf', icon: 'mdi-file-pdf-outline' },
                { text: 'Excel', value: 'excel', icon: 'mdi-file-excel-outline' },
                { text: 'CSV', value: 'csv', icon: 'mdi-file-delimited-outline' },
            ],
            headers: [
                { title: '', key: 'profileImageUrl', sortable: false },
                { title: 'Nombre', key: 'name' },
                { title: 'Email', key: 'email' },
                { title: 'Teléfono', key: 'phone' },
                { title: 'Identificación', key: 'identificationNumber' },
                { title: 'País', key: 'country' },
                { title: 'Fecha de Registro', key: 'createdAt' },
                { title: 'Acciones', key: 'actions', sortable: false },
            ],
            currentPage: 1,
            deleteDialog: false,
            customerToDelete: null as CustomerModel | null,
            deleteLoading: false,
            snackbar: false,
            snackbarMessage: '',
            snackbarColor: 'success',
        };
    },
    computed: {
        customerStore() {
            return useCustomerStore();
        },
        sessionStore() {
            return useSessionStore();
        },
        customers() {
            return this.customerStore.getCustomers;
        },
        loading() {
            return this.customerStore.isLoading;
        },
        pagination() {
            return this.customerStore.getPagination;
        },
        companyId() {
            return this.sessionStore.getCompany?.id || 0;
        }
    },
    mounted() {
        this.loadCustomers();
    },
    methods: {
        async loadCustomers() {
            if (this.companyId) {
                await this.customerStore.loadCustomers(this.companyId, this.currentPage, 10);
            }
        },
        async loadTableData(options: any) {
            // Este método se llama cuando cambia la paginación, ordenamiento, etc.
            const { page, itemsPerPage } = options;
            this.currentPage = page;
            
            if (this.companyId) {
                if (this.search.trim()) {
                    await this.customerStore.searchCustomers(
                        this.companyId,
                        this.search,
                        this.searchType,
                        page,
                        itemsPerPage
                    );
                } else {
                    await this.customerStore.loadCustomers(this.companyId, page, itemsPerPage);
                }
            }
        },
        async handleSearch() {
            if (this.companyId) {
                this.currentPage = 1;
                if (this.search.trim()) {
                    await this.customerStore.searchCustomers(
                        this.companyId,
                        this.search,
                        this.searchType,
                        this.currentPage,
                        10
                    );
                } else {
                    await this.loadCustomers();
                }
            }
        },
        async handleClearSearch() {
            this.search = '';
            this.searchType = 'global';
            this.currentPage = 1;
            await this.loadCustomers();
        },
        handleDownload(format: string) {
            console.log(`Descargando en formato: ${format}`);
            this.showSnackbar('Función de exportación próximamente', 'info');
        },
        createCustomer() {
            this.$router.push({ name: 'CreateCustomer' });
        },
        editCustomer(customer: CustomerModel) {
            this.$router.push({ name: 'CreateCustomer', params: { uuid: customer.uuid } });
        },
        confirmDelete(customer: CustomerModel) {
            this.customerToDelete = customer;
            this.deleteDialog = true;
        },
        async deleteCustomer() {
            if (!this.customerToDelete) return;

            this.deleteLoading = true;
            try {
                await this.customerStore.deleteCustomer(this.customerToDelete.uuid);
                this.showSnackbar('Cliente eliminado exitosamente', 'success');
                this.deleteDialog = false;
                this.customerToDelete = null;
                await this.loadCustomers();
            } catch (error: any) {
                console.error('Error deleting customer:', error);
                this.showSnackbar('Error al eliminar el cliente', 'error');
            } finally {
                this.deleteLoading = false;
            }
        },
        formatDate(date?: Date): string {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        showSnackbar(message: string, color = 'success') {
            this.snackbarMessage = message;
            this.snackbarColor = color;
            this.snackbar = true;
        }
    },
});
</script>
