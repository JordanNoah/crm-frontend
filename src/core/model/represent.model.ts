export default class RepresentModel {
    constructor(
        public id: number,
        public uuid: string,
        public name: string,
        public description: string | null,
        public companyId: number,
        public profileImageUrl: string,
        public file: File | null = null
    ){}

    static fromExternal(object:{[key:string]: any}): RepresentModel {
        const { id, uuid, name, description, companyId, createdAt, updatedAt, deletedAt, profileImageUrl, file } = object;

        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (name === undefined) throw new Error("name is required");
        if (companyId === undefined) throw new Error("companyId is required");
        if (profileImageUrl === undefined) throw new Error("profileImageUrl is required");

        return new RepresentModel(
            id,
            uuid,
            name,
            description,
            companyId,
            profileImageUrl,
            file
        );
    }

    static empty(): RepresentModel {
        return new RepresentModel(
            0,
            '',
            '',
            null,
            0,
            '',
            null
        );
    }
}