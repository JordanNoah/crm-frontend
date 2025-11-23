export interface UserRequest {
    id?: number;
    uuid?: string;
    firstName: string;
    lastName: string;
    username?: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    state?: string;
    zipCode?: string;
    countryId?: number | null;
    timezone?: number;
    companyId?: number | null;
    languageIds?: number[];
    roleIds?: number[];
    password?: string;
}

export default UserRequest;