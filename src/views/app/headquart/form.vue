<template>
    <v-container>
        <v-card variant="elevated" elevation="0" class="mb-4">
            <v-card-title>
                Crear nueva sucursal
            </v-card-title>
            <v-container v-if="editingItem">
                <v-form ref="form">
                    <v-row>
                        <v-col cols="12" :sm="hasInvoicePlugin ? 8 : 12">
                            <v-text-field label="Identificador" required hide-details="auto" v-model="editingItem.uuid"
                                readonly></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4" v-if="hasInvoicePlugin">
                            <v-text-field label="Numeración" required hide-details="auto" v-model="editingItem.number"
                                readonly></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="8">
                            <v-text-field label="Ciudad" required hide-details="auto" v-model="editingItem.city"
                                :rules="[rules.city.required, rules.city.minLength]"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="4">
                            <v-text-field label="Estado/Provincia" required hide-details="auto"
                                v-model="editingItem.state"
                                :rules="[rules.state.required, rules.state.minLength]"></v-text-field>
                        </v-col>
                        <v-col cols="12" :sm="hasInvoicePlugin ? 8 : 12">
                            <v-text-field label="Dirección" required hide-details="auto" v-model="editingItem.address"
                                :rules="[rules.address.required, rules.address.minLength]"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text :to="{ name: 'HeadquarterDashboard' }">Cancelar</v-btn>
                <v-btn color="primary" @click="saveHeadquarter">Guardar</v-btn>
            </v-card-actions>
        </v-card>
        
        <v-card v-if="hasMobilePlugin && (editingItem && editingItem.id)" variant="elevated" elevation="0" class="mb-4">
            <v-card-title>
                Configuración para plugin de teléfono móvil
            </v-card-title>
            <v-container v-if="editingItem">
                <v-form>
                    <v-row>
                        <v-col cols="12" class="d-flex flex-wrap">
                            <div class="d-flex flex-wrap">
                                <!-- IMÁGENES EXISTENTES (URLs) -->
                                <template v-if="editingItem.images?.length">
                                    <v-card v-for="(img, i) in editingItem.images" :key="'img-' + i"
                                        class="mr-2 mb-2 border-thin" style="flex: 0 0 100px" height="100" width="100">
                                        <v-img :src="img.url" cover height="100" width="100" />
                                    </v-card>
                                </template>

                                <!-- ARCHIVOS RECIÉN SELECCIONADOS (File objects) -->
                                <template v-if="editingItem.files?.length">
                                    <v-card v-for="(file, i) in editingItem.files" :key="file.name || 'file-' + i"
                                        class="mr-2 mb-2 border-thin" style="flex: 0 0 100px" height="100" width="100">
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
                        <v-col cols="6">
                            <v-textarea label="Descripción" v-model="editingItem.description"
                                :rules="descriptionRules"></v-textarea>
                        </v-col>
                        <v-col cols="6">
                            <v-autocomplete
                                v-model="selectedTags"
                                :items="availableTags"
                                item-title="name"
                                item-value="id"
                                label="Seleccionar tags"
                                multiple
                                chips
                                closable-chips
                                hide-details="auto"
                                variant="outlined"
                                :loading="loadingTags"
                                return-object
                            >
                                <template v-slot:chip="{ props, item }">
                                    <v-chip
                                        v-bind="props"
                                        :text="item.raw.name"
                                        :color="item.raw.color || 'primary'"
                                        closable
                                    >
                                        <template v-if="item.raw.icon" #prepend>
                                            <v-icon :icon="item.raw.icon" size="small"></v-icon>
                                        </template>
                                    </v-chip>
                                </template>
                                <template v-slot:item="{ props, item }">
                                    <v-list-item v-bind="props" :title="item.raw.name">
                                        <template v-if="item.raw.icon" #prepend>
                                            <v-icon :icon="item.raw.icon" :color="item.raw.color || 'primary'"></v-icon>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                </v-form>
            </v-container>
            <v-card-actions v-if="editingItem && editingItem.id">
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="updateMobilePlugin" :loading="savingMobilePlugin">
                    Actualizar Mobile Plugin
                </v-btn>
            </v-card-actions>
        </v-card>
        
        <v-card variant="elevated" elevation="0" v-if="editingItem && editingItem.id">
            <v-container>
                <v-card-title>
                    Productos asignados
                </v-card-title>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-autocomplete label="Seleccionar productos" :items="products" item-title="name"
                                item-value="id" v-model="selectedProducts" v-model:search="search" hide-details="auto"
                                :loading="loadingProduct" no-filter clearable return-object>
                                <template v-slot:no-data>
                                    <v-list-item>
                                        <v-list-item-title>
                                            {{ search ? 'No se encontraron productos' : 'Escribe para buscar' }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </template>
                                <template v-slot:item="{ props, item }">
                                    <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.code">
                                        <template #prepend>
                                            <v-avatar>
                                                <v-img :src="imageProductUrl(item.raw)" width="32" height="32" cover />
                                            </v-avatar>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12">
                            <v-data-table-server :headers="headers" :items="itemsProducts" :items-length="totalItems">
                                <template v-slot:[`item.name`]="{ item }">
                                    <div class="d-flex align-center">
                                        <div width="80">
                                            <v-img :src="imageProductUrl(item)" width="80" height="40" cover></v-img>
                                        </div>
                                        <span class="ml-2">{{ item.name }}</span>
                                    </div>
                                </template>
                                <template v-slot:[`item.actions`]="{ item }">
                                    <v-icon icon="mdi-tray-remove" @click="removeProduct(item)" class="mr-2"></v-icon>
                                </template>
                            </v-data-table-server>
                        </v-col>
                    </v-row>
                </v-container>
            </v-container>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import ImageEntity from '@/core/entities/image.entity';
import HeadquarterModel from '@/core/model/headquarter.model';
import ProductModel from '@/core/model/product.model';
import TagModel from '@/core/model/tags.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { defineComponent } from 'vue';

export default defineComponent({
    data: () => ({
        useSessionStore: useSessionStore(),
        editingItem: null as HeadquarterModel | null,
        selectedFiles: [] as File[],
        rules: {
            city: {
                required: (v: string) => !!v || 'La ciudad es obligatoria',
                minLength: (v: string) => v.length >= 2 || 'La ciudad debe tener al menos 2 caracteres'
            },
            state: {
                required: (v: string) => !!v || 'El estado es obligatorio',
                minLength: (v: string) => v.length >= 2 || 'El estado debe tener al menos 2 caracteres'
            },
            address: {
                required: (v: string) => !!v || 'La dirección es obligatoria',
                minLength: (v: string) => v.length >= 5 || 'La dirección debe tener al menos 5 caracteres'
            },
        } as Record<string, any>,
        products: [] as ProductModel[],
        selectedProducts: null as ProductModel | null,
        search: '',
        loadingProduct: false,
        headers: [
            { title: 'Nombre', value: 'name' },
            { title: 'Categoría', value: 'category.name' },
            { title: 'Precio', value: 'price' },
            { title: 'Acciones', value: 'actions', sortable: false },
        ],
        itemsProducts: [] as ProductModel[],
        totalItems: 0,
        // Tags
        availableTags: [] as TagModel[],
        selectedTags: [] as TagModel[],
        loadingTags: false,
        savingMobilePlugin: false,
    }),
    computed: {
        hasMobilePlugin(): boolean {
            return !!this.useSessionStore.installedPlugins.find(p => p.toName === 'PhonePlugin');
        },
        descriptionRules() {
            if (!this.hasMobilePlugin) return [];
            return [
                (v: string) => !!v || 'La descripción es obligatoria',
                (v: string) => (v?.length ?? 0) >= 10 || 'La descripción debe tener al menos 10 caracteres',
            ];
        },
        hasInvoicePlugin(): boolean {
            return !!this.useSessionStore.installedPlugins.find(p => p.toName === 'InvoicePlugin');
        },
        uuid(): string {
            return this.$route.params.uuid as string;
        },
    },
    async mounted() {
        await this.getByUuid(this.uuid);
        await this.loadAllTags();
        if (this.editingItem && this.editingItem.id) {
            await this.loadHeadquarterTags();
            await this.getAssociatedProducts();
        }
    },
    watch: {
        selectedFiles(newFiles) {
            if (this.editingItem && newFiles && newFiles.length > 0) {
                this.editingItem.files.push(...newFiles);
            }
        },
        async search(newVal) {
            if (newVal.length > 2) {
                await this.loadProducts(newVal);
            }
        },
        async selectedProducts(newVal) {
            if (newVal) {
                await this.addProductToHeadquarter(newVal);
                this.selectedProducts = null;
            }
        }
    },
    methods: {
        imageProductUrl(product: ProductModel): string {
            if (product.images && product.images.length > 0) {
                return product.images[0].url;
            }
            return 'https://www.shutterstock.com/image-vector/missing-picture-page-website-design-600nw-1552421075.jpg';
        },
        async loadProducts(search = '') {
            if (!this.useSessionStore.company) return;
            const response = await AuthProvider.getProductsByString(this.useSessionStore.company.id!, search, this.editingItem!.id ?? 0);
            this.products = response;
        },
        async getByUuid(uuid: string) {
            const response = await AuthProvider.getHeadquarterByUuid(uuid);
            if (response) {
                this.editingItem = response;
            } else {
                this.editingItem = HeadquarterModel.newCleaner();
                this.editingItem.uuid = uuid;
            }
        },
        previewFile(file: File | ImageEntity): string {
            if (file instanceof File) {
                return URL.createObjectURL(file);
            } else if (file instanceof ImageEntity) {
                return file.url;
            }
            return '';
        },
        triggerFileInput() {
            (this.$refs.fileInput as HTMLInputElement).click();
        },
        async saveHeadquarter() {
            const result = await (this.$refs.form as any)?.validate?.();
            const valid = typeof result === 'object' ? !!result.valid : !!result;

            if (!valid) return;
            if (!this.editingItem) return;
            const headquarter = new HeadquarterModel(
                this.editingItem.uuid,
                this.editingItem.address,
                this.editingItem.city,
                this.editingItem.state,
                this.useSessionStore.company!.id!,
                this.editingItem.files,
                this.editingItem.images,
                this.editingItem.number,
                this.editingItem.description
            );
            await AuthProvider.createHeadquarter(headquarter);
            this.$router.push({ name: 'HeadquarterDashboard' });
        },
        async addProductToHeadquarter(product: ProductModel) {
            if (!this.editingItem || !this.editingItem.id) return;
            await AuthProvider.addProductToHeadquarter(this.editingItem.id!, product.id!, 0);
            await this.getAssociatedProducts();
            this.selectedProducts = null;
        },
        async removeProduct(product: ProductModel) {
            if (!this.editingItem || !this.editingItem.id) return;
            try {
                await AuthProvider.removeProductFromHeadquarter(this.editingItem.id!, product.id!);
                this.itemsProducts = this.itemsProducts.filter(p => p.id !== product.id);
            } catch (error) {
                console.error('Error removing product from headquarter:', error);
            }
        },
        async getAssociatedProducts() {
            if (!this.editingItem || !this.editingItem.id) return;
            this.itemsProducts = await AuthProvider.getProductsByHeadquarter(this.editingItem.id!)            
        },
        
        // ==========================================
        // MÉTODOS PARA TAGS
        // ==========================================
        
        async loadAllTags() {
            try {
                this.loadingTags = true;
                this.availableTags = await AuthProvider.getAllTags();
            } catch (error) {
                console.error('Error loading tags:', error);
            } finally {
                this.loadingTags = false;
            }
        },
        
        async loadHeadquarterTags() {
            if (!this.editingItem || !this.editingItem.id) return;
            
            try {
                this.loadingTags = true;
                const tags = await AuthProvider.getTagsByHeadquarter(this.editingItem.id);
                this.selectedTags = tags;
            } catch (error) {
                console.error('Error loading headquarter tags:', error);
            } finally {
                this.loadingTags = false;
            }
        },
        
        async updateMobilePlugin() {
            if (!this.editingItem || !this.editingItem.id) return;
            
            try {
                this.savingMobilePlugin = true;
                
                // 1. Actualizar descripción e imágenes del headquarter
                const headquarter = new HeadquarterModel(
                    this.editingItem.uuid,
                    this.editingItem.address,
                    this.editingItem.city,
                    this.editingItem.state,
                    this.useSessionStore.company!.id!,
                    this.editingItem.files,
                    this.editingItem.images,
                    this.editingItem.number,
                    this.editingItem.description
                );
                await AuthProvider.createHeadquarter(headquarter);
                
                // 2. Sincronizar tags
                const tagIds = this.selectedTags.map(tag => tag.id!);
                await AuthProvider.syncTagsToHeadquarter(this.editingItem.id, tagIds);
                
                // 3. Recargar datos para confirmar
                await this.getByUuid(this.uuid);
                await this.loadHeadquarterTags();
                
                // Limpiar archivos seleccionados
                this.selectedFiles = [];
                
                console.log('Mobile plugin actualizado exitosamente');
            } catch (error) {
                console.error('Error updating mobile plugin:', error);
            } finally {
                this.savingMobilePlugin = false;
            }
        },
    }
})
</script>