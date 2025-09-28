import AccountModel from "./account.model";
import CompanyModel from "./company.model";

export default class SessionModel {
    constructor(
        public company: CompanyModel,
        public account: AccountModel,
        public token: string
    ) {}

    static fromExternal(object:{[key:string]: any}): SessionModel {
        if (!object.account) throw new Error("account is required");
        if (!object.company) throw new Error("company is required");
        if (!object.token) throw new Error("token is required");
        return new SessionModel(
            CompanyModel.fromExternal(object.company),
            AccountModel.fromExternal(object.account),
            object.token
        );
    }
}