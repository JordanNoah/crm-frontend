<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-card variant="elevated" elevation="0">
                    <div class="pa-2">
                        <v-btn color="primary" @click="createHeadquarter">
                            Crear sucursal
                        </v-btn>
                    </div>
                    <v-data-table-server :headers="headers" :items="items" :items-length="itemsLength"
                        @update:options="onUpdateOptions">
                        <template v-slot:[`item.actions`]="{ item }">
                            <v-icon icon="mdi-pencil" @click="editHeadquarter(item)" class="mr-2"></v-icon>
                        </template>
                        <template #no-data>
                            No hay sucursales registradas.
                        </template>
                    </v-data-table-server>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import PaginationEntity from '@/core/entities/pagination.entity';
import CompanyModel from '@/core/model/company.model';
import HeadquarterModel from '@/core/model/headquarter.model';
import ProductModel from '@/core/model/product.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { defineComponent } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
    data: () => ({
         headers: [
            { title: 'Identificador', value: 'uuid' },
            { title: 'Direccion', value: 'address' },
            { title: 'Ciudad', value: 'city' },
            { title: 'Estado/Provincia', value: 'state' },
            { title: '', value: 'actions', sortable: false },
        ],
        items: [] as HeadquarterModel[],
        tableOptions: {
            page: 1,
            itemsPerPage: 10,
            sortBy: [{ key: 'number', order: 'desc' }], // Vuetify v3
            search: ''
        },
        loading: false,
        itemsLength: 0,
        useSessionStore: useSessionStore(),
    }),
    computed: {
        hasMobilePlugin(): boolean {
            return !!this.useSessionStore.installedPlugins.find(p => p.toName === 'PhonePlugin');
        },
        company(): CompanyModel | null {
            return useSessionStore().getCompany;
        },
    },
    methods: {
        async onUpdateOptions(opts: any) {
            this.tableOptions = { ...this.tableOptions, ...opts };
            await this.getHeadquarters();
        },
        async getHeadquarters() {
            if (!this.useSessionStore.company) return;

            this.loading = true;
            try {
                const { page, itemsPerPage, sortBy, search } = this.tableOptions;

                const sort = sortBy?.[0]?.key ?? 'number';
                const order = (sortBy?.[0]?.order ?? 'desc').toUpperCase(); // 'ASC'|'DESC'

                const offset = (page - 1) * itemsPerPage;

                const pagination = new PaginationEntity(page, itemsPerPage, offset, sort, order, search);
                const resp = await AuthProvider.getCompanyHeadquarters(
                    this.useSessionStore.company.id!,
                    pagination
                );

                // Respóndele a la tabla con items y total
                this.items = resp.items;      // array de HeadquarterModel
                this.itemsLength = resp.total; // total global para la paginación
            } finally {
                this.loading = false;
            }
        },
        editHeadquarter(item: HeadquarterModel) {
            this.$router.push({
                name: 'HeadquarterEdit',
                params: { uuid: item.uuid },
            });
        },
        openProducts(item: HeadquarterModel) {
            this.$router.push({ name: 'HeadquarterProducts', params: { uuid: item.uuid } });
        },
        createHeadquarter() {
            this.$router.push({ name: 'HeadquarterEdit', params: { uuid: uuidv4() } });
        }
    }
})
</script>