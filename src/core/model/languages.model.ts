export class LanguageModel {
    constructor(
        public id: number,
        public uuid: string,
        public abbreviation: string,
        public translations: Record<string, string>,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null,
        public name?: string, // Para uso local, no viene del backend
    ){}

    static fromExternal (object:{[key:string]: any}): LanguageModel {
        const { id, uuid, abbreviation, translations, createdAt, updatedAt, deletedAt } = object;
        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (abbreviation === undefined) throw new Error("abbreviation is required");
        if (translations === undefined) throw new Error("translations is required");
        if (createdAt === undefined) throw new Error("createdAt is required");
        if (updatedAt === undefined) throw new Error("updatedAt is required");
        // deletedAt can be null
        return new LanguageModel(id, uuid, abbreviation, JSON.parse(translations), createdAt, updatedAt, deletedAt, JSON.parse(translations)['es']);
    }
}