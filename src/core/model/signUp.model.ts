import CompanyModel from "./company.model";

export default class SignUpModel {
    constructor(
        public company: CompanyModel,
        public email: string,
        public password: string, 
    ) {}
}