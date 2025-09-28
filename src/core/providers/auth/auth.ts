import { AxiosInstance } from "axios";
import Provider from "@/plugins/provider";
import SessionEntity from "@/core/entities/session.entity";
import SignUpModel from "@/core/model/signUp.model";
import SessionModel from "@/core/model/session.model";
import AccountModel from "@/core/model/account.model";
import CompanyModel from "@/core/model/company.model";
import CountryModel from "@/core/model/country.model";
import { LanguageModel } from "@/core/model/languages.model";
import PluginModel from "@/core/model/plugin.model";

export default class AuthProvider {
    private static readonly authAxios: AxiosInstance = Provider.getInstance("auth", {
            baseURL: process.env.VUE_APP_API_URL || "https://api.midominio.com/auth",
        });
    
    static setToken(token: string) {
        this.authAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    static async login(session: SessionEntity): Promise<SessionModel> {
        const response = await this.authAxios.post("/auth/login", session);
        return SessionModel.fromExternal(response.data);
    }

    static async getProfile() {
        const response = await this.authAxios.get("/auth/profile");
        return response.data;
    }

    static async SignUp(signUp: SignUpModel): Promise<SessionModel> {
        const response = await this.authAxios.post("/auth/sign-up", signUp);
        return SessionModel.fromExternal(response.data);
    }

    static async whoAmI(): Promise<{ account: AccountModel, company: CompanyModel }> {
        const response = await this.authAxios.get("/auth/whoami");
        return {
            account: AccountModel.fromExternal(response.data.account),
            company: CompanyModel.fromExternal(response.data.company),
        };
    }

    static async getCountries(): Promise<CountryModel[]> {
        const response = await this.authAxios.get("/countries");
        return response.data.map((item: any) => CountryModel.fromExternal(item));
    }

    static async getLanguages(): Promise<LanguageModel[]> {
        const response = await this.authAxios.get("/languages");
        return response.data.map((item: any) => LanguageModel.fromExternal(item));
    }

    static async updateProfile(account: AccountModel): Promise<AccountModel> {
        const accountCopy = { ...account } as any;
        accountCopy.country = account.country ? account.country.id : null;
        accountCopy.languages   = account.languages ? account.languages.map(lang => lang.id) : [];

        const fd = new FormData();
        for (const key in accountCopy) {
            if (accountCopy[key] !== undefined && accountCopy[key] !== null) {
                fd.append(key, accountCopy[key]);
            }
        }

        const response = await this.authAxios.post("/accounts", fd, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });

        return AccountModel.fromExternal(response.data.account);
    }

    static async getPlugins(companyId: number): Promise<PluginModel[]> {
        const response = await this.authAxios.get(`/plugins/${companyId}`);
        return response.data.map((item: any) => PluginModel.fromExternal(item));
    }

    static async addPlugin(pluginUuid: string, companyId: number): Promise<void> {
        await this.authAxios.post(`/plugins/company`, { pluginUuid, companyId });
    }

    static async removePlugin(pluginUuid: string, companyId: number): Promise<void> {
        await this.authAxios.delete(`/plugins/remove/company`, { data: { pluginUuid, companyId } });
    }

    static async getActivatedPlugins(companyId: number): Promise<PluginModel[]> {
        const response = await this.authAxios.get(`/plugins/company/activated/${companyId}`);
        return response.data.map((item: any) => PluginModel.fromExternal(item));
    }
}
