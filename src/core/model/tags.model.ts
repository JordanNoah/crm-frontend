export default class TagModel {
    constructor(
        public id: number,
        public uuid: string,
        public name: string,
        public color: string | null,
        public icon: string | null,
        public createdAt?: Date,
        public updatedAt?: Date,
        public deletedAt?: Date | null
    ) {}
    
    static fromExternal(object: { [key: string]: any }): TagModel {
        const { id, uuid, name, color, icon, createdAt, updatedAt, deletedAt } = object;
        if (id === undefined || typeof id !== "number") throw new Error("id is required and must be a number");
        if (uuid === undefined || typeof uuid !== "string") throw new Error("uuid is required and must be a string");
        if (name === undefined || typeof name !== "string") throw new Error("name is required and must be a string");
        if (color === undefined || typeof color !== "string") throw new Error("color is required and must be a string");
        if (icon === undefined || typeof icon !== "string") throw new Error("icon is required and must be a string");
        return new TagModel(
            id,
            uuid,
            name,
            color,
            icon,
            createdAt,
            updatedAt,
            deletedAt
        );
    }
}