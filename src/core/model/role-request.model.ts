export interface RoleRequest {
    id?: number;
    uuid?: string;
    name: string;
    code?: string;
    description: string | null;
    isSystemRole: boolean;
    companyId?: number | null;
    permissions: string[]; // Array de códigos de permisos
}

export default RoleRequest;