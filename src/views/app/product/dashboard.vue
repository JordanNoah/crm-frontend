<template>
    <v-container>
        <v-card variant="elevated" elevation="0">
            <v-container>
                <h4>
                    Filtros
                </h4>
                <v-row>
                    <v-col>
                        <v-select label="Estado" :items="['Activo', 'Inactivo']"></v-select>
                    </v-col>
                    <v-col>
                        <v-select label="Categoría" :items="['Categoría 1', 'Categoría 2']"></v-select>
                    </v-col>
                    <v-col>
                        <v-text-field label="Buscar"></v-text-field>
                    </v-col>
                </v-row>
            </v-container>
            <v-divider></v-divider>
            <v-container>
                <div class="d-flex">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" class="ma-2" :to="{ name: 'ProductForm', params: { uuid: newUuid() } }">
                        Nuevo Producto
                    </v-btn>
                </div>
            </v-container>
            <v-divider></v-divider>
            <v-container>
                <v-data-table-server :headers="headers" :items="items" :items-length="totalItems">
                    <template v-slot:[`item.name`]="{ item }">
                        <div class="d-flex align-center">
                            <div width="80">
                                <v-img :src="imageProductUrl(item)" width="80" height="40" cover></v-img>
                            </div>
                            <span class="ml-2">{{ item.name }}</span>
                        </div>
                    </template>
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-icon icon="mdi-pencil" @click="editProduct(item)" class="mr-2"></v-icon>
                        <v-icon icon="mdi-domain" @click="addToAllDomain(item)"></v-icon>
                    </template>
                </v-data-table-server>
            </v-container>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import PaginationEntity from '@/core/entities/pagination.entity';
import CompanyModel from '@/core/model/company.model';
import ProductModel from '@/core/model/product.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { defineComponent } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
    name: 'ProductView',
    data: () => ({
        headers: [
            { title: 'Nombre', value: 'name' },
            { title: 'Categoría', value: 'category.name' },
            { title: 'Precio', value: 'price' },
            { title: 'Estado', value: 'status' },
            { title: 'Acciones', value: 'actions', sortable: false },
        ],
        items: [] as ProductModel[],
        tableOptions: {
            page: 1,
            itemsPerPage: 10,
            sortBy: [{ key: 'number', order: 'desc' }], // Vuetify v3
            search: ''
        },
        loading: false,
        totalItems: 0,
    }),
    computed: {
        company(): CompanyModel | null {
            return useSessionStore().getCompany;
        }
    },
    watch: {
        company: {
            immediate: true,
            async handler() {
                await this.getProducts();
            }
        }
    },
    async mounted() {
        await this.getProducts();
    },
    methods: {
        newUuid() {
            return uuidv4();
        },
        async onUpdateOptions(opts: any) {
            this.tableOptions = { ...this.tableOptions, ...opts };
            await this.getProducts();
        },
        async getProducts() {
            if (!this.company) return;
            this.loading = true;
            try {
                const { page, itemsPerPage, sortBy, search } = this.tableOptions
                const sort = sortBy?.[0]?.key ?? 'number';
                const order = (sortBy?.[0]?.order ?? 'desc').toUpperCase(); // 'ASC'|'DESC'

                const offset = (page - 1) * itemsPerPage;

                const pagination = new PaginationEntity(page, itemsPerPage, offset, sort, order, search);

                const response = await AuthProvider.getProducts(this.company.id!, pagination);
                this.items = response.items;
                this.totalItems = response.total;
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                this.loading = false;
            }
        },
        editProduct(item: ProductModel) {
            this.$router.push({ name: 'ProductForm', params: { uuid: item.uuid } });
        },
        imageProductUrl(product: ProductModel): string {
            if (product.images && product.images.length > 0) {
                return product.images[0].url;
            }
            return 'https://www.shutterstock.com/image-vector/missing-picture-page-website-design-600nw-1552421075.jpg';
        },
        async addToAllDomain(item: ProductModel) {
            if (!this.company) return;
            await AuthProvider.addProductToAllDomains(item.id!, this.company.id!);
        }
    },
});
</script>

<style scoped>
.v-data-table__thead {
    background-color: #f5f5f5;
}
</style>