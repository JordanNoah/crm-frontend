import CountryModel from "./country.model";
import { LanguageModel } from "./languages.model";

export default class AccountModel {
    constructor(
        public id: number,
        public uuid: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public password: string,
        public phoneNumber: string,
        public address: string,
        public state: string,
        public zipCode: string,
        public country: CountryModel | null,
        public timezone: number,
        public languages: LanguageModel[],
        public profileImageUrl: string | null,
        public companyId?: number,
        public createdAt?: Date,
        public updatedAt?: Date,
        public deletedAt?: Date | null,
        public file?: File
    ){}
    static fromExternal(object:{[key:string]: any}): AccountModel {
        const { id, uuid, firstName, lastName, email, password, phoneNumber, address, state, zipCode, country, timezone, companyId, languages, createdAt, updatedAt, deletedAt, profileImageUrl } = object;

        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (firstName === undefined) throw new Error("firstName is required");  
        if (lastName === undefined) throw new Error("lastName is required");
        if (email === undefined) throw new Error("email is required");
        // password puede ser undefined en algunas respuestas
        if (timezone === undefined) throw new Error("timezone is required");
        if (companyId === undefined) throw new Error("companyId is required");

        return new AccountModel(
            id,
            uuid,
            firstName,
            lastName,
            email,
            password ?? '',
            phoneNumber ?? '',
            address ?? '',
            state ?? '',
            zipCode ?? '',
            country ? CountryModel.fromExternal(country) : null,
            timezone,
            languages ? languages.map((lang: any) => LanguageModel.fromExternal(lang)) : [],
            profileImageUrl ?? null,
            companyId,
            createdAt,
            updatedAt,
            deletedAt,
            undefined
        );
    }
}