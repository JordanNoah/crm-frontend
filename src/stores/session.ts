import AccountModel from "@/core/model/account.model";
import CompanyModel from "@/core/model/company.model";
import CountryModel from "@/core/model/country.model";
import { LanguageModel } from "@/core/model/languages.model";
import PluginModel from "@/core/model/plugin.model";
import { defineStore } from "pinia";

export const useSessionStore = defineStore("session", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") as string | null,
    account: null as AccountModel | null,
    company: null as CompanyModel | null,
    installedPlugins: [] as PluginModel[],
  }),
  actions: {
    async checkAccessToken(): Promise<boolean> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(!!this.accessToken);
        }, 1000);
      });
    },
    setAccessToken(token: string | null) {
      this.accessToken = token;

      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    },
    setAccount(account: AccountModel | null) {
      this.account = account;
    },
    setCompany(company: CompanyModel | null) {
      this.company = company;
    },
    setLanguages(languages: LanguageModel[]) {
      if (this.account) {
        this.account.languages = languages;
      }
    },
    setCountry(country: CountryModel | null) {
      if (this.account) {
        this.account.country = country;
      }
    },
    setInstalledPlugins(plugins: PluginModel[]) {
      this.installedPlugins = plugins;
    },
    logout() {
      this.accessToken = null;
      this.setAccessToken(null);
      this.account = null;
      this.company = null;
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    getAccessToken: (state) => state.accessToken,
    getAccount: (state) => state.account,
    getCompany: (state) => state.company,
  },
});
