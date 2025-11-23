<template>
    <v-form ref="form">
        <v-row>
            <v-col cols="12">
                <v-card variant="elevated">
                    <v-container fluid>
                        <v-row>
                            <v-col class="d-flex align-center">
                                <div>
                                    <h3 class="text-h5 font-weight-bold">Roles y Permisos</h3>
                                    <p>
                                        Setea el rol y permisos
                                    </p>
                                </div>
                                <v-spacer></v-spacer>
                                <div>
                                    <v-btn class="mr-2" @click="$router.push('/app/roles')">
                                        {{ editingData.isSystem ? 'Volver' : 'Descartar cambios' }}
                                    </v-btn>
                                    <v-btn 
                                        v-if="!editingData.isSystem"
                                        @click="saveChanges"
                                        color="primary"
                                    >
                                        Guardar cambios
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
            <v-col cols="12">
                <v-card variant="elevated">
                    <v-container fluid>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field 
                                    label="Nombre del rol" 
                                    :rules="[rules.required]" 
                                    v-model="editingData.name"
                                    :readonly="editingData.isSystem"
                                ></v-text-field>
                                <v-text-field 
                                    label="Descripción del rol" 
                                    v-model="editingData.description"
                                    :readonly="editingData.isSystem"
                                ></v-text-field>
                                <v-checkbox label="Rol de sistema" readonly v-model="editingData.isSystem"></v-checkbox>
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-data-table :headers="headerPermissions" items-per-page="50" :items="itemPermissions">
                                    <template v-slot:[`item.level`]="{ item }">
                                        <v-btn-toggle 
                                            :model-value="item.allowed" 
                                            @update:model-value="!editingData.isSystem && (item.allowed = $event)"
                                            color="primary" 
                                            variant="outlined"
                                            density="compact"
                                            :disabled="editingData.isSystem"
                                        >
                                            <v-tooltip 
                                                :text="editingData.isSystem ? 'Los roles de sistema no se pueden modificar' : 'No Permitido'" 
                                                location="top"
                                            >
                                                <template v-slot:activator="{ props }">
                                                    <v-btn 
                                                        v-bind="props" 
                                                        :value="false"
                                                        icon="mdi-hand-back-left-off-outline"
                                                    ></v-btn>
                                                </template>
                                            </v-tooltip>

                                            <v-tooltip 
                                                :text="editingData.isSystem ? 'Los roles de sistema no se pueden modificar' : 'Permitido'" 
                                                location="top"
                                            >
                                                <template v-slot:activator="{ props }">
                                                    <v-btn 
                                                        v-bind="props" 
                                                        :value="true"
                                                        icon="mdi-hand-back-left-outline"
                                                    ></v-btn>
                                                </template>
                                            </v-tooltip>
                                        </v-btn-toggle>
                                    </template>
                                </v-data-table>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import PermissionModel from "@/core/model/permission.model";
import RoleModel from "@/core/model/role.model";
import RoleRequest from "@/core/model/role-request.model";
import AuthProvider from "@/core/providers/auth/auth";
import { useSessionStore } from "@/stores/session";
import { defineComponent } from "vue";

export default defineComponent({
    name: "RolesPermissionForm",
    data: () => ({
        headerPermissions: [
            { title: 'Nombre', value: 'name' },
            { title: 'Código', value: 'code' },
            { title: 'Descripción', value: 'description' },
            { title: 'Modulo', value: 'module' },
            { title: 'Nivel', value: 'level' },
        ],
        itemPermissions: [] as PermissionModel[],
        rules: {
            required: (value: any) => !!value || 'Este campo es obligatorio.',
        },
        editingData: {} as RoleModel,
    }),
    computed: {
        uuid(): string {
            return this.$route.params.uuid as string;
        },
        company() {
            return useSessionStore().getCompany;
        },
        isEditMode(): boolean {
            return !!this.uuid;
        }
    },
    methods: {
        async fetchRole() {
            if (this.uuid) {
                const role = await AuthProvider.getRoleByUuid(this.uuid);
                console.log(role);

                if (role) {
                    // Establecer los datos del rol para edición
                    this.editingData = { ...role };
                    
                    // Cargar todos los permisos y marcar cuáles están asignados al rol
                    const allPermissions = await AuthProvider.permissionsList();
                    this.itemPermissions = allPermissions.items
                }
            } else {
                // Modo creación: inicializar datos vacíos
                this.editingData = {
                    name: '',
                    description: '',
                    isSystem: false,
                    companyId: this.company?.id || null
                } as RoleModel;
                
                // Cargar todos los permisos como no permitidos por defecto
                const permissions = await AuthProvider.permissionsList();
                this.itemPermissions = permissions.items.map((permission: PermissionModel) => ({
                    ...permission,
                    allowed: false
                }));
            }
        },

        getSelectedPermissions(): PermissionModel[] {
            return this.itemPermissions.filter(permission => permission.allowed);
        },
        async saveChanges() {
            const isValid = (this.$refs.form as any).validate();
            if (!isValid) {
                return;
            }

            try {
                const selectedPermissions = this.getSelectedPermissions();
                
                const roleData: RoleRequest = {
                    name: this.editingData.name,
                    description: this.editingData.description,
                    isSystemRole: this.editingData.isSystem || false,
                    permissions: selectedPermissions.map(p => p.code)
                };

                // Si estamos en modo edición, agregar los campos necesarios
                if (this.isEditMode) {
                    roleData.id = this.editingData.id;
                    roleData.uuid = this.editingData.uuid;
                    roleData.code = this.editingData.code;
                    roleData.companyId = this.editingData.companyId;
                } else {
                    roleData.companyId = this.company?.id || null;
                    roleData.code = this.editingData.name.replace(/\s+/g, '_').toUpperCase();
                }

                const savedRole = await AuthProvider.saveRole(roleData);
                console.log("Role saved:", savedRole);
                
                // Redireccionar o mostrar mensaje de éxito
                this.$router.push('/app/roles');
            } catch (error) {
                console.error("Error saving role:", error);
                // Aquí puedes mostrar un mensaje de error al usuario
            }
        }
    },
    mounted() {
        this.fetchRole();
    }
});
</script>