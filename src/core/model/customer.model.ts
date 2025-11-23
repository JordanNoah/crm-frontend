export default class CustomerModel {
    constructor(
        public id: number,
        public uuid: string,
        public name: string,
        public email: string,
        public phone: string,
        public address: string,
        public identificationNumber: string,
        public country: string,
        public companyId: number,
        public profileImageUrl: string | null,
        public isDeleted: boolean,
        public createdAt?: string,
        public updatedAt?: string,
        public deletedAt?: string | null,
        public file?: File
    ) {}

    static fromExternal(object: { [key: string]: any }): CustomerModel {
        const {
            id,
            uuid,
            name,
            email,
            phone,
            address,
            identificationNumber,
            country,
            companyId,
            profileImageUrl,
            isDeleted,
            createdAt,
            updatedAt,
            deletedAt
        } = object;

        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (name === undefined) throw new Error("name is required");
        if (email === undefined) throw new Error("email is required");
        if (phone === undefined) throw new Error("phone is required");
        if (address === undefined) throw new Error("address is required");
        if (identificationNumber === undefined) throw new Error("identificationNumber is required");
        if (country === undefined) throw new Error("country is required");
        if (companyId === undefined) throw new Error("companyId is required");

        return new CustomerModel(
            id,
            uuid,
            name,
            email,
            phone,
            address,
            identificationNumber,
            country,
            companyId,
            profileImageUrl ?? null,
            isDeleted ?? false,
            createdAt ?? undefined,
            updatedAt ?? undefined,
            deletedAt ?? null,
            undefined
        );
    }

    static empty(companyId: number): CustomerModel {
        return new CustomerModel(
            0,
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            companyId,
            null,
            false,
            undefined,
            undefined,
            null,
            undefined
        );
    }

    toJSON() {
        return {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            identificationNumber: this.identificationNumber,
            country: this.country,
            companyId: this.companyId,
            profileImageUrl: this.profileImageUrl,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deletedAt: this.deletedAt
        };
    }
}
