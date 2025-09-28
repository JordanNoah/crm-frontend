export default class PluginModel {
    constructor(
        public id: number,
        public uuid: string,
        public name: string,
        public description: string,
        public version: string,
        public image: string,
        public price: number,
        public extra: string | null,
        public createdAt?: Date,
        public updatedAt?: Date,
        public deletedAt?: Date | null,
        public isAdded?: boolean,
        public icon?: string,
        public toName?: string,
    ) { }
    static fromExternal(object: { [key: string]: any }): PluginModel {
        const { id, uuid, name, description, version, image, price, extra, createdAt, updatedAt, deletedAt, isAdded, icon, toName } = object;
        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (name === undefined) throw new Error("name is required");
        if (description === undefined) throw new Error("description is required");
        if (version === undefined) throw new Error("version is required");
        if (image === undefined) throw new Error("image is required");
        if (price === undefined) throw new Error("price is required");
        return new PluginModel(id, uuid, name, description, version, image, price, extra, createdAt, updatedAt, deletedAt, isAdded, icon, toName);
    }
}