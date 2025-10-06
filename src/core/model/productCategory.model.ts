import ImageEntity from "../entities/image.entity";

export default class ProductCategoryModel {
    constructor(
        public uuid: string,
        public name: string,
        public description: string | null,
        public companyId: number,
        public id?: number,
        public createdAt?: Date,
        public updatedAt?: Date,
        public deletedAt?: Date | null,
    ){}

    static fromExternal(object:{[key:string]: any}): ProductCategoryModel {
        if (!object.uuid) throw new Error("uuid is required");
        if (!object.name) throw new Error("name is required");
        if (object.companyId === undefined || object.companyId === null) throw new Error("companyId is required");
        return new ProductCategoryModel(
            object.uuid,
            object.name,
            object.description ?? null,
            object.companyId,
            object.id,
            object.createdAt ? new Date(object.createdAt) : undefined,
            object.updatedAt ? new Date(object.updatedAt) : undefined,
            object.deletedAt ? new Date(object.deletedAt) : null,
        );
    }
}