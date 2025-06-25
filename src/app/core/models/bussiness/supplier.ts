export class Supplier{
    id : string;
    userId : string;
    companyName : string;
    businessDescription : string;
    businessAddress : string;
    website : string;
    businessEmail : string;
    businessPhone : string;
    isVerified : boolean;
    rating : number;
    totalReviews : number;
    isActive : boolean;
    createdAt : string;
    updatedAt : string;

    constructor() {
        this.id = "";
        this.userId = "";
        this.companyName = "";
        this.businessDescription = "";
        this.businessAddress = "";
        this.website = "";
        this.businessEmail = "";
        this.businessPhone = "";
        this.isVerified = false;
        this.rating = 0;
        this.totalReviews = 0;
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
    }
} 