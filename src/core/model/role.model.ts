import PermissionModel from "./permission.model";
import AccountModel from "./account.model";

export default class RoleModel {
    constructor(
        public id: number,
        public uuid: string,
        public name: string,
        public code: string,
        public description: string | null,
        public isSystem: boolean,
        public companyId: number | null,
        public permissions: PermissionModel[] = [],
        public accounts: AccountModel[] = [],
        public totalUsersCount: number = 0,
        public createdAt?: Date,
        public updatedAt?: Date,
        public deletedAt?: Date | null
    ){}

    static fromExternal(object:{[key:string]: any}): RoleModel {
        const { id, uuid, name, code, description, isSystem, companyId, permissions, accounts, totalUsersCount, createdAt, updatedAt, deletedAt } = object;

        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (name === undefined) throw new Error("name is required");
        if (code === undefined) throw new Error("code is required");
        if (isSystem === undefined) throw new Error("isSystem is required");
        if (companyId === undefined) throw new Error("companyId is required");
        return new RoleModel(
            id,
            uuid,
            name,
            code,
            description ?? null,
            isSystem,
            companyId,
            permissions ? permissions.map((perm: any) => PermissionModel.fromExternal(perm)) : [],
            accounts ? accounts.map((account: any) => AccountModel.fromExternal(account)) : [],
            totalUsersCount ?? 0,
            createdAt,
            updatedAt,
            deletedAt
        );
    }
}