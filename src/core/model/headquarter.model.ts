import ImageEntity from "../entities/image.entity";
import TagModel from "./tags.model";

export default class HeadquarterModel {
    constructor(
        public uuid: string,
        public address: string,
        public city: string,
        public state: string,
        public companyId: number,
        public files: File[],
        public images: ImageEntity[],
        public number?: string,
        public description?: string,
        public enableMobile: boolean = false,
        public id?: number,
        public createdAt?: string,
        public updatedAt?: string,
        public deletedAt?: string | null,
        public tags?: TagModel[],
    ) { }

    static fromExternal(object: { [key: string]: any }): HeadquarterModel {
        const { id, uuid, address, number, city, state, createdAt, updatedAt, deletedAt, companyId, images, description, enableMobile } = object;
        if (id === undefined || typeof id !== "number") throw new Error("id is required and must be a number");
        if (uuid === undefined || typeof uuid !== "string") throw new Error("uuid is required and must be a string");
        if (address === undefined || typeof address !== "string") throw new Error("address is required and must be a string");
        if (city === undefined || typeof city !== "string") throw new Error("city is required and must be a string");
        if (state === undefined || typeof state !== "string") throw new Error("state is required and must be a string");
        if (companyId === undefined || typeof companyId !== "number") throw new Error("companyId is required and must be a number");
        return new HeadquarterModel(
            uuid,
            address,
            city,
            state,
            companyId,
            [],
            images.map((img: any) => ImageEntity.fromExternal(img)),
            number,
            description,
            enableMobile ?? false,
            id,
            createdAt,
            updatedAt,
            deletedAt,
        );
    }

    static newCleaner(): HeadquarterModel {
        return new HeadquarterModel(
            '',
            '',
            '',
            '',
            0,
            [],
            [],
            '',
            '',
            false,
        )
    }
}