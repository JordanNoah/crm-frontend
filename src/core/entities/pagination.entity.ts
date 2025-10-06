export default class PaginationEntity {
    constructor(
        public page: number = 1,
        public limit: number = 10,
        public offset: number = 0,
        public sort: string = 'id',
        public order: string = 'asc',
        public search: string = ''
    ) {}
}