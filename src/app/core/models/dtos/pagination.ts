export class Pagination{
    page : number;
    pageSize : number;
    totalItems : number;
    totalPages : number;
    hasNext : boolean;
    hasPrevious : boolean;

    constructor() {
        this.page = 0;
        this.pageSize = 0;
        this.totalItems = 0;
        this.totalPages = 0;
        this.hasNext = false;
        this.hasPrevious = false;
    }
} 