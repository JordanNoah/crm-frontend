import AccountModel from "../account.model";
import { ConversationMessageModel } from "./conversationMessage.model";

export class MessageStatusModel {
    constructor(
        public id: number,
        public uuid: string,
        public messageId: number,
        public accountId: number,
        public status: 'sent' | 'delivered' | 'read',
        public statusAt: Date,
        public createdAt: Date,
        public updatedAt: Date,
        public message?: ConversationMessageModel,
        public account?: AccountModel
    ) {}

    static fromExternal(object: { [key: string]: any }): MessageStatusModel {
        const {
            id,
            uuid,
            messageId,
            accountId,
            status,
            statusAt,
            createdAt,
            updatedAt,
            message,
            account
        } = object;

        if (id === undefined) throw new Error("id is required");
        if (uuid === undefined) throw new Error("uuid is required");
        if (messageId === undefined) throw new Error("messageId is required");
        if (accountId === undefined) throw new Error("accountId is required");
        if (status === undefined) throw new Error("status is required");

        return new MessageStatusModel(
            id,
            uuid,
            messageId,
            accountId,
            status,
            statusAt ? new Date(statusAt) : new Date(),
            createdAt ? new Date(createdAt) : new Date(),
            updatedAt ? new Date(updatedAt) : new Date(),
            message ? ConversationMessageModel.fromExternal(message) : undefined,
            account ? AccountModel.fromExternal(account) : undefined
        );
    }

    // Métodos helper
    get isSent(): boolean {
        return this.status === 'sent';
    }

    get isDelivered(): boolean {
        return this.status === 'delivered';
    }

    get isRead(): boolean {
        return this.status === 'read';
    }

    get statusIcon(): string {
        switch (this.status) {
            case 'sent':
                return '✓';
            case 'delivered':
                return '✓✓';
            case 'read':
                return '✓✓';
            default:
                return '';
        }
    }

    get statusColor(): string {
        switch (this.status) {
            case 'sent':
                return 'gray';
            case 'delivered':
                return 'gray';
            case 'read':
                return 'blue';
            default:
                return 'gray';
        }
    }
}