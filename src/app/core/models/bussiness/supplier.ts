export class Supplier{
    id : string;
    userId : string;
    companyName : string | null;
    businessDescription : string | null;
    businessAddress : string | null;
    website : string | null;
    businessEmail : string | null;
    businessPhone : string | null;
    isVerified : boolean;
    rating : number;
    totalReviews : number;
    isActive : boolean;
    createdAt : string; // format: date-time
    updatedAt : string; // format: date-time

    constructor() {
        this.id = "";
        this.userId = "";
        this.companyName = null;
        this.businessDescription = null;
        this.businessAddress = null;
        this.website = null;
        this.businessEmail = null;
        this.businessPhone = null;
        this.isVerified = false;
        this.rating = 0;
        this.totalReviews = 0;
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
    }
} 