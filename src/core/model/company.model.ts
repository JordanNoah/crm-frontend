export default class CompanyModel {
    constructor(
        public identificationNumber: string,
        public socialReason: string,
        public commercialName: string,
        public mobilePhone: string,
        public id?: number,
    ) {}

    static fromExternal(object:{[key:string]: any}): CompanyModel {
        const {id, identificationNumber, socialReason, commercialName, mobilePhone} = object;

        if (!identificationNumber) throw new Error("identificationNumber is required");
        if (!socialReason) throw new Error("socialReason is required");
        if (!commercialName) throw new Error("commercialName is required");
        if (!mobilePhone) throw new Error("mobilePhone is required");

        return new CompanyModel(
            identificationNumber,
            socialReason,
            commercialName,
            mobilePhone,
            id,
        );
    }
}