import AccountModel from "../account.model";
import { ConversationModel } from "./conversation.model";

export class ConversationParticipantModel {
    constructor(
        public id: number,
        public uuid: string,
        public conversationId: number,
        public accountId: number,
        public role: 'admin' | 'member',
        public joinedAt: Date,
        public leftAt: Date | null,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null,
        public conversation?: ConversationModel,
        public account?: AccountModel
    ) {}

    static fromExternal(object: { [key: string]: any }): ConversationParticipantModel {
        const {
            id,
            uuid,
            conversationId,
            accountId,
            role,
            joinedAt,
            leftAt,
            createdAt,
            updatedAt,
            deletedAt,
            conversation,
            account
        } = object;

        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (conversationId === undefined) throw new Error("conversationId is required");
        if (accountId === undefined) throw new Error("accountId is required");
        if (role === undefined) throw new Error("role is required");

        return new ConversationParticipantModel(
            id,
            uuid,
            conversationId,
            accountId,
            role,
            joinedAt ? new Date(joinedAt) : new Date(),
            leftAt ? new Date(leftAt) : null,
            createdAt ? new Date(createdAt) : new Date(),
            updatedAt ? new Date(updatedAt) : new Date(),
            deletedAt ? new Date(deletedAt) : null,
            conversation ? ConversationModel.fromExternal(conversation) : undefined,
            account ? AccountModel.fromExternal(account) : undefined
        );
    }

    // Métodos helper
    get isAdmin(): boolean {
        return this.role === 'admin';
    }

    get isMember(): boolean {
        return this.role === 'member';
    }

    get isActive(): boolean {
        return this.leftAt === null;
    }

    get hasLeft(): boolean {
        return this.leftAt !== null;
    }
}