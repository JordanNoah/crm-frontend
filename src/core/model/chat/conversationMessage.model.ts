import AccountModel from "../account.model";
import { ConversationModel } from "./conversation.model";
import { MessageStatusModel } from "./messageStatus.model";

export class ConversationMessageModel {
    constructor(
        public id: number,
        public uuid: string,
        public conversationId: number,
        public senderId: number,
        public content: string,
        public type: 'text' | 'image' | 'file' | 'audio' | 'video',
        public metadata: string | null,
        public replyToId: number | null,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null,
        public conversation?: ConversationModel,
        public sender?: AccountModel,
        public replyTo?: ConversationMessageModel,
        public replies?: ConversationMessageModel[],
        public statuses?: MessageStatusModel[]
    ) {}

    static fromExternal(object: { [key: string]: any }): ConversationMessageModel {
        const {
            id,
            uuid,
            conversationId,
            senderId,
            content,
            type,
            metadata,
            replyToId,
            createdAt,
            updatedAt,
            deletedAt,
            conversation,
            sender,
            replyTo,
            replies,
            statuses
        } = object;

        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (conversationId === undefined) throw new Error("conversationId is required");
        if (senderId === undefined) throw new Error("senderId is required");
        if (content === undefined) throw new Error("content is required");
        if (type === undefined) throw new Error("type is required");

        return new ConversationMessageModel(
            id,
            uuid,
            conversationId,
            senderId,
            content,
            type,
            metadata || null,
            replyToId || null,
            createdAt ? new Date(createdAt) : new Date(),
            updatedAt ? new Date(updatedAt) : new Date(),
            deletedAt ? new Date(deletedAt) : null,
            conversation ? ConversationModel.fromExternal(conversation) : undefined,
            sender ? AccountModel.fromExternal(sender) : undefined,
            replyTo ? ConversationMessageModel.fromExternal(replyTo) : undefined,
            replies ? replies.map((r: any) => ConversationMessageModel.fromExternal(r)) : undefined,
            statuses ? statuses.map((s: any) => MessageStatusModel.fromExternal(s)) : undefined
        );
    }

    // Métodos helper
    get isText(): boolean {
        return this.type === 'text';
    }

    get isImage(): boolean {
        return this.type === 'image';
    }

    get isFile(): boolean {
        return this.type === 'file';
    }

    get isAudio(): boolean {
        return this.type === 'audio';
    }

    get isVideo(): boolean {
        return this.type === 'video';
    }

    get isReply(): boolean {
        return this.replyToId !== null;
    }

    get hasReplies(): boolean {
        return (this.replies?.length || 0) > 0;
    }

    get parsedMetadata(): any {
        if (!this.metadata) return null;
        try {
            return JSON.parse(this.metadata);
        } catch {
            return null;
        }
    }

    get formattedTime(): string {
        const date = new Date(this.createdAt);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    get formattedDate(): string {
        const date = new Date(this.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    }
}