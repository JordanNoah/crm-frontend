<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-card variant="elevated" elevation="0">
                    <div class="pa-2">
                        <v-btn color="primary" @click="dialog = true">
                            Crear sucursal
                        </v-btn>
                    </div>
                    <v-data-table-server :headers="headers" :items="items" :items-length="itemsLength"
                        @update:options="onUpdateOptions">
                        <template v-slot:[`item.actions`]="{ item }">
                            <v-icon icon="mdi-pencil" @click="editHeadquarter(item)" class="mr-2"></v-icon>
                            <v-icon icon="mdi-domain" class="mr-2" v-if="hasMobilePlugin" @click="toggleEnable(item)" :color="item.enableMobile ? 'green' : 'grey'"></v-icon>
                            <v-icon icon="mdi-cart" @click="openProducts(item)"></v-icon>
                        </template>
                        <template #no-data>
                            No hay sucursales registradas.
                        </template>
                    </v-data-table-server>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="dialog" max-width="600px">
            <v-card variant="elevated" elevation="0">
                <v-card-title>
                    Crear nueva sucursal
                </v-card-title>
                <v-container>
                    <v-form ref="form">
                        <v-row>
                            <v-col cols="12" v-if="hasMobilePlugin" class="d-flex flex-wrap">
                                <div class="d-flex flex-wrap">
                                    <!-- IMÁGENES EXISTENTES (URLs) -->
                                    <template v-if="editingItem.images?.length">
                                        <v-card v-for="(img, i) in editingItem.images" :key="'img-' + i"
                                            class="mr-2 mb-2 border-thin" style="flex: 0 0 100px" height="100"
                                            width="100">
                                            <v-img :src="img.url" cover height="100" width="100" />
                                        </v-card>
                                    </template>

                                    <!-- ARCHIVOS RECIÉN SELECCIONADOS (File objects) -->
                                    <template v-if="editingItem.files?.length">
                                        <v-card v-for="(file, i) in editingItem.files" :key="file.name || 'file-' + i"
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
                            <v-col cols="12" v-if="hasMobilePlugin">
                                <v-textarea label="Descripción" v-model="editingItem.description"
                                    :rules="descriptionRules"></v-textarea>
                            </v-col>
                            <v-col cols="12" :sm="hasInvoicePlugin ? 8 : 12">
                                <v-text-field label="Identificador" required hide-details="auto"
                                    v-model="editingItem.uuid" readonly></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" v-if="hasInvoicePlugin">
                                <v-text-field label="Numeración" required hide-details="auto"
                                    v-model="editingItem.number" readonly></v-text-field>
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
                                <v-text-field label="Dirección" required hide-details="auto"
                                    v-model="editingItem.address"
                                    :rules="[rules.address.required, rules.address.minLength]"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="dialog = false">Cancelar</v-btn>
                    <v-btn color="primary" @click="saveHeadquarter">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import ImageEntity from '@/core/entities/image.entity';
import PaginationEntity from '@/core/entities/pagination.entity';
import CompanyModel from '@/core/model/company.model';
import HeadquarterModel from '@/core/model/headquarter.model';
import AuthProvider from '@/core/providers/auth/auth';
import { useSessionStore } from '@/stores/session';
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'Headquart',
    data: () => ({
        dialog: false,
        headers: [
            { title: 'Identificador', value: 'uuid' },
            { title: 'Direccion', value: 'address' },
            { title: 'Ciudad', value: 'city' },
            { title: 'Estado/Provincia', value: 'state' },
            { title: '', value: 'actions', sortable: false },
        ],
        items: [] as HeadquarterModel[],
        itemsLength: 0,
        selectedFiles: [] as File[],
        editingItem: {
            uuid: crypto.randomUUID().toString(),
            address: '',
            city: '',
            state: '',
            files: [] as File[],
            images: [] as ImageEntity[],
            description: '',
            companyId: 0,
        } as HeadquarterModel,
        useSessionStore: useSessionStore(),
        tableOptions: {
            page: 1,
            itemsPerPage: 10,
            sortBy: [{ key: 'number', order: 'desc' }], // Vuetify v3
            search: ''
        },
        loading: false,
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
        } as Record<string, any>
    }),
    watch: {
        dialog(newVal) {
            if (!newVal) {
                this.$router.push({ name: 'Headquart' });
                if (this.company) {
                    this.editingItem = {
                        uuid: crypto.randomUUID().toString(),
                        address: '',
                        city: '',
                        state: '',
                        files: [] as File[],
                        images: [] as ImageEntity[],
                        description: '',
                        companyId: this.company.id!,
                    } as HeadquarterModel;
                }
            }
            if (newVal && !this.editingItem.number && this.hasInvoicePlugin) {
                this.getPosibleNextNumber();
            }
        },
        'useSessionStore.company': {
            immediate: true,
            handler(newCompany) {
                if (newCompany) {
                    this.getHeadquarters();
                }
            }
        },
        selectedFiles(newFiles) {
            if (newFiles && newFiles.length > 0) {
                this.editingItem.files.push(...newFiles);
            }
        },
        uuid(newVal) {
            if (newVal) {
                this.findByUuid(newVal);
            }
        }
    },
    mounted() {
        if (this.hasMobilePlugin) {
            this.assignMobileRules();
        }
        if (this.uuid) {
            this.findByUuid(this.uuid);
        } else if (this.hasInvoicePlugin) {
            this.getPosibleNextNumber();
        }
    },
    computed: {
        hasInvoicePlugin(): boolean {
            return !!this.useSessionStore.installedPlugins.find(p => p.toName === 'InvoicePlugin');
        },
        hasMobilePlugin(): boolean {
            return !!this.useSessionStore.installedPlugins.find(p => p.toName === 'PhonePlugin');
        },
        company(): CompanyModel | null {
            return this.useSessionStore.company;
        },
        isEditing(): boolean {
            const { uuid } = this.$route.params as { uuid?: string };
            return typeof uuid === 'string' && uuid.length > 0;
        },
        uuid(): string | undefined {
            const { uuid } = this.$route.params as { uuid?: string };
            return typeof uuid === 'string' ? uuid : undefined;
        },
        descriptionRules() {
            if (!this.hasMobilePlugin) return [];
            return [
                (v: string) => !!v || 'La descripción es obligatoria',
                (v: string) => (v?.length ?? 0) >= 10 || 'La descripción debe tener al menos 10 caracteres',
            ];
        },
    },
    methods: {
        editHeadquarter(item: HeadquarterModel) {
            this.editingItem = {
                uuid: item.uuid,
                address: item.address,
                number: item.number,
                city: item.city,
                state: item.state,
                files: [] as File[],
                images: item.images || [],
                companyId: item.companyId!,
                enableMobile: item.enableMobile,
            };
            this.dialog = true;
            this.$router.push({
                name: 'HeadquarterEdit',
                params: { uuid: item.uuid },
            });
        },
        assignMobileRules() {
            this.rules = {
                ...this.rules,
                description: {
                    required: (v: string) =>
                        !this.hasMobilePlugin || !!v || 'La descripción es obligatoria',
                    minLength: (v: string) =>
                        !this.hasMobilePlugin || v.length >= 10 || 'La descripción debe tener al menos 10 caracteres'
                }
            }
        },
        async onUpdateOptions(opts: any) {
            this.tableOptions = { ...this.tableOptions, ...opts };
            await this.getHeadquarters();
        },
        async getPosibleNextNumber() {
            if (this.useSessionStore.company) {
                this.editingItem.number = await AuthProvider.getNextNumberForHeadquarter(this.useSessionStore.company.id!)
            }
        },
        async saveHeadquarter() {
            // 1) Validar formulario Vuetify
            const result = await (this.$refs.form as any)?.validate?.();
            const valid = typeof result === 'object' ? !!result.valid : !!result;

            if (!valid) return;

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
            this.dialog = false;
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
        triggerFileInput() {
            (this.$refs.fileInput as HTMLInputElement).click();
        },
        previewFile(file: File | ImageEntity): string {
            if (file instanceof File) {
                return URL.createObjectURL(file);
            } else if (file instanceof ImageEntity) {
                return file.url;
            }
            return '';
        },
        async findByUuid(uuid: string) {
            this.loading = true;
            try {
                const headquarter = await AuthProvider.getHeadquarterByUuid(uuid);
                console.log(headquarter);

                if (headquarter) {
                    this.editingItem = headquarter
                    this.dialog = true;
                } else {
                    // Si no se encuentra, redirigir a la lista
                    this.$router.push({ name: 'Headquart' });
                }
            } catch (error) {
                console.error('Error fetching headquarter by UUID:', error);
                this.$router.push({ name: 'Headquart' });
            } finally {
                this.loading = false;
            }
        },
        async toggleEnable(item: HeadquarterModel) {
            if (!item.enableMobile && item.images.length === 0) {
                alert('Debe agregar al menos una imagen para habilitar el acceso móvil.');
                return;
            }
            if (!item.enableMobile && !item.description) {
                alert('Debe agregar una descripción para habilitar el acceso móvil.');
                return;
            }

            item.enableMobile ? await AuthProvider.disableHeadquarterMobile(item.uuid) : await AuthProvider.enableHeadquarterMobile(item.uuid);
            item.enableMobile = !item.enableMobile;
        },
        openProducts(item: HeadquarterModel) {
            this.$router.push({ name: 'HeadquarterProducts', params: { uuid: item.uuid } });
        }
    }
})
</script>