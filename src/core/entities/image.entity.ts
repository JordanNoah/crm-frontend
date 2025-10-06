export default class ImageEntity {
    constructor(
        public id: number,
        public url: string,
        public createdAt?: string,
        public updatedAt?: string,
        public deletedAt?: string | null
    ) {}
    static fromExternal(object: { [key: string]: any }): ImageEntity {
        const { id, url, createdAt, updatedAt, deletedAt } = object;
        if (id === undefined || typeof id !== "number") throw new Error("id is required and must be a number");
        if (url === undefined || typeof url !== "string") throw new Error("url is required and must be a string");
        return new ImageEntity(
            id,
            url,
            createdAt,
            updatedAt,
            deletedAt,
        );
    }
}