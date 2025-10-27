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
import PostModel from "@/core/model/post.model";
import HeadquarterModel from "@/core/model/headquarter.model";
import PaginationEntity from "@/core/entities/pagination.entity";
import PaginationItemEntity from "@/core/entities/paginatedItem.entity";
import ProductModel from "@/core/model/product.model";
import ProductCategoryModel from "@/core/model/productCategory.model";
import TaxModel from "@/core/model/tax.model";
import RepresentModel from "@/core/model/represent.model";
import TagModel from "@/core/model/tags.model";

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
        accountCopy.languages = account.languages ? account.languages.map(lang => lang.id) : [];

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

    static async savePost(post: PostModel): Promise<PostModel> {
        const response = await this.authAxios.post(`/posts`, post);
        return PostModel.fromExternal(response.data);
    }

    static async getCompanyPosts(companyId: number): Promise<PostModel[]> {
        const response = await this.authAxios.get(`/posts/company/${companyId}`);
        return response.data.map((item: any) => PostModel.fromExternal(item));
    }

    static async createHeadquarter(headquarter: HeadquarterModel): Promise<HeadquarterModel> {
        const fd = new FormData();

        const { files, images, ...rest } = headquarter as any;

        for (const [k, v] of Object.entries(rest)) {
            if (v !== undefined && v !== null) fd.append(k, String(v));
        }

        if (headquarter.companyId != null) {
            fd.append('companyId', String(headquarter.companyId));
        }

        if (Array.isArray(files)) {
            for (const f of files) {
                if (f instanceof Blob) {
                    const name = (f as File).name ?? 'upload.bin';
                    fd.append('files', f, name);
                }
            }
        }

        fd.append('images', JSON.stringify(images ?? []));

        const res = await this.authAxios.post('/headquarters', fd, {
            transformRequest: [(data) => data],
        });

        return HeadquarterModel.fromExternal(res.data);
    }

    static async getNextNumberForHeadquarter(companyId: number): Promise<string> {
        const response = await this.authAxios.get(`/headquarters/next-number/${companyId}`);
        return response.data;
    }

    static async getCompanyHeadquarters(companyId: number, paginationEntity: PaginationEntity): Promise<PaginationItemEntity<HeadquarterModel>> {
        const response = await this.authAxios.get(`/headquarters/company/${companyId}`, { params: paginationEntity });
        return new PaginationItemEntity(
            response.data.items.map((item: any) => HeadquarterModel.fromExternal(item)),
            response.data.total
        );
    }

    static async getHeadquarterByUuid(uuid: string): Promise<HeadquarterModel | null> {
        const response = await this.authAxios.get(`/headquarters/${uuid}`);
        return response.data != null ? HeadquarterModel.fromExternal(response.data) : null;
    }

    static async enableHeadquarterMobile(uuids: string[], companyId: number): Promise<void> {
        await this.authAxios.post(`/headquarters/enable-mobile`, { uuids: uuids, companyId: companyId });
    }

    static async disableHeadquarterMobile(uuid: string): Promise<void> {
        await this.authAxios.post(`/headquarters/disable-mobile`, { uuid });
    }

    static async getActiveHeadquarter(companyId: number): Promise<HeadquarterModel[]> {
        const response = await this.authAxios.get(`/headquarters/company/${companyId}/enabled`);
        return response.data.map((item: any) => HeadquarterModel.fromExternal(item));
    }

    static async getProductByUuid(uuid: string): Promise<ProductModel | null> {
        const response = await this.authAxios.get(`/products/${uuid}`);
        return response.data != null ? ProductModel.fromExternal(response.data) : null;
    }

    static async saveCategory(category: ProductCategoryModel): Promise<ProductCategoryModel> {
        const response = await this.authAxios.post(`/products/category`, category);
        return ProductCategoryModel.fromExternal(response.data);
    }

    static async getCategories(companyId: number): Promise<ProductCategoryModel[]> {
        const response = await this.authAxios.get(`/products/category/company/${companyId}`);
        return response.data.map((item: any) => ProductCategoryModel.fromExternal(item));
    }

    static async saveProduct(product: ProductModel): Promise<ProductModel> {
        const fd = new FormData();

        const { images, files, ...rest } = product as any;

        for (const [k, v] of Object.entries(rest)) {
            if (v !== undefined && v !== null) fd.append(k, String(v));
        }

        if (product.companyId != null) {
            fd.append('companyId', String(product.companyId));
        }

        if (Array.isArray(files)) {
            for (const f of files) {
                if (f instanceof Blob) {
                    const name = (f as File).name ?? 'upload.bin';
                    fd.append('files', f, name);
                }
            }
        }

        fd.append('images', JSON.stringify(images ?? []));

        const response = await this.authAxios.post(`/products`, fd, {
            transformRequest: [(data) => data],
        });
        return ProductModel.fromExternal(response.data);
    }

    static async getProducts(companyId: number, paginationEntity: PaginationEntity): Promise<PaginationItemEntity<ProductModel>> {
        const response = await this.authAxios.get(`/products/company/${companyId}`, { params: paginationEntity });

        return new PaginationItemEntity(
            response.data.items.map((item: any) => ProductModel.fromExternal(item)),
            response.data.total
        );
    }

    static async updateProduct(product: ProductModel): Promise<ProductModel> {
        const fd = new FormData();
        const { images, files, ...rest } = product as any;

        for (const [k, v] of Object.entries(rest)) {
            if (v !== undefined && v !== null) fd.append(k, String(v));
        }

        if (product.companyId != null) {
            fd.append('companyId', String(product.companyId));
        }

        if (Array.isArray(files)) {
            for (const f of files) {
                if (f instanceof Blob) {
                    const name = (f as File).name ?? 'upload.bin';
                    fd.append('files', f, name);
                }
            }
        }
        fd.append('images', JSON.stringify(images ?? []));
        const response = await this.authAxios.put(`/products`, fd, {
            transformRequest: [(data) => data],
        });
        return ProductModel.fromExternal(response.data);
    }

    static async getTaxRates(): Promise<TaxModel[]> {
        const response = await this.authAxios.get(`/taxes`);
        return response.data.map((item: any) => TaxModel.fromExternal(item));
    }

    static async getProductsByString(companyId: number, search: string, headquarterId: number): Promise<ProductModel[]> {
        const response = await this.authAxios.post(`/products/company/search`, {
            companyId, search, headquarterId
        });
        return response.data.map((item: any) => ProductModel.fromExternal(item));
    }

    static async addProductToHeadquarter(idHeadquarter: number, idProduct: number, stock: number): Promise<void> {
        await this.authAxios.post(`products/headquarter-product/add`, { idProduct, idHeadquarter, stock });
    }

    static async getProductsByHeadquarter(idHeadquarter: number): Promise<ProductModel[]> {
        const response = await this.authAxios.post(`products/headquarter-product`, {
            idHeadquarter
        });
        return response.data.map((item: any) => ProductModel.fromExternal(item.product));
    }

    static async removeProductFromHeadquarter(idHeadquarter: number, idProduct: number): Promise<void> {
        await this.authAxios.post(`products/headquarter-product/remove`, { idProduct, idHeadquarter });
    }

    static async addProductToAllDomains(idProduct: number, companyId: number): Promise<void> {
        await this.authAxios.post(`/products/headquarter-product/add-all-domain`, { idProduct, companyId });
    }

    static async uploadProfilePhoneImage(image: File, companyId: number): Promise<string> {
        const fd = new FormData();
        fd.append('image', image);
        fd.append('companyId', String(companyId));
        const response = await this.authAxios.post(`/plugins/company/profile/phone-image`, fd, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
        return response.data.url;
    }

    static async getProfilePhoneImageUrl(companyId: number): Promise<string | null> {
        const response = await this.authAxios.get(`/plugins/company/profile/phone-image/${companyId}`);
        return response.data.url;
    }

    static async upsertRepresent(represent: RepresentModel): Promise<RepresentModel> {
        const formData = new FormData();
        formData.append('id', String(represent.id));
        formData.append('uuid', represent.uuid);
        formData.append('name', represent.name);
        formData.append('description', represent.description ?? '');
        formData.append('companyId', String(represent.companyId));
        formData.append('profileImageUrl', represent.profileImageUrl ?? '');
        if (represent.file) {
            formData.append('file', represent.file);
        }

        const response = await this.authAxios.post(`/represents`, formData, {
            transformRequest: [(data) => data],
        });
        return RepresentModel.fromExternal(response.data);
    }

    static async getCompanyRepresent(companyId: number): Promise<RepresentModel> {
        const response = await this.authAxios.get(`/represents/company/${companyId}`);
        return response.data ? RepresentModel.fromExternal(response.data) : RepresentModel.empty();
    }

    static async getAllTags(): Promise<TagModel[]> {
        const response = await this.authAxios.get('/tags');
        return response.data.map((item: any) => TagModel.fromExternal(item));
    }

    static async getTagsByHeadquarter(headquarterId: number): Promise<TagModel[]> {
        const response = await this.authAxios.get(`/headquarter-tags/headquarter/${headquarterId}`);
        const associations = response.data.tags || [];

        if (associations.length === 0) return [];

        const tagIds = associations.map((assoc: any) => assoc.tagId).join(',');
        const tagsResponse = await this.authAxios.get(`/tags/by-ids?ids=${tagIds}`);

        return tagsResponse.data.map((item: any) => TagModel.fromExternal(item));
    }

    static async assignTagsToHeadquarter(headquarterId: number, tagIds: number[]): Promise<void> {
        await this.authAxios.post(`/headquarter-tags/headquarter/${headquarterId}/assign-tags`, {
            tagIds: tagIds
        });
    }

    static async removeAllTagsFromHeadquarter(headquarterId: number): Promise<void> {
        await this.authAxios.delete(`/headquarter-tags/headquarter/${headquarterId}/all`);
    }

    static async syncTagsToHeadquarter(headquarterId: number, tagIds: number[]): Promise<void> {
        await this.removeAllTagsFromHeadquarter(headquarterId);

        if (tagIds.length > 0) {
            await this.assignTagsToHeadquarter(headquarterId, tagIds);
        }
    }

}
