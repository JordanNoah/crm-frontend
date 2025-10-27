<template>
    <v-container fluid>
        <div class="d-flex justify-space-between align-center mb-8">
            <div>
                <h3>
                    Añadir / Editar Producto
                </h3>
                <p>
                    Setea los detalles del producto aquí.
                </p>
            </div>
            <div>
                <v-btn color="primary" class="ma-2" :to="{ name: 'ProductDashboard' }" variant="text">
                    Volver al listado
                </v-btn>
                <v-btn color="error" class="ma-2" @click="deleteProduct" variant="text">
                    Eliminar Producto
                </v-btn>
                <v-btn color="success" class="ma-2" @click="saveProduct" variant="tonal">
                    Guardar Producto
                </v-btn>
            </div>
        </div>
        <v-form ref="form" v-if="product">
            <v-row>
                <v-col cols="8">
                    <v-card class="pa-4 mb-8 border-thin">
                        <h5 class="mb-4">Informacion del Producto</h5>
                        <div>
                            <v-text-field label="Nombre" hide-details="auto" class="mb-4" :rules="[rules.required]" v-model="product.name"></v-text-field>
                            <v-text-field label="Codigo" hide-details="auto" class="mb-4" :rules="[rules.required]" v-model="product.code"></v-text-field>
                            <v-textarea label="Descripcion" hide-details="auto" v-model="product.description"></v-textarea>
                        </div>
                    </v-card>
                    <v-card class="pa-4 mb-8 border-thin">
                        <h5 class="mb-4">
                            Imagenes del Producto
                        </h5>
                        <v-row>
                            <v-col cols="12">
                                <div class="d-flex flex-wrap">
                                    <template v-if="product.images.length">
                                        <v-card v-for="(img, i) in product.images" :key="'img-' + i"
                                            class="mr-2 mb-2 border-thin" style="flex: 0 0 100px" height="100"
                                            width="100">
                                            <v-img :src="img.url" cover height="100" width="100" />
                                        </v-card>
                                    </template>

                                    <!-- ARCHIVOS RECIÉN SELECCIONADOS (File objects) -->
                                    <template v-if="product.files.length">
                                        <v-card v-for="(file, i) in product.files" :key="file.name || 'file-' + i"
                                            class="mr-2 mb-2 border-thin" style="flex: 0 0 100px" height="100"
                                            width="100">
                                            <v-img :src="previewFile(file)" cover height="100" width="100" />
                                        </v-card>
                                    </template>

                                    <!-- CARD PARA AGREGAR (DENTRO DEL MISMO FLEX) -->
                                    <v-card height="100" width="100"
                                        class="border-dashed mr-2 mb-2 d-flex align-center justify-center"
                                        style="flex: 0 0 100px; cursor: pointer;" @click="triggerFileInput">
                                        <v-icon icon="mdi-image" size="34"></v-icon>
                                    </v-card>
                                </div>
                                <v-file-input v-show="false" v-model="selectedFiles" multiple
                                    accept="image/png, image/jpeg, image/gif" ref="fileInput" />
                            </v-col>
                        </v-row>
                    </v-card>
                    <v-card class="pa-4 border-thin">
                        <h5 class="mb-4">Variantes</h5>
                        <v-row>
                            <v-col cols="4">
                                <v-select label="Opciones" hide-details="auto"></v-select>
                            </v-col>
                            <v-col cols="8">
                                <v-text-field label="Valor" hide-details="auto"></v-text-field>
                            </v-col>
                            <v-col cols="12" class="d-flex justify-end">
                                <v-btn color="primary" class="ma-2" variant="text">
                                    Añadir Variante
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>
                <v-col cols="4">
                    <v-card class="pa-4 border-thin">
                        <h5 class="mb-4">Precio</h5>
                        <v-text-field label="Precio" hide-details="auto" class="mb-4" prefix="$" :rules="[rules.required]" v-model="product.price"></v-text-field>
                        <v-text-field label="Precio de oferta" hide-details="auto" class="mb-4" prefix="$" :rules="[rules.required]" v-model="product.offertPrice"></v-text-field>
                        <v-select label="Impuesto" hide-details="auto" class="mb-4" :rules="[rules.required]" v-model="product.taxId" :items="taxes" item-title="name" item-value="id"></v-select>
                    </v-card>
                    <v-card class="pa-4 mt-8 border-thin">
                        <h5 class="mb-4">Categoría y Estado</h5>
                        <div class="d-flex align-top mb-4">
                            <v-select label="Categoría" hide-details="auto" class="mr-2" :rules="[rules.required]" :items="categories" item-title="name" item-value="id" v-model="product.categoryId"></v-select>
                            <v-btn variant="outlined" :min-width="38" :max-width="38" :min-height="38" :max-height="38" @click="categoryDialog = true"
                                class="pa-0">
                                <v-icon icon="mdi-plus" size="20" color="primary"></v-icon>
                            </v-btn>
                        </div>
                        <v-select label="Estado" hide-details="auto" class="mb-4"
                            :items="statusItems" :rules="[rules.required]" v-model="product.status" item-title="title" item-value="id"></v-select>
                        <v-combobox v-model="product.tags" label="Tags" multiple chips closable-chips variant="outlined"
                            class="tags-input" hide-no-data hide-details="auto">
                        </v-combobox>
                    </v-card>
                </v-col>
            </v-row>
        </v-form>
        <div v-else>
            <v-skeleton-loader type="article" />
        </div>
        <v-dialog v-model="categoryDialog" max-width="500">
            <v-card variant="elevated">
                <v-card-title class="text-h5">Crear categoría</v-card-title>
                <v-card-text>
                    <v-form ref="categoryForm">
                        <v-text-field label="Nombre de la categoría" hide-details="auto" :rules="[rules.required]" class="mb-4" v-model="newCategory.name"></v-text-field>
                        <v-textarea label="Descripción" hide-details="auto" v-model="newCategory.description"></v-textarea>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="categoryDialog = false">Cancelar</v-btn>
                    <v-btn color="success" text @click="createCategory">Crear</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import ProductModel from '@/core/model/product.model';
import ProductCategoryModel from '@/core/model/productCategory.model';
import TaxModel from '@/core/model/tax.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { defineComponent } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
    name: 'ProductFormView',
    data: () => ({
        selectedFiles: [] as File[],
        product: null as ProductModel | null,
        rules: {
            required: (value: any) => !!value || 'Este campo es requerido.'
        },
        categoryDialog: false,
        newCategory: {
            name: '',
            description: ''
        },
        categories: [] as ProductCategoryModel[],
        statusItems: [
            { id: 0, title: 'Borrador', value: 'draft' },
            { id: 1, title: 'Publicado', value: 'published' },
            { id: 2, title: 'Agotado', value: 'out_of_stock' },
        ],
        taxes: [] as TaxModel[],
    }),
    computed: {
        company() {
            return useSessionStore().getCompany;
        },
        uuid(): string {
            return this.$route.params.uuid as string;
        },
    },
    watch: {
        async company() {
            await this.getCategories();
        },
        selectedFiles(newFiles: File[]) {
            if (this.product) {
                this.product.files.push(...newFiles);
            }
        }
    },
    async mounted() {
        const product = await this.getProductUuid();
        console.log(this.company);
        console.log(product);
        
        
        if (!product) {
            this.createProduct();
        }else if (product) {
            this.product = product;
        }
        await this.getCategories();
        await this.getTaxRates()
    },
    methods: {
        async getTaxRates() {
            this.taxes = await AuthProvider.getTaxRates();
        },
        createProduct() {
            console.log(this.company);
            
            if (!this.company) return;
            this.product = ProductModel.createEmpty(this.company.id!);
        },
        previewFile(file: File) {
            return URL.createObjectURL(file);
        },
        async saveProduct() {
            const result = await (this.$refs.form as any)?.validate?.();
            const valid = typeof result === 'object' ? !!result.valid : !!result;

            if (!valid) return;

            this.product!.uuid = this.uuid;
            const response = !this.product!.id ? await AuthProvider.saveProduct(this.product!) : await AuthProvider.updateProduct(this.product!);
            this.$router.push({ name: 'ProductDashboard' });

        },
        deleteProduct() {
            alert('Producto eliminado (no implementado)');
        },
        triggerFileInput() {
            (this.$refs.fileInput as any).click();
        },
        async getProductUuid() {
            const response = await AuthProvider.getProductByUuid(this.uuid);
            if (!response || !this.company) return;
            
            return response
        },
        async getCategories() {
            if (!this.company) return [];
            const response = await AuthProvider.getCategories(this.company.id!);
            this.categories = response;
        },
        async createCategory() {
            const result = await (this.$refs.categoryForm as any)?.validate?.();
            const valid = typeof result === 'object' ? !!result.valid : !!result;

            if (!valid && !this.company) return;

            const category = new ProductCategoryModel(
                uuidv4(),
                this.newCategory.name,
                this.newCategory.description,
                this.company!.id!,
            );

            const response = await AuthProvider.saveCategory(category);
            this.categories.push(response);
            
            this.categoryDialog = false;
        }
    },
});
</script>

<style scoped>
h5 {
    line-height: 1.75rem;
    font-size: 1.125rem;
}

.tags-input :deep(.v-field__append-inner) {
    display: none !important;
}
</style>