import ImageEntity from "../entities/image.entity";
import ProductCategoryModel from "./productCategory.model";

export default class ProductModel {
    constructor(
        public uuid: string,
        public name: string,
        public code: string,
        public description: string | null,
        public price: number,
        public offertPrice: number | null,
        public taxId: number | null,
        public categoryId: number | null,
        public status: number,
        public tags: string | null,
        public companyId: number,
        public images: ImageEntity[],
        public files: File[],
        public category: ProductCategoryModel | null = null,
        public id?: number,
        public createdAt?: Date,
        public updatedAt?: Date,
        public deletedAt?: Date | null
    ){}

    static createEmpty(companyId: number): ProductModel {
        return new ProductModel(
            '',
            '',
            '',
            null,
            0,
            null,
            null,
            null,
            0,
            null,
            companyId,
            [],
            [],
            null
        );
    }

    static fromExternal(object: { [key: string]: any }): ProductModel {
        const { id, uuid, name, code, description, price, offertPrice, taxId, categoryId, status, tags, companyId, createdAt, updatedAt, deletedAt } = object;
        if (id === undefined || typeof id !== "number") throw new Error("id is required and must be a number");
        if (uuid === undefined || typeof uuid !== "string") throw new Error("uuid is required and must be a string");
        if (name === undefined || typeof name !== "string") throw new Error("name is required and must be a string");
        if (code === undefined || typeof code !== "string") throw new Error("code is required and must be a string");
        if (price === undefined) throw new Error("price is required and must be a number");
        if (status === undefined || typeof status !== "number") throw new Error("status is required and must be a number");
        if (companyId === undefined || typeof companyId !== "number") throw new Error("companyId is required and must be a number");
        return new ProductModel(
            uuid,
            name,
            code,
            description,
            Number(price).toFixed(2) as unknown as number,
            offertPrice ? Number(offertPrice).toFixed(2) as unknown as number : null,
            taxId,
            categoryId,
            status,
            JSON.parse(tags ?? 'null'),
            companyId,
            (object.images ?? []).map((imgObj: any) => ImageEntity.fromExternal(imgObj)),
            [],
            object.category ? ProductCategoryModel.fromExternal(object.category) : null,
            id,
            createdAt,
            updatedAt,
            deletedAt
        );
    }
}