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
        if (password === undefined) throw new Error("password is required");
        if (phoneNumber === undefined) throw new Error("phoneNumber is required");
        if (address === undefined) throw new Error("address is required");
        if (state === undefined) throw new Error("state is required");
        if (zipCode === undefined) throw new Error("zipCode is required");
        if (country === undefined) throw new Error("country is required");
        if (timezone === undefined) throw new Error("timezone is required");
        if (companyId === undefined) throw new Error("companyId is required");
        if (languages === undefined) throw new Error("languages is required");
        if (profileImageUrl === undefined) throw new Error("profileImageUrl is required");

        return new AccountModel(
            id,
            uuid,
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            address,
            state,
            zipCode,
            country ? CountryModel.fromExternal(country) : null,
            timezone,
            languages.map((lang: any) => LanguageModel.fromExternal(lang)),
            profileImageUrl,
            companyId,
            createdAt,
            updatedAt,
            deletedAt,
            undefined
        );
    }
}