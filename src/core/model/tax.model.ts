export default class TaxModel {
    constructor(
        public uuid: string,
        public name: string,
        public code: string,
        public id?: number,
        public createdAt?: Date,
        public updatedAt?: Date,
        public deletedAt?: Date | null
    ){}

    static fromExternal(object:{[key:string]: any}): TaxModel {
        if (!object.uuid) throw new Error("uuid is required");
        if (!object.name) throw new Error("name is required");
        if (!object.code) throw new Error("code is required");

        return new TaxModel(
            object.uuid,
            object.name,
            object.code,
            object.id,
            object.createdAt ? new Date(object.createdAt) : undefined,
            object.updatedAt ? new Date(object.updatedAt) : undefined,
            object.deletedAt ? new Date(object.deletedAt) : null
        );
    }
}