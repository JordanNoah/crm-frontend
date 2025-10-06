export default class PostModel {
    constructor(
        public title: string,
        public content: string,
        public authorId: number,
        public companyId: number,
        public id?: number,
        public uuid?: string,
        public createdAt?: string,
        public updatedAt?: string,
    ){}
    static fromExternal(object: { [key: string]: any }): PostModel {
        const { title, content, authorId, companyId, id, uuid, createdAt, updatedAt } = object;
        if (title === undefined) throw new Error("title is required");
        if (content === undefined) throw new Error("content is required");
        if (authorId === undefined) throw new Error("authorId is required");
        if (companyId === undefined) throw new Error("companyId is required");
        if (id !== undefined && typeof id !== "number") throw new Error("id must be a number");
        if (uuid !== undefined && typeof uuid !== "string") throw new Error("uuid must be a string");
        
        return new PostModel(
            title,
            content,
            authorId,
            companyId,
            id,
            uuid,
            createdAt,
            updatedAt
        );
    }
}