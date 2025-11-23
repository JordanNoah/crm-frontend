export default class PermissionModel {
    constructor(
        public id: number,
        public name: string,
        public code: string,
        public description: string | null,
        public module: string,
        public createdAt?: Date,
        public updatedAt?: Date,
        public allowed?: boolean
    ) { }

    static fromExternal(object: { [key: string]: any }): PermissionModel {
        const { id, name, code, description, module, createdAt, updatedAt, allowed } = object;
        
        if (id === undefined) throw new Error("id is required");
        if (name === undefined) throw new Error("name is required");
        if (code === undefined) throw new Error("code is required");
        if (module === undefined) throw new Error("module is required");
        return new PermissionModel(
            id,
            name,
            code,
            description ?? null,
            module,
            createdAt,
            updatedAt,
            allowed || false
        );
    }
}