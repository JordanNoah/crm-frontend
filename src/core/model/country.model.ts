export default class CountryModel {
    constructor(
        public id: number,
        public uuid: string,
        public phoneExtension: string,
        public code: string,
        public flagCode: string,
        public translations: Record<string, string>,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null,
        public name?: string, // Para uso local, no viene del backend
    ) { }
    
    static fromExternal(object: { [key: string]: any }): CountryModel {
        const { id, uuid, phoneExtension, code, flagCode, translations, createdAt, updatedAt, deletedAt } = object;
        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (phoneExtension === undefined) throw new Error("phoneExtension is required");
        if (code === undefined) throw new Error("code is required");
        if (flagCode === undefined) throw new Error("flagCode is required");
        if (translations === undefined) throw new Error("translations is required");
        if (createdAt === undefined) throw new Error("createdAt is required");
        if (updatedAt === undefined) throw new Error("updatedAt is required");
        // deletedAt can be null

        return new CountryModel(
            id,
            uuid,
            phoneExtension,
            code,
            flagCode,
            JSON.parse(translations),
            createdAt,
            updatedAt,
            deletedAt,
            JSON.parse(translations)['es']
        );
    }
}