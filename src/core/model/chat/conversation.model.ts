import AccountModel from "../account.model";
import { ConversationMessageModel } from "./conversationMessage.model";
import { ConversationParticipantModel } from "./conversationParticipant.model";

export class ConversationModel {
    constructor(
        public id: number,
        public uuid: string,
        public name: string | null,
        public type: 'private' | 'group',
        public createdBy: number,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null,
        public creator?: AccountModel,
        public participants?: ConversationParticipantModel[],
        public lastMessage?: ConversationMessageModel,
        public unreadCount?: number
    ) {}

    static fromExternal(object: { [key: string]: any }): ConversationModel {
        const {
            id,
            uuid,
            name,
            type,
            createdBy,
            createdAt,
            updatedAt,
            deletedAt,
            creator,
            participants,
            lastMessage,
            unreadCount
        } = object;

        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (type === undefined) throw new Error("type is required");
        if (createdBy === undefined) throw new Error("createdBy is required");

        return new ConversationModel(
            id,
            uuid,
            name || null,
            type,
            createdBy,
            createdAt ? new Date(createdAt) : new Date(),
            updatedAt ? new Date(updatedAt) : new Date(),
            deletedAt ? new Date(deletedAt) : null,
            creator ? AccountModel.fromExternal(creator) : undefined,
            participants ? participants.map((p: any) => ConversationParticipantModel.fromExternal(p)) : undefined,
            lastMessage ? ConversationMessageModel.fromExternal(lastMessage) : undefined,
            unreadCount
        );
    }

    // Métodos helper
    get isGroup(): boolean {
        return this.type === 'group';
    }

    get isPrivate(): boolean {
        return this.type === 'private';
    }

    get participantCount(): number {
        return this.participants?.length || 0;
    }

    get hasUnreadMessages(): boolean {
        return (this.unreadCount || 0) > 0;
    }
}