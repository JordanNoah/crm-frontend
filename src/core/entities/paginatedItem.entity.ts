export default class PaginationItemEntity<T> {
    constructor(
        public items: T[] = [],
        public total: number = 0
    ) {}
}