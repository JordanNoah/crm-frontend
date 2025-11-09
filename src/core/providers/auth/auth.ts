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
import { ConversationModel } from "@/core/model/chat/conversation.model";
import { ConversationParticipantModel } from "@/core/model/chat/conversationParticipant.model";
import { ConversationMessageModel } from "@/core/model/chat/conversationMessage.model";
import { MessageStatusModel } from "@/core/model/chat/messageStatus.model";

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

    // ==================== CONVERSACIONES ====================

    static async getConversationsByAccount(
        accountId: number,
        options?: { limit?: number; offset?: number }
    ): Promise<ConversationModel[]> {
        const params: any = {};
        if (options?.limit) params.limit = options.limit;
        if (options?.offset) params.offset = options.offset;

        const response = await this.authAxios.get(`/chats/conversations/account/${accountId}`, { params });
        console.log(response);
        
        return response.data.map((item: any) => ConversationModel.fromExternal(item));
    }

    static async getConversationByUuid(uuid: string): Promise<ConversationModel> {
        const response = await this.authAxios.get(`/chats/conversations/${uuid}`);
        return ConversationModel.fromExternal(response.data);
    }

    static async createConversation(data: {
        name: string | null;
        type: 'private' | 'group';
        createdBy: number;
    }): Promise<ConversationModel> {
        const response = await this.authAxios.post('/chats/conversations', data);
        return ConversationModel.fromExternal(response.data);
    }

    static async updateConversation(
        uuid: string,
        data: { name?: string; type?: 'private' | 'group' }
    ): Promise<ConversationModel> {
        const response = await this.authAxios.put(`/chats/conversations/${uuid}`, data);
        return ConversationModel.fromExternal(response.data);
    }

    static async deleteConversation(uuid: string): Promise<void> {
        await this.authAxios.delete(`/chats/conversations/${uuid}`);
    }

    static async getPrivateConversation(
        accountId1: number,
        accountId2: number
    ): Promise<ConversationModel | null> {
        try {
            const response = await this.authAxios.get('/chats/conversations/private', {
                params: { accountId1, accountId2 }
            });
            return response.data ? ConversationModel.fromExternal(response.data) : null;
        } catch {
            return null;
        }
    }

    static async countConversationsByAccount(accountId: number): Promise<number> {
        const response = await this.authAxios.get(`/chats/conversations/account/${accountId}/count`);
        return response.data.count;
    }

    // ==================== PARTICIPANTES ====================

    static async getParticipants(
        conversationId: number,
        includeLeft?: boolean
    ): Promise<ConversationParticipantModel[]> {
        const params: any = {};
        if (includeLeft) params.includeLeft = true;

        const response = await this.authAxios.get(`/chats/participants/conversation/${conversationId}`, { params });
        return response.data.map((item: any) => ConversationParticipantModel.fromExternal(item));
    }

    static async addParticipant(
        conversationId: number,
        accountId: number,
        role: 'admin' | 'member' = 'member'
    ): Promise<ConversationParticipantModel> {
        const response = await this.authAxios.post('/chats/participants', {
            conversationId,
            accountId,
            role
        });
        return ConversationParticipantModel.fromExternal(response.data);
    }

    static async addMultipleParticipants(
        conversationId: number,
        participants: Array<{ accountId: number; role: 'admin' | 'member' }>
    ): Promise<ConversationParticipantModel[]> {
        const response = await this.authAxios.post('/chats/participants/bulk', {
            conversationId,
            participants
        });
        return response.data.map((item: any) => ConversationParticipantModel.fromExternal(item));
    }

    static async removeParticipant(uuid: string): Promise<void> {
        await this.authAxios.delete(`/chats/participants/${uuid}`);
    }

    static async leaveConversation(uuid: string): Promise<ConversationParticipantModel> {
        const response = await this.authAxios.post(`/chats/participants/${uuid}/leave`);
        return ConversationParticipantModel.fromExternal(response.data);
    }

    static async updateParticipantRole(
        uuid: string,
        role: 'admin' | 'member'
    ): Promise<ConversationParticipantModel> {
        const response = await this.authAxios.put(`/chats/participants/${uuid}/role`, { role });
        return ConversationParticipantModel.fromExternal(response.data);
    }

    static async isParticipant(conversationId: number, accountId: number): Promise<boolean> {
        const response = await this.authAxios.get('/chats/participants/check', {
            params: { conversationId, accountId }
        });
        return response.data.isParticipant;
    }

    static async countActiveParticipants(conversationId: number): Promise<number> {
        const response = await this.authAxios.get(`/chats/participants/conversation/${conversationId}/count`);
        return response.data.count;
    }

    // ==================== MENSAJES ====================

    static async getMessagesByConversation(
        conversationId: number,
        options?: {
            limit?: number;
            offset?: number;
            before?: Date;
            after?: Date;
        }
    ): Promise<ConversationMessageModel[]> {
        const params: any = {};
        if (options?.limit) params.limit = options.limit;
        if (options?.offset) params.offset = options.offset;
        if (options?.before) params.before = options.before.toISOString();
        if (options?.after) params.after = options.after.toISOString();

        const response = await this.authAxios.get(`/chats/messages/conversation/${conversationId}`, { params });
        return response.data.map((item: any) => ConversationMessageModel.fromExternal(item));
    }

    static async getMessageByUuid(uuid: string): Promise<ConversationMessageModel> {
        const response = await this.authAxios.get(`/chats/messages/${uuid}`);
        return ConversationMessageModel.fromExternal(response.data);
    }

    static async sendMessage(data: {
        conversationId: number;
        senderId: number;
        content: string;
        metadata?: string;
        replyToId?: number | null;
        file?: File;
    }): Promise<ConversationMessageModel> {
        const formData = new FormData();
        formData.append('conversationId', String(data.conversationId));
        formData.append('senderId', String(data.senderId));
        formData.append('content', data.content);
        
        // Inferir el tipo del archivo si existe
        if (data.file) {
            const mimeType = data.file.type;
            let type: 'text' | 'image' | 'file' | 'audio' | 'video' = 'file';
            
            if (mimeType.startsWith('image/')) {
                type = 'image';
            } else if (mimeType.startsWith('audio/')) {
                type = 'audio';
            } else if (mimeType.startsWith('video/')) {
                type = 'video';
            }
            
            formData.append('type', type);
            formData.append('file', data.file);
        } else {
            formData.append('type', 'text');
        }
        
        if (data.metadata) formData.append('metadata', data.metadata);
        if (data.replyToId) formData.append('replyToId', String(data.replyToId));

        const response = await this.authAxios.post('/chats/messages', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return ConversationMessageModel.fromExternal(response.data);
    }

    static async updateMessage(
        uuid: string,
        data: { content?: string; metadata?: string }
    ): Promise<ConversationMessageModel> {
        const response = await this.authAxios.put(`/chats/messages/${uuid}`, data);
        return ConversationMessageModel.fromExternal(response.data);
    }

    static async deleteMessage(uuid: string): Promise<void> {
        await this.authAxios.delete(`/chats/messages/${uuid}`);
    }

    static async getUnreadMessages(
        conversationId: number,
        accountId: number
    ): Promise<ConversationMessageModel[]> {
        const response = await this.authAxios.get(`/chats/messages/conversation/${conversationId}/unread`, {
            params: { accountId }
        });
        return response.data.map((item: any) => ConversationMessageModel.fromExternal(item));
    }

    static async getLastMessage(conversationId: number): Promise<ConversationMessageModel | null> {
        try {
            const response = await this.authAxios.get(`/chats/messages/conversation/${conversationId}/last`);
            return response.data ? ConversationMessageModel.fromExternal(response.data) : null;
        } catch {
            return null;
        }
    }

    static async searchMessages(
        conversationId: number,
        searchTerm: string,
        options?: { limit?: number; offset?: number }
    ): Promise<ConversationMessageModel[]> {
        const params: any = { q: searchTerm };
        if (options?.limit) params.limit = options.limit;
        if (options?.offset) params.offset = options.offset;

        const response = await this.authAxios.get(`/chats/messages/conversation/${conversationId}/search`, { params });
        return response.data.map((item: any) => ConversationMessageModel.fromExternal(item));
    }

    static async getReplies(messageId: number): Promise<ConversationMessageModel[]> {
        const response = await this.authAxios.get(`/chats/messages/${messageId}/replies`);
        return response.data.map((item: any) => ConversationMessageModel.fromExternal(item));
    }

    static async countMessages(conversationId: number): Promise<number> {
        const response = await this.authAxios.get(`/chats/messages/conversation/${conversationId}/count`);
        return response.data.count;
    }

    static async countUnreadMessages(conversationId: number, accountId: number): Promise<number> {
        const response = await this.authAxios.get(`/chats/messages/conversation/${conversationId}/unread/count`, {
            params: { accountId }
        });
        return response.data.count;
    }

    // ==================== ESTADOS DE MENSAJES ====================

    static async createMessageStatus(data: {
        messageId: number;
        accountId: number;
        status: 'sent' | 'delivered' | 'read';
    }): Promise<MessageStatusModel> {
        const response = await this.authAxios.post('/chats/status', data);
        return MessageStatusModel.fromExternal(response.data);
    }

    static async getStatusByMessage(messageId: number): Promise<MessageStatusModel[]> {
        const response = await this.authAxios.get(`/chats/status/message/${messageId}`);
        return response.data.map((item: any) => MessageStatusModel.fromExternal(item));
    }

    static async markAsDelivered(messageId: number, accountId: number): Promise<MessageStatusModel> {
        const response = await this.authAxios.post('/chats/status/delivered', {
            messageId,
            accountId
        });
        return MessageStatusModel.fromExternal(response.data);
    }

    static async markAsRead(messageId: number, accountId: number): Promise<MessageStatusModel> {
        const response = await this.authAxios.post('/chats/status/read', {
            messageId,
            accountId
        });
        return MessageStatusModel.fromExternal(response.data);
    }

    static async markManyAsRead(messageIds: number[], accountId: number): Promise<number> {
        const response = await this.authAxios.post('/chats/status/read-many', {
            messageIds,
            accountId
        });
        return response.data.count;
    }

    static async markAllAsReadInConversation(conversationId: number, accountId: number): Promise<number> {
        const response = await this.authAxios.post(`/chats/status/conversation/${conversationId}/read-all`, {
            accountId
        });
        return response.data.count;
    }

    static async isReadByAll(messageId: number): Promise<boolean> {
        const response = await this.authAxios.get(`/chats/status/message/${messageId}/read-by-all`);
        return response.data.isReadByAll;
    }

    // ==================== BÚSQUEDA Y FILTROS ====================

    static async searchConversations(accountId: number, query: string): Promise<ConversationModel[]> {
        const response = await this.authAxios.get(`/chats/conversations/account/${accountId}`, {
            params: { search: query }
        });
        return response.data.map((item: any) => ConversationModel.fromExternal(item));
    }

    static async getConversationsWithUnread(accountId: number): Promise<ConversationModel[]> {
        const response = await this.authAxios.get(`/chats/conversations/account/${accountId}`, {
            params: { unreadOnly: true }
        });
        return response.data.map((item: any) => ConversationModel.fromExternal(item));
    }

    // ==================== NOTIFICACIONES Y TIEMPO REAL ====================

    static async getUnreadCount(accountId: number): Promise<number> {
        const response = await this.authAxios.get(`/chats/conversations/account/${accountId}/unread-count`);
        return response.data.count;
    }

    static async muteConversation(conversationId: number, accountId: number, until?: Date): Promise<void> {
        await this.authAxios.post(`/chats/conversations/${conversationId}/mute`, {
            accountId,
            until: until?.toISOString()
        });
    }

    static async unmuteConversation(conversationId: number, accountId: number): Promise<void> {
        await this.authAxios.post(`/chats/conversations/${conversationId}/unmute`, {
            accountId
        });
    }

    // ==================== BÚSQUEDA DE USUARIOS ====================

    static async searchCompanyUsers(companyId: number, searchTerm: string): Promise<AccountModel[]> {
        const response = await this.authAxios.get(`/accounts/company/${companyId}/search`, {
            params: { q: searchTerm }
        });
        return response.data.map((item: any) => AccountModel.fromExternal(item));
    }
}
